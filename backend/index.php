<?php

/**
 * Millennium School E-Learning API
 * Master Entry Point & Router
 */

// 1. Set CORS Headers (Crucial for React <-> PHP communication)
header('Access-Control-Allow-Origin: *'); // In production, replace * with your frontend domain
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Autoloading (Simple logic for now, using project structure)
spl_autoload_register(function ($class) {
    $class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = __DIR__ . DIRECTORY_SEPARATOR . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// 3. Simple API Routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_parts = explode('/', trim($uri, '/'));

// Expected URI format: /api/{resource}/{id}
// For now, simplify for local development if running directly in the backend folder
$api_index = array_search('api', $uri_parts);
$resource = $uri_parts[$api_index + 1] ?? 'status';
$id = $uri_parts[$api_index + 2] ?? null;

// Basic Router logic
switch ($resource) {
    case 'status':
        echo json_encode([
            'status' => 'online',
            'version' => '1.0.0',
            'message' => 'Millennium School E-Learning API is running.'
        ]);
        break;

    case 'auth':
        $controller = new \Controllers\AuthController();
        if ($id === 'login') {
            $controller->login();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Auth action not found']);
        }
        break;

    case 'courses':
        // CourseController handler will go here
        echo json_encode(['message' => 'Courses route hit']);
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Resource not found: ' . $resource]);
        break;
}
