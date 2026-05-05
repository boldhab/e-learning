<?php

namespace Controllers;

use Utils\FileUploader;

class DebugController {
    private function isLocalRequest() {
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
        return in_array($remoteAddr, ['127.0.0.1', '::1'], true);
    }

    public function testCloudinaryUpload() {
        if (!$this->isLocalRequest()) {
            http_response_code(403);
            echo json_encode(['error' => 'This debug endpoint is available only from localhost.']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Use POST with multipart/form-data and a file field named "file".']);
            return;
        }

        if (!FileUploader::isCloudinaryConfigured()) {
            http_response_code(400);
            echo json_encode(['error' => 'Cloudinary is not configured in backend/.env']);
            return;
        }

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'Attach a file using the multipart field named "file".']);
            return;
        }

        $folder = trim((string) ($_POST['folder'] ?? 'debug/cloudinary-test'), '/');
        $result = FileUploader::upload($_FILES['file'], $folder);

        if (is_array($result) && isset($result['error'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'folder' => $folder,
                'details' => $result['error']
            ]);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'message' => 'Cloudinary upload test completed successfully.',
            'folder' => $folder,
            'file_url' => $result,
            'original_name' => $_FILES['file']['name'] ?? null,
            'size' => $_FILES['file']['size'] ?? null
        ]);
    }
}
