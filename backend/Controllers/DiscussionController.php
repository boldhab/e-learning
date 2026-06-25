<?php

namespace Controllers;

use Core\Database;
use Core\JwtHandler;
use Models\Discussion;
use Models\Course;
use Models\User;
use Utils\FileUploader;

class DiscussionController {
    private $discussionModel;
    private $courseModel;
    private $userModel;
    private $db;
    private $fileUploader;

    public function __construct() {
        $this->discussionModel = new Discussion();
        $this->courseModel = new Course();
        $this->userModel = new User();
        $this->db = Database::getInstance()->getConnection();
        $this->fileUploader = new FileUploader();
    }

    /**
     * Authenticate user from JWT token
     */
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

    /**
     * Get authorization header
     */
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

    /**
     * Build upload URL from path
     */
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

    /**
     * Check if user has access to course
     */
    private function canAccessCourse($user, $courseId) {
        if ($user['role'] === 'admin') {
            return true;
        }

        if ($user['role'] === 'teacher') {
            $stmt = $this->db->prepare("
                SELECT c.id
                FROM courses c
                LEFT JOIN class_assignments ca
                    ON ca.class_id = c.class_id
                    AND ca.teacher_id = :teacher_id
                WHERE c.id = :course_id
                  AND (
                      c.instructor_id = :teacher_id
                      OR ca.id IS NOT NULL
                  )
                LIMIT 1
            ");
            $stmt->execute(['course_id' => $courseId, 'teacher_id' => $user['id']]);
            return $stmt->fetch() !== false;
        }

        if ($user['role'] === 'student') {
            $stmt = $this->db->prepare("
                SELECT id FROM student_enrollments 
                WHERE student_id = :student_id 
                AND class_id = (SELECT class_id FROM courses WHERE id = :course_id LIMIT 1)
            ");
            $stmt->execute(['student_id' => $user['id'], 'course_id' => $courseId]);
            return $stmt->fetch() !== false;
        }

        return false;
    }

    /**
     * Get discussions for a course
     */
    public function getDiscussions() {
        $user = $this->auth();
        if (!$user) return;

        $courseId = $_GET['course_id'] ?? null;
        $groupId = $_GET['group_id'] ?? null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $sortBy = $_GET['sort_by'] ?? 'recent'; // recent, popular, unanswered

        if (!$courseId) {
            http_response_code(400);
            echo json_encode(['error' => 'course_id is required']);
            return;
        }

        if (!$this->canAccessCourse($user, $courseId)) {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this course']);
            return;
        }

        if (!$groupId) {
            $groups = $this->discussionModel->getGroupsByCourse($courseId);
            $groupId = $groups[0]['id'] ?? null;
        }

        if ($groupId) {
            $group = $this->discussionModel->getGroupById($groupId);
            if (!$group || (int) $group['course_id'] !== (int) $courseId) {
                http_response_code(404);
                echo json_encode(['error' => 'Discussion group not found']);
                return;
            }
        }

        $discussions = $this->discussionModel->getDiscussionsByCourse($courseId, $page, $limit, $sortBy, $groupId);
        $total = $this->discussionModel->getDiscussionCountByCourse($courseId, $groupId);

        // Transform attachment URLs
        $discussions = array_map(function ($d) {
            $d['attachment_url'] = $this->buildUploadUrl($d['attachment_url']);
            return $d;
        }, $discussions);

        echo json_encode([
            'success' => true,
            'discussions' => $discussions,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil(max(1, $total) / $limit),
                'group_id' => $groupId
            ]
        ]);
    }

    /**
     * Get discussion groups for a course.
     * The current system uses one automatic group per course.
     */
    public function getGroups() {
        $user = $this->auth();
        if (!$user) return;

        $courseId = $_GET['course_id'] ?? null;

        if (!$courseId) {
            http_response_code(400);
            echo json_encode(['error' => 'course_id is required']);
            return;
        }

        if (!$this->canAccessCourse($user, $courseId)) {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this course']);
            return;
        }

        $groups = $this->discussionModel->getGroupsByCourse($courseId);

        echo json_encode([
            'success' => true,
            'groups' => $groups
        ]);
    }

    /**
     * Create a new discussion group for a course.
     */
    public function createGroup() {
        $user = $this->auth();
        if (!$user) return;

        if ($user['role'] !== 'teacher' && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Only teachers can create discussion groups']);
            return;
        }

        $payload = json_decode(file_get_contents('php://input'), true) ?: [];
        $courseId = $payload['course_id'] ?? $_POST['course_id'] ?? null;
        $name = trim($payload['name'] ?? $_POST['name'] ?? '');
        $description = trim($payload['description'] ?? $_POST['description'] ?? '');

        if (!$courseId || $name === '') {
            http_response_code(400);
            echo json_encode(['error' => 'course_id and name are required']);
            return;
        }

        if (!$this->canAccessCourse($user, $courseId)) {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this course']);
            return;
        }

        $groupId = $this->discussionModel->createGroup(
            $courseId,
            $user['id'],
            $name,
            $description !== '' ? $description : null
        );

        if ($groupId) {
            $group = $this->discussionModel->getGroupById($groupId);
            echo json_encode([
                'success' => true,
                'message' => 'Discussion group created successfully',
                'group' => $group
            ]);
            return;
        }

        http_response_code(500);
        echo json_encode(['error' => 'Failed to create discussion group']);
    }

    /**
     * Get single discussion with replies
     */
    public function getDiscussion() {
        $user = $this->auth();
        if (!$user) return;

        $discussionId = $_GET['id'] ?? null;

        if (!$discussionId) {
            http_response_code(400);
            echo json_encode(['error' => 'id is required']);
            return;
        }

        $discussion = $this->discussionModel->getDiscussionById($discussionId);

        if (!$discussion) {
            http_response_code(404);
            echo json_encode(['error' => 'Discussion not found']);
            return;
        }

        if (!$this->canAccessCourse($user, $discussion['course_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this discussion']);
            return;
        }

        // Increment view count
        $this->discussionModel->incrementViews($discussionId);

        $discussion['attachment_url'] = $this->buildUploadUrl($discussion['attachment_url']);

        $replies = $this->discussionModel->getRepliesByDiscussion($discussionId);
        $replies = array_map(function ($r) {
            $r['attachment_url'] = $this->buildUploadUrl($r['attachment_url']);
            return $r;
        }, $replies);

        echo json_encode([
            'success' => true,
            'discussion' => $discussion,
            'replies' => $replies
        ]);
    }

    /**
     * Create new discussion
     */
    public function createDiscussion() {
        $user = $this->auth();
        if (!$user) return;

        if ($user['role'] !== 'student' && $user['role'] !== 'teacher') {
            http_response_code(403);
            echo json_encode(['error' => 'Only students and teachers can create discussions']);
            return;
        }

        $courseId = $_POST['course_id'] ?? null;
        $groupId = $_POST['group_id'] ?? null;
        $title = $_POST['title'] ?? null;
        $content = $_POST['content'] ?? null;
        $attachment = $_FILES['attachment'] ?? null;

        if (!$courseId || !$title || !$content) {
            http_response_code(400);
            echo json_encode(['error' => 'course_id, title, and content are required']);
            return;
        }

        if (!$this->canAccessCourse($user, $courseId)) {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this course']);
            return;
        }

        if (!$groupId) {
            $groups = $this->discussionModel->getGroupsByCourse($courseId);
            $groupId = $groups[0]['id'] ?? null;
        }

        if (!$groupId) {
            http_response_code(400);
            echo json_encode(['error' => 'No discussion group available for this course']);
            return;
        }

        $group = $this->discussionModel->getGroupById($groupId);
        if (!$group || (int) $group['course_id'] !== (int) $courseId) {
            http_response_code(404);
            echo json_encode(['error' => 'Discussion group not found']);
            return;
        }

        $attachmentUrl = null;
        $attachmentType = null;

        if ($attachment && $attachment['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->fileUploader->upload($attachment, 'discussions/course_' . $courseId);
            if ($uploadResult) {
                $attachmentUrl = $uploadResult['path'];
                $attachmentType = $uploadResult['type'];
            }
        }

        $discussionId = $this->discussionModel->createDiscussion(
            $courseId,
            $user['id'],
            $title,
            $content,
            $attachmentUrl,
            $attachmentType,
            $groupId
        );

        if ($discussionId) {
            $discussion = $this->discussionModel->getDiscussionById($discussionId);
            $discussion['attachment_url'] = $this->buildUploadUrl($discussion['attachment_url']);

            echo json_encode([
                'success' => true,
                'message' => 'Discussion created successfully',
                'discussion' => $discussion
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create discussion']);
        }
    }

    /**
     * Add reply to discussion
     */
    public function addReply() {
        $user = $this->auth();
        if (!$user) return;

        if ($user['role'] !== 'student' && $user['role'] !== 'teacher') {
            http_response_code(403);
            echo json_encode(['error' => 'Only students and teachers can reply']);
            return;
        }

        $discussionId = $_POST['discussion_id'] ?? null;
        $content = $_POST['content'] ?? null;
        $attachment = $_FILES['attachment'] ?? null;

        if (!$discussionId || !$content) {
            http_response_code(400);
            echo json_encode(['error' => 'discussion_id and content are required']);
            return;
        }

        $discussion = $this->discussionModel->getDiscussionById($discussionId);
        if (!$discussion) {
            http_response_code(404);
            echo json_encode(['error' => 'Discussion not found']);
            return;
        }

        if (!$this->canAccessCourse($user, $discussion['course_id'])) {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this discussion']);
            return;
        }

        $attachmentUrl = null;
        $attachmentType = null;

        if ($attachment && $attachment['error'] === UPLOAD_ERR_OK) {
            $uploadResult = $this->fileUploader->upload(
                $attachment,
                'discussion_replies/course_' . $discussion['course_id']
            );
            if ($uploadResult) {
                $attachmentUrl = $uploadResult['path'];
                $attachmentType = $uploadResult['type'];
            }
        }

        if ($this->discussionModel->addReply(
            $discussionId,
            $user['id'],
            $content,
            $attachmentUrl,
            $attachmentType
        )) {
            $replies = $this->discussionModel->getRepliesByDiscussion($discussionId);
            $replies = array_map(function ($r) {
                $r['attachment_url'] = $this->buildUploadUrl($r['attachment_url']);
                return $r;
            }, $replies);

            echo json_encode([
                'success' => true,
                'message' => 'Reply added successfully',
                'replies' => $replies
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add reply']);
        }
    }

    /**
     * Add reaction to reply
     */
    public function addReaction() {
        $user = $this->auth();
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);
        $replyId = $input['reply_id'] ?? null;
        $reactionType = $input['reaction_type'] ?? 'like';

        if (!$replyId) {
            http_response_code(400);
            echo json_encode(['error' => 'reply_id is required']);
            return;
        }

        if (!in_array($reactionType, ['like', 'helpful', 'confused'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid reaction type']);
            return;
        }

        if ($this->discussionModel->addReaction($replyId, $user['id'], $reactionType)) {
            $reply = $this->discussionModel->getReplyWithReactions($replyId, $user['id']);

            echo json_encode([
                'success' => true,
                'message' => 'Reaction added successfully',
                'reply' => $reply
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add reaction']);
        }
    }

    /**
     * Remove reaction from reply
     */
    public function removeReaction() {
        $user = $this->auth();
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);
        $replyId = $input['reply_id'] ?? null;

        if (!$replyId) {
            http_response_code(400);
            echo json_encode(['error' => 'reply_id is required']);
            return;
        }

        if ($this->discussionModel->removeReaction($replyId, $user['id'])) {
            $reply = $this->discussionModel->getReplyWithReactions($replyId, $user['id']);

            echo json_encode([
                'success' => true,
                'message' => 'Reaction removed successfully',
                'reply' => $reply
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to remove reaction']);
        }
    }

    /**
     * Mark reply as best answer (only original poster or admin)
     */
    public function markBestAnswer() {
        $user = $this->auth();
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);
        $replyId = $input['reply_id'] ?? null;

        if (!$replyId) {
            http_response_code(400);
            echo json_encode(['error' => 'reply_id is required']);
            return;
        }

        // Verify user is the discussion owner
        $stmt = $this->db->prepare("
            SELECT d.id FROM discussions d
            JOIN discussion_replies dr ON dr.discussion_id = d.id
            WHERE dr.id = :reply_id AND d.student_id = :user_id
        ");
        $stmt->execute(['reply_id' => $replyId, 'user_id' => $user['id']]);
        $discussion = $stmt->fetch();

        if (!$discussion && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Only discussion owner can mark best answer']);
            return;
        }

        if ($this->discussionModel->markBestAnswer($replyId, $discussion ? $discussion['id'] : null)) {
            echo json_encode([
                'success' => true,
                'message' => 'Marked as best answer'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to mark best answer']);
        }
    }

    /**
     * Search discussions
     */
    public function search() {
        $user = $this->auth();
        if (!$user) return;

        $courseId = $_GET['course_id'] ?? null;
        $keyword = $_GET['keyword'] ?? null;
        $groupId = $_GET['group_id'] ?? null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

        if (!$courseId || !$keyword) {
            http_response_code(400);
            echo json_encode(['error' => 'course_id and keyword are required']);
            return;
        }

        if (!$this->canAccessCourse($user, $courseId)) {
            http_response_code(403);
            echo json_encode(['error' => 'No access to this course']);
            return;
        }

        $results = $this->discussionModel->searchDiscussions($courseId, $keyword, $page, $limit, $groupId);
        $results = array_map(function ($r) {
            $r['attachment_url'] = $this->buildUploadUrl($r['attachment_url']);
            return $r;
        }, $results);

        echo json_encode([
            'success' => true,
            'results' => $results,
            'page' => $page,
            'limit' => $limit
        ]);
    }

    /**
     * Delete discussion (owner or admin only)
     */
    public function deleteDiscussion() {
        $user = $this->auth();
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);
        $discussionId = $input['discussion_id'] ?? null;

        if (!$discussionId) {
            http_response_code(400);
            echo json_encode(['error' => 'discussion_id is required']);
            return;
        }

        $discussion = $this->discussionModel->getDiscussionById($discussionId);
        if (!$discussion) {
            http_response_code(404);
            echo json_encode(['error' => 'Discussion not found']);
            return;
        }

        if ($discussion['student_id'] !== $user['id'] && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Not authorized']);
            return;
        }

        if ($this->discussionModel->deleteDiscussion($discussionId)) {
            echo json_encode(['success' => true, 'message' => 'Discussion deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete discussion']);
        }
    }

    /**
     * Delete reply (owner or admin only)
     */
    public function deleteReply() {
        $user = $this->auth();
        if (!$user) return;

        $input = json_decode(file_get_contents('php://input'), true);
        $replyId = $input['reply_id'] ?? null;

        if (!$replyId) {
            http_response_code(400);
            echo json_encode(['error' => 'reply_id is required']);
            return;
        }

        $stmt = $this->db->prepare("SELECT user_id FROM discussion_replies WHERE id = :id");
        $stmt->execute(['id' => $replyId]);
        $reply = $stmt->fetch();

        if (!$reply) {
            http_response_code(404);
            echo json_encode(['error' => 'Reply not found']);
            return;
        }

        if ($reply['user_id'] !== $user['id'] && $user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Not authorized']);
            return;
        }

        if ($this->discussionModel->deleteReply($replyId)) {
            echo json_encode(['success' => true, 'message' => 'Reply deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete reply']);
        }
    }
}
