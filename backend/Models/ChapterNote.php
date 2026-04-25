<?php

namespace Models;

use Core\Database;
use PDO;

class ChapterNote {
    private $db;
    private $table = 'chapter_notes';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($chapterId, $content, $teacherId, $isPublished = false) {
        $sql = "INSERT INTO " . $this->table . " (chapter_id, content, created_by, is_published) 
                VALUES (:chapter_id, :content, :created_by, :is_published)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'chapter_id' => $chapterId,
            'content' => $content,
            'created_by' => $teacherId,
            'is_published' => $isPublished ? 1 : 0
        ]);
    }

    public function getByChapter($chapterId, $onlyPublished = true) {
        $sql = "SELECT * FROM " . $this->table . " WHERE chapter_id = :chapter_id";
        if ($onlyPublished) {
            $sql .= " AND is_published = 1";
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['chapter_id' => $chapterId]);
        return $stmt->fetchAll();
    }
}
