<?php

namespace Utils;

/**
 * CloudinaryUploader
 *
 * Uploads files to Cloudinary using the REST API (no SDK / Composer required).
 * Credentials are read from environment variables set by the .env loader in index.php.
 */
class CloudinaryUploader {
    /**
     * Resolve Cloudinary cloud name from common env keys and CLOUDINARY_URL.
     */
    private static function resolveCloudName() {
        $cloudName = \Config\Config::get('CLOUDINARY_CLOUD_NAME');
        if (!empty($cloudName)) {
            return $cloudName;
        }

        $cloudName = \Config\Config::get('CLOUDINARY_CLOUD');
        if (!empty($cloudName)) {
            return $cloudName;
        }

        $cloudinaryUrl = \Config\Config::get('CLOUDINARY_URL', '');
        if (!empty($cloudinaryUrl)) {
            $parts = parse_url($cloudinaryUrl);
            if (!empty($parts['host'])) {
                return $parts['host'];
            }
        }

        return '';
    }

    /**
     * Upload a file from a temp path to Cloudinary.
     *
     * @param string $tmpPath The temporary file path.
     * @param string $folder Optional Cloudinary folder.
     * @param string $publicId Optional custom public ID.
     * @param string $originalName Optional original filename.
     * @return array
     */
    public static function upload($tmpPath, $folder = '', $publicId = '', $originalName = '') {
        $cloudName = self::resolveCloudName();
        $apiKey = \Config\Config::get('CLOUDINARY_API_KEY');
        $apiSecret = \Config\Config::get('CLOUDINARY_API_SECRET');

        $cloudinaryUrl = \Config\Config::get('CLOUDINARY_URL', '');
        if ((!$apiKey || !$apiSecret) && !empty($cloudinaryUrl)) {
            $parts = parse_url($cloudinaryUrl);
            $apiKey = $apiKey ?: ($parts['user'] ?? '');
            $apiSecret = $apiSecret ?: ($parts['pass'] ?? '');
        }

        if (!$cloudName || !$apiKey || !$apiSecret) {
            return ['error' => 'Cloudinary credentials are not configured in .env'];
        }

        $timestamp = time();
        $sigParams = ['timestamp' => $timestamp];
        if ($folder) {
            $sigParams['folder'] = $folder;
        }
        if ($publicId) {
            $sigParams['public_id'] = $publicId;
        }

        ksort($sigParams);

        $pairs = [];
        foreach ($sigParams as $key => $value) {
            $pairs[] = $key . '=' . $value;
        }

        $sigString = implode('&', $pairs) . $apiSecret;
        $signature = sha1($sigString);

        $configuredPrefix = trim((string) \Config\Config::get('CLOUDINARY_UPLOAD_PREFIX', ''));
        $uploadPrefixes = [];
        if (!empty($configuredPrefix)) {
            $uploadPrefixes[] = rtrim($configuredPrefix, '/');
        } else {
            $uploadPrefixes = [
                'https://api.cloudinary.com',
                'https://api-eu.cloudinary.com',
                'https://api-ap.cloudinary.com'
            ];
        }

        $mimeType = function_exists('mime_content_type')
            ? (mime_content_type($tmpPath) ?: 'application/octet-stream')
            : 'application/octet-stream';

        $postFields = [
            'file' => new \CURLFile($tmpPath, $mimeType, $originalName ?: basename($tmpPath)),
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
        ];

        if ($folder) {
            $postFields['folder'] = $folder;
        }
        if ($publicId) {
            $postFields['public_id'] = $publicId;
        }

        $lastError = '';
        foreach ($uploadPrefixes as $prefix) {
            $uploadUrl = $prefix . "/v1_1/{$cloudName}/auto/upload";

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $uploadUrl,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $postFields,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 120,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                $lastError = 'cURL error during Cloudinary upload: ' . $curlError;
                continue;
            }

            $data = json_decode($response, true);
            if ($httpCode === 200 && !isset($data['error'])) {
                return [
                    'secure_url' => $data['secure_url'],
                    'public_id' => $data['public_id'],
                ];
            }

            $msg = $data['error']['message'] ?? ('Cloudinary upload failed (HTTP ' . $httpCode . ')');
            $lastError = $msg;

            if (stripos($msg, 'Invalid cloud_name') !== false) {
                continue;
            }

            return ['error' => $msg];
        }

        if (stripos($lastError, 'Invalid cloud_name') !== false) {
            return [
                'error' => 'Invalid Cloudinary cloud name or region endpoint. Confirm CLOUDINARY_CLOUD_NAME and set CLOUDINARY_UPLOAD_PREFIX in backend/.env (for example https://api-eu.cloudinary.com or https://api-ap.cloudinary.com).'
            ];
        }

        return ['error' => $lastError ?: 'Cloudinary upload failed.'];
    }
}
