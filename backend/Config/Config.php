<?php

namespace Config;

class Config {
    // Secret key for JWT signing. 
    // IMPORTANT: In a production environment, this should be stored in a .env file.
    public static $JWT_SECRET = '9e4b7c2a1f8d5e3a6b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4g3h2i1j0k9l8m';
    
    // Token expiration time (e.g., 24 hours)
    public static $TOKEN_EXPIRY = 86440;

    // Upload Settings
    public static $UPLOAD_PATH = __DIR__ . '/../Uploads/';
    public static $MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    public static $ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mp3', 'jpg', 'png'];
}
