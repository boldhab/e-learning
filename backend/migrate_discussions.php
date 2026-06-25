<?php
/**
 * Migration for Discussion Groups and Private Chat Features
 * - Teacher-created discussion groups per course
 * - Discussion threads with replies and reactions
 * - Enhanced private teacher chat with file attachments
 */

require_once __DIR__ . '/Config/Config.php';

use Core\Database;

$db = Database::getInstance()->getConnection();

try {
    echo "Creating discussion_groups table...\n";
    $db->exec("\n        CREATE TABLE IF NOT EXISTS discussion_groups (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            course_id INT NOT NULL,\n            teacher_id INT NOT NULL,\n            name VARCHAR(255) NOT NULL,\n            description TEXT DEFAULT NULL,\n            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n\n            INDEX (course_id),\n            INDEX (teacher_id),\n            UNIQUE KEY unique_course_group_name (course_id, name),\n\n            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,\n            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE\n        ) ENGINE=InnoDB\n    ");
    echo "Discussion groups table ready\n";

    echo "Creating discussions table...\n";
    $db->exec("\n        CREATE TABLE IF NOT EXISTS discussions (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            course_id INT NOT NULL,\n            group_id INT DEFAULT NULL,\n            student_id INT NOT NULL,\n            title VARCHAR(255) NOT NULL,\n            content TEXT NOT NULL,\n            attachment_url VARCHAR(255) DEFAULT NULL,\n            attachment_type VARCHAR(50) DEFAULT NULL,\n            views INT DEFAULT 0,\n            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n\n            INDEX (course_id),\n            INDEX (group_id),\n            INDEX (student_id),\n            INDEX (created_at),\n\n            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,\n            FOREIGN KEY (group_id) REFERENCES discussion_groups(id) ON DELETE SET NULL,\n            FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE\n        ) ENGINE=InnoDB\n    ");
    echo "Discussions table ready\n";

    echo "Creating discussion_replies table...\n";
    $db->exec("\n        CREATE TABLE IF NOT EXISTS discussion_replies (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            discussion_id INT NOT NULL,\n            user_id INT NOT NULL,\n            content TEXT NOT NULL,\n            attachment_url VARCHAR(255) DEFAULT NULL,\n            attachment_type VARCHAR(50) DEFAULT NULL,\n            is_best_answer BOOLEAN DEFAULT FALSE,\n            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n\n            INDEX (discussion_id),\n            INDEX (user_id),\n            INDEX (created_at),\n\n            FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE,\n            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n        ) ENGINE=InnoDB\n    ");
    echo "Discussion replies table ready\n";

    echo "Creating discussion_reactions table...\n";
    $db->exec("\n        CREATE TABLE IF NOT EXISTS discussion_reactions (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            reply_id INT NOT NULL,\n            user_id INT NOT NULL,\n            reaction_type ENUM('like', 'helpful', 'confused') DEFAULT 'like',\n            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n\n            INDEX (reply_id),\n            INDEX (user_id),\n            UNIQUE KEY unique_reaction (reply_id, user_id, reaction_type),\n\n            FOREIGN KEY (reply_id) REFERENCES discussion_replies(id) ON DELETE CASCADE,\n            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\n        ) ENGINE=InnoDB\n    ");
    echo "Discussion reactions table ready\n";

    echo "Creating discussion_search_index table...\n";
    $db->exec("\n        CREATE TABLE IF NOT EXISTS discussion_search_index (\n            id INT AUTO_INCREMENT PRIMARY KEY,\n            discussion_id INT NOT NULL,\n            search_text TEXT NOT NULL,\n            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n\n            FULLTEXT INDEX ft_search (search_text),\n            FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE\n        ) ENGINE=InnoDB\n    ");
    echo "Discussion search index table ready\n";

    echo "Enhancing messages table...\n";
    $stmt = $db->prepare("SHOW COLUMNS FROM messages LIKE 'is_read'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE");
        echo "Added is_read column to messages\n";
    }

    $stmt = $db->prepare("SHOW COLUMNS FROM messages LIKE 'file_type'");
    $stmt->execute();
    if (!$stmt->fetch()) {
        $db->exec("ALTER TABLE messages ADD COLUMN file_type VARCHAR(50) DEFAULT NULL");
        echo "Added file_type column to messages\n";
    }

    echo "Migration completed successfully\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
