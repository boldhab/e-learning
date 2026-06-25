<?php
// v2.1 - Cache invalidation - May 8 2026 - Fixed SHOW COLUMNS with try-catch
namespace Models;

use Core\Database;
use PDO;

class Message {
    private $db;
    private const SUPER_GROUP_ID = 0;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->ensureSchema();
    }

    private function ensureSchema() {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NULL,
                attachment_url VARCHAR(255) DEFAULT NULL,
                attachment_type VARCHAR(50) DEFAULT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (sender_id),
                INDEX (receiver_id)
            ) ENGINE=InnoDB
        ");

        $this->db->exec("
            CREATE TABLE IF NOT EXISTS group_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                class_id INT NOT NULL,
                sender_id INT NOT NULL,
                content TEXT NULL,
                attachment_url VARCHAR(255) DEFAULT NULL,
                attachment_type VARCHAR(50) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (class_id),
                INDEX (sender_id)
            ) ENGINE=InnoDB
        ");

        $this->addColumnIfMissing('messages', 'attachment_url', 'VARCHAR(255) DEFAULT NULL');
        $this->addColumnIfMissing('messages', 'attachment_type', 'VARCHAR(50) DEFAULT NULL');
        $this->addColumnIfMissing('group_messages', 'attachment_url', 'VARCHAR(255) DEFAULT NULL');
        $this->addColumnIfMissing('group_messages', 'attachment_type', 'VARCHAR(50) DEFAULT NULL');
    }

    private function addColumnIfMissing($table, $column, $definition) {
        try {
            // SHOW COLUMNS doesn't support parameterized LIKE clause
            // Use a raw query instead - but with error handling
            $result = @$this->db->query("SHOW COLUMNS FROM {$table} LIKE '{$column}'");
            
            if ($result && !$result->fetch()) {
                $this->db->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
            }
        } catch (\Exception $e) {
            // Silently fail if column check fails - schema may already be correct
            error_log("Column check failed for {$column}: " . $e->getMessage());
        }
    }

    public function sendGroupMessage($senderId, $classId, $content, $attachmentUrl = null, $attachmentType = null) {
        $stmt = $this->db->prepare("
            INSERT INTO group_messages (sender_id, class_id, content, attachment_url, attachment_type)
            VALUES (:sender_id, :class_id, :content, :attachment_url, :attachment_type)
        ");

        return $stmt->execute([
            'sender_id' => $senderId,
            'class_id' => $classId,
            'content' => $content,
            'attachment_url' => $attachmentUrl,
            'attachment_type' => $attachmentType
        ]);
    }

    public function getGroupMessages($classId) {
        $sql = "SELECT gm.*, u.name as sender_name, u.role as sender_role 
                FROM group_messages gm
                JOIN users u ON u.id = gm.sender_id
                WHERE gm.class_id = :cid
                ORDER BY gm.created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['cid' => $classId]);
        return $stmt->fetchAll();
    }

    public function sendSuperGroupMessage($senderId, $content, $attachmentUrl = null, $attachmentType = null) {
        return $this->sendGroupMessage($senderId, self::SUPER_GROUP_ID, $content, $attachmentUrl, $attachmentType);
    }

    public function getSuperGroupMessages() {
        return $this->getGroupMessages(self::SUPER_GROUP_ID);
    }

    public function sendDiscussionGroupMessage($senderId, $discussionGroupId, $content, $attachmentUrl = null, $attachmentType = null) {
        return $this->sendGroupMessage($senderId, $this->encodeDiscussionGroupId($discussionGroupId), $content, $attachmentUrl, $attachmentType);
    }

    public function getDiscussionGroupMessages($discussionGroupId) {
        return $this->getGroupMessages($this->encodeDiscussionGroupId($discussionGroupId));
    }

    private function encodeDiscussionGroupId($discussionGroupId) {
        return -1 * abs((int) $discussionGroupId);
    }

    public function sendMessage($senderId, $receiverId, $content, $attachmentUrl = null, $attachmentType = null) {
        $stmt = $this->db->prepare("
            INSERT INTO messages (sender_id, receiver_id, content, attachment_url, attachment_type)
            VALUES (:sender_id, :receiver_id, :content, :attachment_url, :attachment_type)
        ");

        return $stmt->execute([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'content' => $content,
            'attachment_url' => $attachmentUrl,
            'attachment_type' => $attachmentType
        ]);
    }

    public function getConversations($userId) {
        $sql = "SELECT
                    recent.contact_id,
                    u.name AS contact_name,
                    u.role AS contact_role,
                    recent.last_message_at
                FROM (
                    SELECT
                        CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END AS contact_id,
                        MAX(created_at) AS last_message_at
                    FROM messages
                    WHERE sender_id = :uid OR receiver_id = :uid
                    GROUP BY CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END
                ) recent
                JOIN users u ON u.id = recent.contact_id
                ORDER BY recent.last_message_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll();
    }

    public function getMessages($userId, $contactId) {
        $sql = "SELECT m.*, sender.name AS sender_name, sender.role AS sender_role
                FROM messages m
                JOIN users sender ON sender.id = m.sender_id
                WHERE (sender_id = :uid AND receiver_id = :cid) 
                   OR (sender_id = :cid AND receiver_id = :uid)
                ORDER BY created_at ASC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId, 'cid' => $contactId]);
        
        // Mark as read
        $update = $this->db->prepare("UPDATE messages SET is_read = 1 WHERE sender_id = :cid AND receiver_id = :uid");
        $update->execute(['uid' => $userId, 'cid' => $contactId]);
        
        return $stmt->fetchAll();
    }

    public function getUnreadCount($userId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM messages WHERE receiver_id = :uid AND is_read = 0");
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetch()['count'];
    }

    /**
     * Get private chat with teacher or student
     */
    public function getPrivateChat($userId, $contactId, $limit = 50) {
        $sql = "SELECT m.*, sender.name AS sender_name, sender.role AS sender_role, sender.profile_image as sender_avatar,
                receiver.name AS receiver_name, receiver.role AS receiver_role
                FROM messages m
                JOIN users sender ON sender.id = m.sender_id
                JOIN users receiver ON receiver.id = m.receiver_id
                WHERE (sender_id = :uid AND receiver_id = :cid) 
                   OR (sender_id = :cid AND receiver_id = :uid)
                ORDER BY m.created_at DESC
                LIMIT :limit";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue('uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue('cid', $contactId, PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Reverse to get chronological order
        return array_reverse($messages);
    }

    /**
     * Mark conversation as read
     */
    public function markConversationAsRead($userId, $contactId) {
        $stmt = $this->db->prepare("
            UPDATE messages 
            SET is_read = 1 
            WHERE receiver_id = :uid AND sender_id = :cid AND is_read = 0
        ");
        return $stmt->execute(['uid' => $userId, 'cid' => $contactId]);
    }

    /**
     * Get conversation list with last message preview
     */
    public function getConversationsWithPreview($userId) {
        $sql = "SELECT
                    contact_id,
                    contact_name,
                    contact_role,
                    contact_avatar,
                    last_message_at,
                    last_message_preview,
                    unread_count
                FROM (
                    SELECT
                        CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END AS contact_id,
                        MAX(created_at) AS last_message_at,
                        SUBSTRING(
                            CASE WHEN content IS NOT NULL AND content != '' THEN content 
                                 ELSE CONCAT('[', attachment_type, ']')
                            END,
                            1, 50
                        ) as last_message_preview
                    FROM messages
                    WHERE sender_id = :uid OR receiver_id = :uid
                    GROUP BY CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END
                ) recent
                JOIN users u ON u.id = recent.contact_id
                CROSS JOIN (SELECT COUNT(*) as unread_count FROM messages WHERE receiver_id = :uid AND sender_id = recent.contact_id AND is_read = 0) uc
                LEFT JOIN (SELECT id, profile_image FROM users) u2 ON u2.id = recent.contact_id
                ORDER BY recent.last_message_at DESC";
        
        // Note: This is a simplified version. Adjust based on your actual schema.
        $stmt = $this->db->prepare("
            SELECT
                CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END AS contact_id,
                u.name AS contact_name,
                u.role AS contact_role,
                u.profile_image AS contact_avatar,
                MAX(m.created_at) AS last_message_at,
                m.content as last_message_preview
            FROM messages m
            JOIN users u ON u.id = CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END
            WHERE sender_id = :uid OR receiver_id = :uid
            GROUP BY contact_id
            ORDER BY last_message_at DESC
        ");
        
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get message with file details
     */
    public function getMessageWithFileDetails($messageId) {
        $stmt = $this->db->prepare("
            SELECT m.*, u.name as sender_name
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.id = :id
        ");
        $stmt->execute(['id' => $messageId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Delete message
     */
    public function deleteMessage($messageId, $userId) {
        $stmt = $this->db->prepare("
            DELETE FROM messages 
            WHERE id = :id AND (sender_id = :uid OR receiver_id = :uid)
        ");
        return $stmt->execute(['id' => $messageId, 'uid' => $userId]);
    }
}
