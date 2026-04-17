<?php

namespace Controllers;

use Models\ClassModel;
use Models\Subject;
use Models\Assignment;
use Models\User;
use Models\AcademicYear;
use Core\JwtHandler;

class AdminController {
    private $classModel;
    private $subjectModel;
    private $assignmentModel;
    private $userModel;
    private $yearModel;

    public function __construct() {
        $this->classModel = new ClassModel();
        $this->subjectModel = new Subject();
        $this->assignmentModel = new Assignment();
        $this->userModel = new User();
        $this->yearModel = new AcademicYear();
    }

    /**
     * Verify if the request is from an Admin
     */
    private function verifyAdmin() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            return false;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded || $decoded['role'] !== 'admin') {
            return false;
        }

        return $decoded;
    }

    /**
     * Create a new class
     */
    public function createClass() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Class name is required']);
            return;
        }

        $result = $this->classModel->create($data['name']);
        if ($result) {
            echo json_encode(['status' => 'success', 'class_id' => $result]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create class. Name might already exist.']);
        }
    }

    /**
     * Create a new subject
     */
    public function createSubject() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Subject name is required']);
            return;
        }

        $result = $this->subjectModel->create($data['name']);
        if ($result) {
            echo json_encode(['status' => 'success', 'subject_id' => $result]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create subject. Name might already exist.']);
        }
    }

    /**
     * Assign a teacher to a class and subject
     */
    public function assignTeacher() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $required = ['class_id', 'subject_id', 'teacher_id'];
        
        foreach ($required as $field) {
            if (empty($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }

        // 1. Verify Teacher role and specialization
        $teacher = $this->userModel->findById($data['teacher_id']);
        if (!$teacher || $teacher['role'] !== 'teacher') {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid teacher ID']);
            return;
        }

        $subject = $this->subjectModel->findById($data['subject_id']);
        if (!$subject) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid subject ID']);
            return;
        }

        // SPECIALIZATION CHECK
        if (strcasecmp($teacher['teaching_subject'], $subject['name']) !== 0) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Teacher specialization mismatch',
                'details' => "Teacher specializes in '{$teacher['teaching_subject']}', but is being assigned to '{$subject['name']}'"
            ]);
            return;
        }

        // 2. Perform assignment
        try {
            $activeYear = $this->yearModel->getActiveYear();
            if (!$activeYear) {
                http_response_code(500);
                echo json_encode(['error' => 'No active academic year found. Please create one first.']);
                return;
            }

            $result = $this->assignmentModel->create(
                $data['class_id'], 
                $data['subject_id'], 
                $data['teacher_id'], 
                $activeYear['id']
            );
            
            if ($result) {
                echo json_encode(['status' => 'success', 'message' => 'Teacher assigned successfully']);
            }
        } catch (\PDOException $e) {
            http_response_code(500);
            if ($e->getCode() == 23000) { // Unique constraint violation
                echo json_encode(['error' => 'This class-subject combination already has a teacher assigned']);
            } else {
                echo json_encode(['error' => 'Assignment failed: ' . $e->getMessage()]);
            }
        }
    }

    /**
     * Assign a student to a specific class
     */
    public function assignStudentToClass() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['student_id']) || empty($data['class_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Student ID and Class ID are required']);
            return;
        }

        $student = $this->userModel->findById($data['student_id']);
        if (!$student || $student['role'] !== 'student') {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid student ID']);
            return;
        }

        $activeYear = $this->yearModel->getActiveYear();
        if (!$activeYear) {
            http_response_code(500);
            echo json_encode(['error' => 'No active academic year found']);
            return;
        }

        $result = $this->userModel->enrollInYear($data['student_id'], $data['class_id'], $activeYear['id']);
        if ($result) {
            // Also update the static class_id in users for current reference
            $this->userModel->assignToClass($data['student_id'], $data['class_id']);
            echo json_encode(['status' => 'success', 'message' => 'Student enrolled in class for the current academic year']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to assign student to class']);
        }
    }

    /**
     * Create a new academic year
     */
    public function createYear() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Year name is required (e.g. 2024-2025)']);
            return;
        }

        $result = $this->yearModel->create($data['name']);
        if ($result) {
            echo json_encode(['status' => 'success', 'year_id' => $result]);
        } else {
            echo json_encode(['error' => 'Failed to create year']);
        }
    }

    /**
     * Set the current active academic year
     */
    public function setActiveYear() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['year_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Year ID is required']);
            return;
        }

        if ($this->yearModel->setActive($data['year_id'])) {
            echo json_encode(['status' => 'success', 'message' => 'Academic year updated successfully']);
        } else {
            echo json_encode(['error' => 'Failed to update academic year']);
        }
    }
}
