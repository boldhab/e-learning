<?php

namespace Controllers;

use Models\User;

class AuthController {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    /**
     * Handle the login request
     */
    public function login() {
        // Read JSON input
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        $email = $data['email'];
        $password = $data['password'];

        // Find user by email
        $user = $this->userModel->findByEmail($email);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        // Verify password
        if (password_verify($password, $user['password_hash'])) {
            // Success! Return user data (excluding password)
            unset($user['password_hash']);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Login successful',
                'user' => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
        }
    }
}
