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
        $sql = "SELECT u.id, u.name, u.email, u.role, u.profile_image, u.grade, u.teaching_subject, u.class_id, c.name as class_name, u.created_at 
                FROM " . $this->table . " u
                LEFT JOIN classes c ON u.class_id = c.id
                WHERE u.id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        return $stmt->fetch();
    }

    /**
     * Create a new user
     * @param array $data
     * @return bool|int New user ID or false
     */
    public function create($data) {
        $sql = "INSERT INTO " . $this->table . " (name, email, password_hash, role, grade, teaching_subject, class_id) 
                VALUES (:name, :email, :password_hash, :role, :grade, :teaching_subject, :class_id)";
        
        $stmt = $this->db->prepare($sql);
        
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password_hash', $data['password_hash']);
        $stmt->bindParam(':role', $data['role']);
        $stmt->bindParam(':grade', $data['grade']);
        $stmt->bindParam(':teaching_subject', $data['teaching_subject']);
        $stmt->bindParam(':class_id', $data['class_id']);
        
        if ($stmt->execute()) {
            return $this->db->lastInsertId();
        }
        
        return false;
    }

    /**
     * Assign a user to a specific class
     */
    /**
     * Enroll a student in a class for a specific academic year
     */
    public function enrollInYear($studentId, $classId, $yearId) {
        $sql = "INSERT INTO student_enrollments (student_id, class_id, academic_year_id) 
                VALUES (:student_id, :class_id, :year_id)
                ON DUPLICATE KEY UPDATE class_id = VALUES(class_id)";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'student_id' => $studentId,
            'class_id' => $classId,
            'year_id' => $yearId
        ]);
    }
}
