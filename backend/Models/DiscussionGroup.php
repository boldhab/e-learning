<?php
// v2.2 - May 8 2026 - Added subject_id enrichment + class/subject labels on all read queries
namespace Models;

use Core\Database;
use PDO;

class DiscussionGroup {
    private $db;
    private $table = 'discussion_groups';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->ensureSchema();
    }

    private function ensureSchema() {
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS {$this->table} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                class_id INT DEFAULT NULL,
                course_id INT DEFAULT NULL,
                teacher_id INT DEFAULT NULL,
                subject_id INT DEFAULT NULL,
                description TEXT DEFAULT NULL,
                created_by_admin_id INT DEFAULT NULL,
                is_system_created BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_discussion_groups_class (class_id),
                INDEX idx_discussion_groups_course (course_id),
                INDEX idx_discussion_groups_teacher (teacher_id),
                UNIQUE KEY unique_class_system_group (class_id),
                UNIQUE KEY unique_course_group_name (course_id, name)
            ) ENGINE=InnoDB
        ");

        $this->dropIndexIfExists('class_id');
        $this->dropIndexIfExists('unique_class_system_group');

        $this->addColumnIfMissing('class_id',            'INT DEFAULT NULL');
        $this->addColumnIfMissing('course_id',           'INT DEFAULT NULL');
        $this->addColumnIfMissing('teacher_id',          'INT DEFAULT NULL');
        $this->addColumnIfMissing('subject_id',          'INT DEFAULT NULL');
        $this->addColumnIfMissing('description',         'TEXT DEFAULT NULL');
        $this->addColumnIfMissing('created_by_admin_id', 'INT DEFAULT NULL');
        $this->addColumnIfMissing('is_system_created',   'BOOLEAN DEFAULT FALSE');
        $this->addColumnIfMissing('updated_at',          'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

        $this->ensureIndex('idx_discussion_groups_class',   "ALTER TABLE {$this->table} ADD INDEX idx_discussion_groups_class (class_id)");
        $this->ensureIndex('idx_discussion_groups_course',  "ALTER TABLE {$this->table} ADD INDEX idx_discussion_groups_course (course_id)");
        $this->ensureIndex('idx_discussion_groups_teacher', "ALTER TABLE {$this->table} ADD INDEX idx_discussion_groups_teacher (teacher_id)");
        $this->ensureIndex('unique_course_group_name',      "ALTER TABLE {$this->table} ADD UNIQUE KEY unique_course_group_name (course_id, name)");
    }

    private function dropIndexIfExists($indexName) {
        try {
            $this->db->exec("ALTER TABLE {$this->table} DROP INDEX {$indexName}");
        } catch (\PDOException $e) {
            // Ignore – index may not exist yet.
        }
    }

    private function addColumnIfMissing($column, $definition) {
        try {
            $result = @$this->db->query("SHOW COLUMNS FROM {$this->table} LIKE '{$column}'");
            if ($result && !$result->fetch()) {
                $this->db->exec("ALTER TABLE {$this->table} ADD COLUMN {$column} {$definition}");
            }
        } catch (\Exception $e) {
            error_log("Column check failed for {$column}: " . $e->getMessage());
        }
    }

    private function ensureIndex($indexName, $ddl) {
        try {
            $result = @$this->db->query("SHOW INDEX FROM {$this->table} WHERE Key_name = '{$indexName}'");
            if ($result && !$result->fetch()) {
                $this->db->exec($ddl);
            }
        } catch (\Exception $e) {
            error_log("Index check failed for {$indexName}: " . $e->getMessage());
        }
    }

    /**
     * Attempt to resolve the subject_id for a course via class_assignments.
     */
    private function resolveSubjectId($courseId, $teacherId) {
        try {
            $stmt = $this->db->prepare("
                SELECT ca.subject_id
                FROM class_assignments ca
                JOIN courses c ON c.class_id = ca.class_id
                WHERE c.id = :course_id
                  AND ca.teacher_id = :teacher_id
                LIMIT 1
            ");
            $stmt->execute(['course_id' => $courseId, 'teacher_id' => $teacherId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ? $row['subject_id'] : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // ----------------------------------------------------------------
    //  Write operations
    // ----------------------------------------------------------------

    public function createForClass($classId, $name, $adminId = null) {
        $existing = $this->findSystemGroupByClassId($classId);

        if ($existing) {
            $stmt = $this->db->prepare("
                UPDATE {$this->table}
                SET name = :name,
                    created_by_admin_id = :admin_id,
                    is_system_created = 1
                WHERE id = :id
            ");
            return $stmt->execute([
                'name'     => $name,
                'admin_id' => $adminId,
                'id'       => $existing['id']
            ]);
        }

        $stmt = $this->db->prepare("
            INSERT INTO {$this->table} (name, class_id, created_by_admin_id, is_system_created)
            VALUES (:name, :class_id, :admin_id, 1)
        ");
        return $stmt->execute([
            'name'     => $name,
            'class_id' => $classId,
            'admin_id' => $adminId
        ]);
    }

    public function createForCourse($courseId, $teacherId, $name, $description = null) {
        $courseStmt = $this->db->prepare("SELECT class_id FROM courses WHERE id = :course_id LIMIT 1");
        $courseStmt->execute(['course_id' => $courseId]);
        $course = $courseStmt->fetch(PDO::FETCH_ASSOC);

        if (!$course || !$course['class_id']) {
            error_log('Failed to create course discussion group: missing class_id for course ' . $courseId);
            return false;
        }

        $subjectId = $this->resolveSubjectId($courseId, $teacherId);

        $stmt = $this->db->prepare("
            INSERT INTO {$this->table}
                (name, course_id, class_id, teacher_id, subject_id, description, is_system_created)
            VALUES
                (:name, :course_id, :class_id, :teacher_id, :subject_id, :description, 0)
            ON DUPLICATE KEY UPDATE
                id           = LAST_INSERT_ID(id),
                course_id    = VALUES(course_id),
                teacher_id   = VALUES(teacher_id),
                subject_id   = VALUES(subject_id),
                name         = VALUES(name),
                description  = VALUES(description),
                is_system_created = 0
        ");

        try {
            $stmt->execute([
                'name'        => $name,
                'course_id'   => $courseId,
                'class_id'    => $course['class_id'],
                'teacher_id'  => $teacherId,
                'subject_id'  => $subjectId,
                'description' => $description
            ]);

            return (int) $this->db->lastInsertId();
        } catch (\PDOException $e) {
            error_log('Failed to create course discussion group: ' . $e->getMessage());
            $existing = $this->findByCourseAndName($courseId, $name);
            return $existing ? (int) $existing['id'] : false;
        }
    }

    // ----------------------------------------------------------------
    //  Lookup operations
    // ----------------------------------------------------------------

    public function findSystemGroupByClassId($classId) {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table}
            WHERE class_id = :class_id AND is_system_created = 1
            LIMIT 1
        ");
        $stmt->execute(['class_id' => $classId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByCourseAndName($courseId, $name) {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table}
            WHERE course_id = :course_id AND name = :name
            LIMIT 1
        ");
        $stmt->execute(['course_id' => $courseId, 'name' => $name]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByClassId($classId) {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table} WHERE class_id = :class_id LIMIT 1
        ");
        $stmt->execute(['class_id' => $classId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findById($groupId) {
        $stmt = $this->db->prepare("
            SELECT * FROM {$this->table} WHERE id = :id LIMIT 1
        ");
        $stmt->execute(['id' => $groupId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ----------------------------------------------------------------
    //  Sync helpers
    // ----------------------------------------------------------------

    public function syncSystemGroups() {
        $stmt = $this->db->query("
            SELECT c.id, c.name
            FROM classes c
            LEFT JOIN {$this->table} dg ON dg.class_id = c.id AND dg.is_system_created = 1
            WHERE dg.id IS NULL
        ");

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $class) {
            $this->createForClass($class['id'], $class['name'] . ' Discussion Group', null);
        }
    }

    // ----------------------------------------------------------------
    //  Read collections (enriched with class_name + subject_name)
    // ----------------------------------------------------------------

    public function getForStudent($studentId) {
        $stmt = $this->db->prepare("
            SELECT dg.*,
                   cl.name AS class_name,
                   s.name  AS subject_name
            FROM {$this->table} dg
            JOIN users u       ON u.class_id  = dg.class_id
            LEFT JOIN classes cl ON cl.id     = dg.class_id
            LEFT JOIN subjects s  ON s.id     = dg.subject_id
            WHERE u.id = :student_id
              AND dg.class_id IS NOT NULL
            ORDER BY dg.name ASC
        ");
        $stmt->execute(['student_id' => $studentId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getForTeacher($teacherId) {
        $stmt = $this->db->prepare("
            SELECT DISTINCT dg.*,
                   cl.name AS class_name,
                   s.name  AS subject_name
            FROM {$this->table} dg
            JOIN class_assignments ca ON ca.class_id = dg.class_id
            LEFT JOIN classes cl      ON cl.id       = dg.class_id
            LEFT JOIN subjects s       ON s.id        = dg.subject_id
            WHERE ca.teacher_id = :teacher_id
              AND dg.class_id IS NOT NULL
            ORDER BY dg.name ASC
        ");
        $stmt->execute(['teacher_id' => $teacherId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getForCourse($courseId) {
        $stmt = $this->db->prepare("
            SELECT dg.*,
                   u.name  AS teacher_name,
                   cl.name AS class_name,
                   s.name  AS subject_name,
                   (SELECT COUNT(*) FROM discussions d WHERE d.group_id = dg.id) AS discussion_count
            FROM {$this->table} dg
            LEFT JOIN users u    ON u.id   = dg.teacher_id
            LEFT JOIN classes cl ON cl.id  = dg.class_id
            LEFT JOIN subjects s  ON s.id  = dg.subject_id
            WHERE dg.course_id = :course_id
            ORDER BY dg.created_at ASC
        ");
        $stmt->execute(['course_id' => $courseId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
