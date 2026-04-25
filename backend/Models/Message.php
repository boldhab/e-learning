<?php

namespace Models;

use Core\Database;
use PDO;

class Message {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function sendMessage($senderId, $receiverId, $content) {
        $stmt = $this->db->prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (:s, :r, :c)");
        return $stmt->execute(['s' => $senderId, 'r' => $receiverId, 'c' => $content]);
    }

    public function getConversations($userId) {
        $sql = "SELECT DISTINCT 
                    CASE WHEN sender_id = :uid THEN receiver_id ELSE sender_id END as contact_id,
                    u.name as contact_name,
                    u.role as contact_role,
                    u.avatar as contact_avatar
                FROM messages m
                JOIN users u ON u.id = (CASE WHEN m.sender_id = :uid THEN m.receiver_id ELSE m.sender_id END)
                WHERE sender_id = :uid OR receiver_id = :uid
                ORDER BY m.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll();
    }

    public function getMessages($userId, $contactId) {
        $sql = "SELECT * FROM messages 
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
}
