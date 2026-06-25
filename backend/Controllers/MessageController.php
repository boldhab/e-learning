<?php

namespace Controllers;

use Core\Database;
use Core\JwtHandler;
use Models\DiscussionGroup;
use Models\Message;
use Models\User;
use Utils\FileUploader;

class MessageController {
    private const SUPER_GROUP_CONTACT_ID = 'super_group';
    private const DISCUSSION_GROUP_CONTACT_PREFIX = 'discussion_group_';
    private $messageModel;
    private $discussionGroupModel;
    private $userModel;
    private $db;

    public function __construct() {
        $this->messageModel = new Message();
        $this->discussionGroupModel = new DiscussionGroup();
        $this->userModel = new User();
        $this->db = Database::getInstance()->getConnection();
    }

    private function getAuthorizationHeader() {
        $headers = function_exists('getallheaders') ? getallheaders() : [];

        foreach ($headers as $key => $value) {
            if (strcasecmp($key, 'Authorization') === 0) {
                return $value;
            }
        }

        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }

        if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        return '';
    }

    private function auth() {
        $authHeader = $this->getAuthorizationHeader();

        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return false;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            return false;
        }

        return $decoded;
    }

    private function buildUploadUrl($path) {
        if (!$path) {
            return null;
        }

        if (preg_match('#^https?://#i', $path)) {
            return $path;
        }

        $normalizedPath = ltrim(str_replace('\\', '/', $path), '/');
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $basePath = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');

        return $basePath . '/Uploads/' . $normalizedPath;
    }

    private function transformMessage($message) {
        $message['attachment_url'] = $this->buildUploadUrl($message['attachment_url'] ?? null);
        return $message;
    }

    private function canAccessGroup($user, $classId) {
        $classId = (int) $classId;

        if ($user['role'] === 'student') {
            $student = $this->userModel->findById($user['id']);
            return $student && (int) ($student['class_id'] ?? 0) === $classId;
        }

        if ($user['role'] === 'teacher') {
            return in_array($classId, $this->getAssignedTeacherClassIds($user['id']), true);
        }

        return false;
    }

    private function getSystemGroupPayload($group, $kind = 'class') {
        return [
            'contact_id' => 'group_' . $group['class_id'],
            'contact_name' => $group['name'],
            'contact_role' => 'group',
            'is_group' => true,
            'class_id' => (int) $group['class_id'],
            'group_kind' => $kind
        ];
    }

    private function canAccessSuperGroup($user) {
        return ($user['role'] ?? null) === 'student';
    }

    private function getAccessibleDiscussionGroups($user) {
        if (($user['role'] ?? null) === 'teacher') {
            $stmt = $this->db->prepare("
                SELECT DISTINCT dg.id, dg.name, dg.description, dg.course_id, dg.teacher_id,
                       c.title AS course_title,
                       cl.name AS class_name,
                       s.name  AS subject_name
                FROM discussion_groups dg
                JOIN courses c            ON c.id     = dg.course_id
                LEFT JOIN classes cl       ON cl.id    = dg.class_id
                LEFT JOIN subjects s       ON s.id     = dg.subject_id
                LEFT JOIN class_assignments ca
                    ON ca.class_id = c.class_id
                    AND ca.teacher_id = :user_id
                WHERE c.instructor_id = :user_id
                   OR dg.teacher_id = :user_id
                   OR ca.id IS NOT NULL
                ORDER BY dg.created_at ASC
            ");
            $stmt->execute(['user_id' => $user['id']]);
            return $stmt->fetchAll();
        }

        if (($user['role'] ?? null) === 'student') {
            $stmt = $this->db->prepare("
                SELECT DISTINCT dg.id, dg.name, dg.description, dg.course_id, dg.teacher_id,
                       c.title AS course_title,
                       cl.name AS class_name,
                       s.name  AS subject_name
                FROM discussion_groups dg
                JOIN courses c            ON c.id     = dg.course_id
                JOIN student_enrollments se ON se.class_id = c.class_id
                LEFT JOIN classes cl       ON cl.id    = dg.class_id
                LEFT JOIN subjects s       ON s.id     = dg.subject_id
                WHERE se.student_id = :user_id
                ORDER BY dg.created_at ASC
            ");
            $stmt->execute(['user_id' => $user['id']]);
            return $stmt->fetchAll();
        }

        return [];
    }

    private function canAccessDiscussionGroup($user, $groupId) {
        $groupId = (int) $groupId;

        foreach ($this->getAccessibleDiscussionGroups($user) as $group) {
            if ((int) $group['id'] === $groupId) {
                return $group;
            }
        }

        return false;
    }

    private function getDiscussionGroupPayload($group) {
        return [
            'contact_id'          => self::DISCUSSION_GROUP_CONTACT_PREFIX . $group['id'],
            'contact_name'        => $group['name'],
            'contact_role'        => 'group',
            'is_group'            => true,
            'group_kind'          => 'teacher_created',
            'discussion_group_id' => (int) $group['id'],
            'course_id'           => (int) $group['course_id'],
            'course_title'        => $group['course_title']  ?? null,
            'class_name'          => $group['class_name']    ?? null,
            'subject_name'        => $group['subject_name']  ?? null,
            'description'         => $group['description']   ?? null
        ];
    }

    private function canMessageDirectly($user, $contactId) {
        $contactId = (int) $contactId;

        if ($contactId <= 0 || $contactId === (int) $user['id']) {
            return false;
        }

        if ($user['role'] === 'student') {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) AS total
                FROM class_assignments ca
                JOIN users student ON student.class_id = ca.class_id
                JOIN users teacher ON teacher.id = ca.teacher_id
                WHERE student.id = :student_id
                  AND teacher.id = :teacher_id
                  AND teacher.role = 'teacher'
            ");
            $stmt->execute([
                'student_id' => $user['id'],
                'teacher_id' => $contactId
            ]);

            return (int) $stmt->fetch()['total'] > 0;
        }

        if ($user['role'] === 'teacher') {
            $stmt = $this->db->prepare("
                SELECT COUNT(*) AS total
                FROM class_assignments ca
                JOIN users student ON student.class_id = ca.class_id
                WHERE ca.teacher_id = :teacher_id
                  AND student.id = :student_id
                  AND student.role = 'student'
            ");
            $stmt->execute([
                'teacher_id' => $user['id'],
                'student_id' => $contactId
            ]);

            return (int) $stmt->fetch()['total'] > 0;
        }

        return false;
    }

    private function parsePayload() {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';

        if (stripos($contentType, 'multipart/form-data') !== false) {
            return $_POST;
        }

        $raw = json_decode(file_get_contents('php://input'), true);
        return is_array($raw) ? $raw : [];
    }

    private function uploadAttachment() {
        if (empty($_FILES['attachment']) || !is_array($_FILES['attachment'])) {
            return ['url' => null, 'type' => null];
        }

        $uploadResult = FileUploader::upload($_FILES['attachment'], 'messages');
        if (is_array($uploadResult) && isset($uploadResult['error'])) {
            http_response_code(400);
            echo json_encode(['error' => $uploadResult['error']]);
            return false;
        }

        return [
            'url' => $uploadResult,
            'type' => 'image'
        ];
    }

    public function getConversations() {
        $user = $this->auth();
        if (!$user) {
            return;
        }

        $this->discussionGroupModel->syncSystemGroups();

        $conversations = $this->messageModel->getConversations($user['id']);

        if ($user['role'] === 'student') {
            array_unshift($conversations, [
                'contact_id' => self::SUPER_GROUP_CONTACT_ID,
                'contact_name' => 'All Students Super Group',
                'contact_role' => 'group',
                'is_group' => true,
                'group_kind' => 'super'
            ]);

            $studentGroups = $this->discussionGroupModel->getForStudent($user['id']);
            foreach (array_reverse($studentGroups) as $group) {
                array_splice($conversations, 1, 0, [$this->getSystemGroupPayload($group)]);
            }

            foreach ($this->getAccessibleDiscussionGroups($user) as $group) {
                $conversations[] = $this->getDiscussionGroupPayload($group);
            }
        }

        if ($user['role'] === 'teacher') {
            foreach ($this->discussionGroupModel->getForTeacher($user['id']) as $group) {
                $conversations[] = $this->getSystemGroupPayload($group);
            }

            foreach ($this->getAccessibleDiscussionGroups($user) as $group) {
                $conversations[] = $this->getDiscussionGroupPayload($group);
            }
        }

        echo json_encode([
            'status' => 'success',
            'conversations' => $conversations
        ]);
    }

    public function getMessages() {
        $user = $this->auth();
        if (!$user) {
            return;
        }

        $contactId = $_GET['contact_id'] ?? null;
        if (!$contactId) {
            http_response_code(400);
            echo json_encode(['error' => 'contact_id is required']);
            return;
        }

        if ($contactId === self::SUPER_GROUP_CONTACT_ID) {
            if (!$this->canAccessSuperGroup($user)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $messages = array_map([$this, 'transformMessage'], $this->messageModel->getSuperGroupMessages());
        } elseif (strpos($contactId, self::DISCUSSION_GROUP_CONTACT_PREFIX) === 0) {
            $groupId = (int) substr($contactId, strlen(self::DISCUSSION_GROUP_CONTACT_PREFIX));
            if (!$this->canAccessDiscussionGroup($user, $groupId)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $messages = array_map([$this, 'transformMessage'], $this->messageModel->getDiscussionGroupMessages($groupId));
        } elseif (strpos($contactId, 'group_') === 0) {
            $classId = (int) substr($contactId, 6);

            if (!$this->canAccessGroup($user, $classId)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $messages = array_map([$this, 'transformMessage'], $this->messageModel->getGroupMessages($classId));
        } else {
            if (!$this->canMessageDirectly($user, $contactId)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $messages = array_map([$this, 'transformMessage'], $this->messageModel->getMessages($user['id'], $contactId));
        }

        echo json_encode([
            'status' => 'success',
            'messages' => $messages
        ]);
    }

    public function sendMessage() {
        $user = $this->auth();
        if (!$user) {
            return;
        }

        $data = $this->parsePayload();
        $receiverId = trim((string) ($data['receiver_id'] ?? ''));
        $content = trim((string) ($data['content'] ?? ''));
        $attachment = $this->uploadAttachment();

        if ($attachment === false) {
            return;
        }

        if ($receiverId === '') {
            http_response_code(400);
            echo json_encode(['error' => 'receiver_id is required']);
            return;
        }

        if ($content === '' && empty($attachment['url'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Message text or photo is required']);
            return;
        }

        if ($receiverId === self::SUPER_GROUP_CONTACT_ID) {
            if (!$this->canAccessSuperGroup($user)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $result = $this->messageModel->sendSuperGroupMessage(
                $user['id'],
                $content !== '' ? $content : null,
                $attachment['url'],
                $attachment['type']
            );
        } elseif (strpos($receiverId, self::DISCUSSION_GROUP_CONTACT_PREFIX) === 0) {
            $groupId = (int) substr($receiverId, strlen(self::DISCUSSION_GROUP_CONTACT_PREFIX));
            if (!$this->canAccessDiscussionGroup($user, $groupId)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $result = $this->messageModel->sendDiscussionGroupMessage(
                $user['id'],
                $groupId,
                $content !== '' ? $content : null,
                $attachment['url'],
                $attachment['type']
            );
        } elseif (strpos($receiverId, 'group_') === 0) {
            $classId = (int) substr($receiverId, 6);

            if (!$this->canAccessGroup($user, $classId)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $result = $this->messageModel->sendGroupMessage(
                $user['id'],
                $classId,
                $content !== '' ? $content : null,
                $attachment['url'],
                $attachment['type']
            );
        } else {
            if (!$this->canMessageDirectly($user, $receiverId)) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden']);
                return;
            }

            $result = $this->messageModel->sendMessage(
                $user['id'],
                (int) $receiverId,
                $content !== '' ? $content : null,
                $attachment['url'],
                $attachment['type']
            );
        }

        if (!$result) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to send message']);
            return;
        }

        echo json_encode(['status' => 'success']);
    }

    public function getUnreadCount() {
        $user = $this->auth();
        if (!$user) {
            return;
        }

        echo json_encode([
            'status' => 'success',
            'unread_count' => $this->messageModel->getUnreadCount($user['id'])
        ]);
    }

    public function getContacts() {
        $user = $this->auth();
        if (!$user) {
            return;
        }

        if ($user['role'] === 'student') {
            $stmt = $this->db->prepare("
                SELECT DISTINCT u.id, u.name, u.role
                FROM users u
                JOIN class_assignments ca ON ca.teacher_id = u.id
                JOIN users student ON student.class_id = ca.class_id
                WHERE student.id = :student_id
                  AND u.role = 'teacher'
                ORDER BY u.name ASC
            ");
            $stmt->execute(['student_id' => $user['id']]);
            $contacts = $stmt->fetchAll();
        } elseif ($user['role'] === 'teacher') {
            $stmt = $this->db->prepare("
                SELECT DISTINCT u.id, u.name, u.role, c.name AS class_name
                FROM users u
                JOIN class_assignments ca ON ca.class_id = u.class_id
                LEFT JOIN classes c ON c.id = u.class_id
                WHERE ca.teacher_id = :teacher_id
                  AND u.role = 'student'
                ORDER BY c.name ASC, u.name ASC
            ");
            $stmt->execute(['teacher_id' => $user['id']]);
            $contacts = $stmt->fetchAll();
        } else {
            $contacts = [];
        }

        echo json_encode([
            'status' => 'success',
            'contacts' => $contacts
        ]);
    }
}
