<?php

namespace Utils;

use Config\Config;

class FileUploader {
    private static function hasCloudinaryConfig() {
        return (bool) (
            Config::get('CLOUDINARY_CLOUD_NAME') ||
            Config::get('CLOUDINARY_CLOUD') ||
            Config::get('CLOUDINARY_URL')
        );
    }

    public static function isCloudinaryConfigured() {
        return self::hasCloudinaryConfig();
    }

    /**
     * Upload a file to Cloudinary and return the secure URL.
     * Falls back to local storage only when Cloudinary is not configured.
     *
     * @param array  $file      The element from $_FILES
     * @param string $subFolder Optional Cloudinary folder (e.g. "course_1/chapter_2")
     * @return string|array The Cloudinary secure URL on success, or ['error' => '...'] on failure
     */
    public static function upload($file, $subFolder = '') {
        // 1. Basic checks
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['error' => 'File upload failed or was interrupted.'];
        }

        // 2. Validate Size
        if ($file['size'] > Config::maxFileSize()) {
            return ['error' => 'File is too large. Max limit is 50MB.'];
        }

        // 3. Validate Extension
        $filename  = $file['name'];
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($extension, Config::allowedExtensions())) {
            return ['error' => 'Unsupported file type. Allowed: ' . implode(', ', Config::allowedExtensions())];
        }

        // 4. Build a clean unique public_id for Cloudinary
        $safeBaseName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($filename, PATHINFO_FILENAME));
        $publicId     = uniqid() . '_' . $safeBaseName;

        // 5. Upload to Cloudinary
        if (self::hasCloudinaryConfig()) {
            $folder = $subFolder ? trim($subFolder, '/') : '';
            $result = CloudinaryUploader::upload($file['tmp_name'], $folder, $publicId, $filename);

            if (isset($result['error'])) {
                return $result;
            }

            if (isset($result['secure_url'])) {
                return $result['secure_url'];
            }
        }

        // 6. Fallback: Save locally (original behaviour)
        $uploadBase   = Config::uploadPath();
        $targetFolder = $uploadBase . ($subFolder ? trim($subFolder, '/') . '/' : '');

        if (!is_dir($targetFolder)) {
            mkdir($targetFolder, 0777, true);
        }

        $safeName   = uniqid() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", $filename);
        $targetPath = $targetFolder . $safeName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            return ($subFolder ? trim($subFolder, '/') . '/' : '') . $safeName;
        }

        return ['error' => 'Failed to move uploaded file to destination.'];
    }

    /**
     * Upload an existing locally stored file from Uploads/ to Cloudinary.
     *
     * @param string $relativePath Path stored in DB, relative to Uploads/.
     * @param string $subFolder Optional Cloudinary folder.
     * @return string|array Cloudinary secure URL on success, or ['error' => '...'].
     */
    public static function uploadStoredFile($relativePath, $subFolder = '') {
        if (!self::hasCloudinaryConfig()) {
            return ['error' => 'Cloudinary credentials are not configured in .env'];
        }

        $normalizedPath = ltrim(str_replace('\\', '/', (string)$relativePath), '/');
        if (preg_match('#/Uploads/(.+)$#i', $normalizedPath, $matches)) {
            $normalizedPath = ltrim($matches[1], '/');
        }

        $absolutePath = Config::uploadPath() . $normalizedPath;

        if (!is_file($absolutePath)) {
            return ['error' => 'Local file not found for Cloudinary migration.'];
        }

        if (filesize($absolutePath) > Config::maxFileSize()) {
            return ['error' => 'File is too large. Max limit is 50MB.'];
        }

        $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));
        if (!in_array($extension, Config::allowedExtensions())) {
            return ['error' => 'Unsupported file type. Allowed: ' . implode(', ', Config::allowedExtensions())];
        }

        $safeBaseName = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($absolutePath, PATHINFO_FILENAME));
        $publicId = uniqid() . '_' . $safeBaseName;
        $folder = $subFolder ? trim($subFolder, '/') : trim(dirname($normalizedPath), './\\');

        $result = CloudinaryUploader::upload($absolutePath, $folder, $publicId, basename($absolutePath));
        if (isset($result['error'])) {
            return $result;
        }

        return $result['secure_url'] ?? ['error' => 'Cloudinary upload did not return a secure URL.'];
    }
}
