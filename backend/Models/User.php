<?php

namespace Models;

use Core\Database;
use PDO;

class User {
    private $db;
    private $table = 'users';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Find a user by their email address
     * @param string $email
     * @return array|false User data or false if not found
     */
    public function findByEmail($email) {
        $sql = "SELECT * FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Get user by ID (excluding sensitive data)
     * @param int $id
     * @return array|false
     */
    public function findById($id) {
        $sql = "SELECT id, name, email, role, profile_image, created_at FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch();
    }
}
