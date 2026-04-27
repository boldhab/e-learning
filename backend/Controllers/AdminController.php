<?php

namespace Controllers;

use Models\ClassModel;
use Models\Subject;
use Models\Assignment;
use Models\User;
use Models\AcademicYear;
use Models\Course;
use Core\JwtHandler;
use Core\Database;

class AdminController {
    private $classModel;
    private $subjectModel;
    private $assignmentModel;
    private $userModel;
    private $yearModel;
    private $courseModel;
    private $db;

    public function __construct() {
        $this->classModel = new ClassModel();
        $this->subjectModel = new Subject();
        $this->assignmentModel = new Assignment();
        $this->userModel = new User();
        $this->yearModel = new AcademicYear();
        $this->courseModel = new Course();
        $this->db = Database::getInstance()->getConnection();
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
     * Return admin dashboard data and supporting lists.
     */
    public function getOverview() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $counts = $this->userModel->getRoleCounts();
        $years = $this->yearModel->getAll();
        $activeYear = $this->yearModel->getActiveYear();
        $users = $this->userModel->getAll();
        $assignments = $this->assignmentModel->getAll();

        echo json_encode([
            'status' => 'success',
            'stats' => [
                'total_users' => (int)($counts['total_users'] ?? 0),
                'total_students' => (int)($counts['total_students'] ?? 0),
                'total_teachers' => (int)($counts['total_teachers'] ?? 0),
                'total_admins' => (int)($counts['total_admins'] ?? 0),
                'total_classes' => count($this->classModel->getAll()),
                'total_subjects' => count($this->subjectModel->getAll()),
                'total_assignments' => count($assignments),
                'total_years' => count($years),
            ],
            'active_year' => $activeYear,
            'recent_users' => array_slice($users, 0, 5),
            'recent_assignments' => array_slice($assignments, 0, 5),
        ]);
    }

    public function listUsers() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $role = $_GET['role'] ?? null;
        echo json_encode([
            'status' => 'success',
            'users' => $this->userModel->getAll($role)
        ]);
    }

    public function listYears() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'years' => $this->yearModel->getAll(),
            'active_year' => $this->yearModel->getActiveYear()
        ]);
    }

    public function listAssignments() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'assignments' => $this->assignmentModel->getAll()
        ]);
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

        if (empty($data['student_ids']) || !is_array($data['student_ids'])) {
            http_response_code(400);
            echo json_encode(['error' => 'At least one student must be assigned when creating a class']);
            return;
        }

        $studentIds = array_values(array_unique(array_filter(array_map('intval', $data['student_ids']))));
        if (count($studentIds) === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'At least one valid student must be assigned when creating a class']);
            return;
        }

        $activeYear = $this->yearModel->getActiveYear();
        if (!$activeYear) {
            http_response_code(500);
            echo json_encode(['error' => 'No active academic year found. Please create one first.']);
            return;
        }

        foreach ($studentIds as $studentId) {
            $student = $this->userModel->findById($studentId);
            if (!$student || $student['role'] !== 'student') {
                http_response_code(400);
                echo json_encode(['error' => "Invalid student ID provided: {$studentId}"]);
                return;
            }
        }

        try {
            $this->db->beginTransaction();

            $classId = $this->classModel->create($data['name']);
            if (!$classId) {
                $this->db->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create class. Name might already exist.']);
                return;
            }

            foreach ($studentIds as $studentId) {
                $enrolled = $this->userModel->enrollInYear($studentId, $classId, $activeYear['id']);
                $assigned = $this->userModel->assignToClass($studentId, $classId);

                if (!$enrolled || !$assigned) {
                    $this->db->rollBack();
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to assign one or more students to the new class']);
                    return;
                }
            }

            $this->db->commit();

            echo json_encode([
                'status' => 'success',
                'class_id' => $classId,
                'assigned_students' => count($studentIds),
                'message' => 'Class created and students assigned successfully'
            ]);
        } catch (\PDOException $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }

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
     * Delete a class
     */
    public function deleteClass() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Class ID is required']);
            return;
        }

        $class = $this->classModel->findById($id);
        if (!$class) {
            http_response_code(404);
            echo json_encode(['error' => 'Class not found']);
            return;
        }

        $activeYear = $this->yearModel->getActiveYear();
        if ($activeYear && $this->assignmentModel->hasActiveForClass($id, $activeYear['id'])) {
            http_response_code(409);
            echo json_encode([
                'error' => 'Cannot delete class with active teacher assignments',
                'details' => 'Remove the class assignments for the active academic year first.'
            ]);
            return;
        }

        if ($this->classModel->delete($id)) {
            echo json_encode(['status' => 'success', 'message' => 'Class deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete class']);
        }
    }

    /**
     * Delete a subject
     */
    public function deleteSubject() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Admin access only']);
            return;
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Subject ID is required']);
            return;
        }

        $subject = $this->subjectModel->findById($id);
        if (!$subject) {
            http_response_code(404);
            echo json_encode(['error' => 'Subject not found']);
            return;
        }

        $activeYear = $this->yearModel->getActiveYear();
        if ($activeYear && $this->assignmentModel->hasActiveForSubject($id, $activeYear['id'])) {
            http_response_code(409);
            echo json_encode([
                'error' => 'Cannot delete subject with active teacher assignments',
                'details' => 'Remove the subject assignments for the active academic year first.'
            ]);
            return;
        }

        if ($this->subjectModel->delete($id)) {
            echo json_encode(['status' => 'success', 'message' => 'Subject deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete subject']);
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
                // AUTOMATICALLY CREATE A COURSE ENTRY
                // Title format: "Subject Name - Class Name" (e.g. "Mathematics - Grade 10A")
                $className = $this->classModel->findById($data['class_id'])['name'];
                $subjectName = $subject['name'];
                $courseTitle = $subjectName . " - " . $className;

                // Check if course already exists to avoid duplicate teacher content areas
                if (!$this->courseModel->findExisting($courseTitle, $data['teacher_id'], $data['class_id'])) {
                    $this->courseModel->create($courseTitle, $data['teacher_id'], $data['class_id']);
                }

                echo json_encode(['status' => 'success', 'message' => 'Teacher assigned successfully and course area created']);
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

    /**
     * Get all users
     */
    public function getUsers() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $role = $_GET['role'] ?? null;
        $users = $this->userModel->getAll($role);
        echo json_encode(['status' => 'success', 'users' => $users]);
    }

    /**
     * Create a new user (Admin-side)
     */
    public function createUser() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name']) || empty($data['email']) || empty($data['role']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        // Check if email already exists
        if ($this->userModel->findByEmail($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already registered']);
            return;
        }

        $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $result = $this->userModel->create($data);
        if ($result) {
            echo json_encode(['status' => 'success', 'user_id' => $result]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }

    /**
     * Update user status
     */
    public function updateUserStatus() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['user_id']) || empty($data['status'])) {
            http_response_code(400);
            return;
        }

        if ($this->userModel->updateStatus($data['user_id'], $data['status'])) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
        }
    }

    /**
     * Reset a user's password
     */
    public function resetUserPassword() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['user_id']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID and new password are required']);
            return;
        }

        if (strlen($data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        $user = $this->userModel->findById($data['user_id']);
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
        if ($this->userModel->updatePassword($data['user_id'], $passwordHash)) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Password reset successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reset password']);
        }
    }

    /**
     * Delete a user
     */
    public function deleteUser() {
        if (!$this->verifyAdmin()) {
            http_response_code(403);
            return;
        }

        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            return;
        }

        if ($this->userModel->delete($id)) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
        }
    }
}
