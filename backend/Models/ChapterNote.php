<?php

namespace Models;

use Core\Database;
use PDO;

class ChapterNote {
    private $db;
    private $table = 'chapter_notes';
    private static $publishedAtColumnChecked = false;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->ensurePublishedAtColumn();
    }

    private function ensurePublishedAtColumn() {
        if (self::$publishedAtColumnChecked) {
            return;
        }

        $stmt = $this->db->query("SHOW COLUMNS FROM " . $this->table . " LIKE 'published_at'");
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            $this->db->exec("ALTER TABLE " . $this->table . " ADD COLUMN published_at TIMESTAMP NULL DEFAULT NULL");
        }

        self::$publishedAtColumnChecked = true;
    }

    public function create($chapterId, $content, $teacherId, $isPublished = false) {
        $sql = "INSERT INTO " . $this->table . " (chapter_id, content, created_by, is_published, published_at)
                VALUES (:chapter_id, :content, :created_by, :is_published, :published_at)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            'chapter_id' => $chapterId,
            'content' => $content,
            'created_by' => $teacherId,
            'is_published' => $isPublished ? 1 : 0,
            'published_at' => $isPublished ? date('Y-m-d H:i:s') : null
        ]);
    }

    public function getByChapter($chapterId, $onlyPublished = true) {
        // Join with users to include author/teacher details so students can see who authored/published notes
        $sql = "SELECT cn.*, u.id as author_id, u.name as author_name
                FROM " . $this->table . " cn
                LEFT JOIN users u ON u.id = cn.created_by
                WHERE cn.chapter_id = :chapter_id";

        if ($onlyPublished) {
            $sql .= " AND cn.is_published = 1";
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['chapter_id' => $chapterId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id) {
        $sql = "SELECT * FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function update($id, $content, $isPublished = null) {
        $fields = ['content = :content'];
        $params = [
            'id' => $id,
            'content' => $content
        ];

        if ($isPublished !== null) {
            $fields[] = 'is_published = :is_published';
            $fields[] = $isPublished
                ? 'published_at = COALESCE(published_at, CURRENT_TIMESTAMP)'
                : 'published_at = NULL';
            $params['is_published'] = $isPublished ? 1 : 0;
        }

        $sql = "UPDATE " . $this->table . " SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function delete($id) {
        $sql = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() === 1;
    }
}
