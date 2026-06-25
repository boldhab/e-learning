<?php

// Simple helper to create an admin user from the command line.
// Usage: php create_admin.php email password [name]

require __DIR__ . '/../Config/Config.php';
require __DIR__ . '/../Core/Database.php';
require __DIR__ . '/../Models/User.php';

use Models\User;

if (PHP_SAPI !== 'cli') {
    echo "This script must be run from the command line.\n";
    exit(1);
}

$argc = $_SERVER['argc'];
$argv = $_SERVER['argv'];

if ($argc < 3) {
    echo "Usage: php create_admin.php email password [name]\n";
    exit(1);
}

$email = $argv[1];
$password = $argv[2];
$name = $argv[3] ?? 'Site Admin';

try {
    $userModel = new User();

    $existing = $userModel->findByEmail($email);
    if ($existing) {
        echo "A user with email {$email} already exists (id: " . ($existing['id'] ?? 'unknown') . ").\n";
        exit(1);
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $data = [
        'name' => $name,
        'email' => $email,
        'password_hash' => $password_hash,
        'role' => 'admin',
        'grade' => null,
        'teaching_subject' => null,
        'class_id' => null,
    ];

    $newId = $userModel->create($data);

    if ($newId) {
        echo "Created admin user {$email} with id {$newId}\n";
        exit(0);
    } else {
        echo "Failed to create admin user.\n";
        exit(1);
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
