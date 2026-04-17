<?php

namespace Models;

use Core\Database;
use PDO;

class AcademicYear {
    private $db;
    private $table = 'academic_years';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get the currently active academic year
     */
    public function getActiveYear() {
        $sql = "SELECT * FROM " . $this->table . " WHERE is_active = TRUE LIMIT 1";
        $stmt = $this->db->query($sql);
        return $stmt->fetch();
    }

    /**
     * Get all academic years
     */
    public function getAll() {
        $sql = "SELECT * FROM " . $this->table . " ORDER BY created_at DESC";
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    /**
     * Create a new academic year
     */
    public function create($name) {
        $sql = "INSERT INTO " . $this->table . " (name) VALUES (:name)";
        $stmt = $this->db->prepare($sql);
        if ($stmt->execute(['name' => $name])) {
            return $this->db->lastInsertId();
        }
        return false;
    }

    /**
     * Set a specific year as active and deactivate others
     */
    public function setActive($id) {
        try {
            $this->db->beginTransaction();
            
            // Deactivate all
            $sql1 = "UPDATE " . $this->table . " SET is_active = FALSE";
            $this->db->query($sql1);
            
            // Activate selected
            $sql2 = "UPDATE " . $this->table . " SET is_active = TRUE WHERE id = :id";
            $stmt2 = $this->db->prepare($sql2);
            $stmt2->execute(['id' => $id]);
            
            $this->db->commit();
            return true;
        } catch (\Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }
}
