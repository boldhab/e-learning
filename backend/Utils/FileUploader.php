<?php

namespace Utils;

use Config\Config;

class FileUploader {
    /**
     * Upload a file and return the saved path relative to Uploads folder
     * @param array $file The element from $_FILES
     * @param string $subFolder Optional subfolder (e.g. course_1)
     * @return string|array The file path on success, or an array with 'error' message
     */
    public static function upload($file, $subFolder = '') {
        // 1. Basic checks
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['error' => 'File upload failed or was interrupted.'];
        }

        // 2. Validate Size
        if ($file['size'] > Config::$MAX_FILE_SIZE) {
            return ['error' => 'File is too large. Max limit is 50MB.'];
        }

        // 3. Validate Extension
        $filename = $file['name'];
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($extension, Config::$ALLOWED_EXTENSIONS)) {
            return ['error' => 'Unsupported file type. Allowed: ' . implode(', ', Config::$ALLOWED_EXTENSIONS)];
        }

        // 4. Prepare Destination
        $uploadBase = Config::$UPLOAD_PATH;
        $targetFolder = $uploadBase . ($subFolder ? trim($subFolder, '/') . '/' : '');

        if (!is_dir($targetFolder)) {
            mkdir($targetFolder, 0777, true);
        }

        // Generate unique name to prevent collisions
        $safeName = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", $filename);
        $targetPath = $targetFolder . $safeName;

        // 5. Move file
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            // Return relative path for database storage
            return ($subFolder ? trim($subFolder, '/') . '/' : '') . $safeName;
        }

        return ['error' => 'Failed to move uploaded file to destination.'];
    }
}
