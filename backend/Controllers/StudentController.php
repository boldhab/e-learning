<?php

namespace Controllers;

use Models\User;
use Models\Assignment;
use Models\AcademicYear;
use Models\Chapter;
use Models\ChapterNote;
use Models\Material;
use Core\JwtHandler;

class StudentController {
    private $userModel;
    private $assignmentModel;
    private $yearModel;
    private $chapterModel;
    private $noteModel;
    private $materialModel;

    public function __construct() {
        $this->userModel = new User();
        $this->assignmentModel = new Assignment();
        $this->yearModel = new AcademicYear();
        $this->chapterModel = new Chapter();
        $this->noteModel = new ChapterNote();
        $this->materialModel = new Material();
    }

    /**
     * Get the student's assigned schedule (subjects and teachers)
     */
    public function getSchedule() {
        // 1. Verify Authorization
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        
        if (strpos($authHeader, 'Bearer ') !== 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Missing or invalid token']);
            return;
        }

        $token = substr($authHeader, 7);
        $decoded = JwtHandler::validateToken($token);

        if (!$decoded || $decoded['role'] !== 'student') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Only students can access the student schedule']);
            return;
        }

        // 2. Fetch Student Data to get their class_id
        $student = $this->userModel->findById($decoded['id']);
        
        if (!$student['class_id']) {
            echo json_encode([
                'status' => 'success',
                'message' => 'You are not yet assigned to a specific class section.',
                'class' => null,
                'schedule' => []
            ]);
            return;
        }

        // 3. Get Active Academic Year
        $activeYear = $this->yearModel->getActiveYear();
        if (!$activeYear) {
            http_response_code(500);
            echo json_encode(['error' => 'No active academic year found']);
            return;
        }

        // 4. Fetch all assignments for this class and the active year
        $schedule = $this->assignmentModel->getByClass($student['class_id'], $activeYear['id']);

        echo json_encode([
            'status' => 'success',
            'academic_year' => $activeYear['name'],
            'class' => [
                'id' => $student['class_id'],
                'name' => $student['class_name']
            ],
            'schedule' => $schedule
        ]);
    }

    /**
     * Get full course content grouped by chapters
     */
    public function getCourseContent() {
        // Simple verification (public or based on student enrollment)
        $courseId = $_GET['course_id'] ?? null;
        if (!$courseId) {
            http_response_code(400);
            echo json_encode(['error' => 'Course ID is required']);
            return;
        }

        // 1. Fetch all chapters
        $chapters = $this->chapterModel->getByCourse($courseId);
        $structuredChapters = [];

        foreach ($chapters as $chapter) {
            // 2. Fetch published notes
            $notes = $this->noteModel->getByChapter($chapter['id'], true);
            
            // 3. Fetch materials
            $learning = $this->materialModel->getLearningByChapter($chapter['id']);
            $reference = $this->materialModel->getReferenceByChapter($chapter['id']);

            $structuredChapters[] = [
                'id' => $chapter['id'],
                'title' => $chapter['title'],
                'order' => $chapter['order_index'],
                'notes' => $notes,
                'learning_materials' => $learning,
                'reference_materials' => $reference
            ];
        }

        echo json_encode([
            'status' => 'success',
            'course_id' => $courseId,
            'chapters' => $structuredChapters
        ]);
    }
}
