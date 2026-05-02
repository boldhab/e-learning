<?php

require_once __DIR__ . '/Config/Config.php';
require_once __DIR__ . '/Core/Database.php';

$db = \Core\Database::getInstance()->getConnection();

$tables = ['chapter_notes', 'learning_materials', 'reference_materials'];

foreach ($tables as $table) {
    $stmt = $db->query("SHOW COLUMNS FROM {$table} LIKE 'published_at'");
    if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
        $db->exec("ALTER TABLE {$table} ADD COLUMN published_at TIMESTAMP NULL DEFAULT NULL");
        echo "Added published_at to {$table}\n";
    } else {
        echo "{$table} already has published_at\n";
    }
}

echo "Done.\n";
