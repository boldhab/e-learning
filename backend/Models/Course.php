<?php

namespace Models;

use Core\Database;
use PDO;

class Course {
    private $db;
    private $table = 'courses';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Create a new course
     */
    public function create($title, $instructorId, $classId) {
        $sql = "INSERT INTO {$this->table} (title, instructor_id, class_id) 
                VALUES (:title, :instructor_id, :class_id)";
        $stmt = $this->db->prepare($sql);
        if ($stmt->execute([
            'title'         => $title,
            'instructor_id' => $instructorId,
            'class_id'      => $classId
        ])) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Find course by instructor, class and title (to prevent duplicates)
     */
    public function findExisting($title, $instructorId, $classId) {
        $sql = "SELECT id FROM {$this->table} 
                WHERE title = :title AND instructor_id = :instructor_id AND class_id = :class_id 
                LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'title'         => $title,
            'instructor_id' => $instructorId,
            'class_id'      => $classId
        ]);
        return $stmt->fetch();
    }

    /**
     * Get course by id with class and instructor details.
     */
    public function getById($courseId) {
        $stmt = $this->db->prepare(
            "SELECT c.*, cls.name AS class_name, u.name AS instructor_name
             FROM {$this->table} c
             LEFT JOIN classes cls ON cls.id = c.class_id
             LEFT JOIN users u ON u.id = c.instructor_id
             WHERE c.id = :course_id
             LIMIT 1"
        );
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetch();
    }
}
