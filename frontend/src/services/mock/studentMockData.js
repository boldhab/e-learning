export const studentDashboardData = {
  streakDays: 6,
  weeklyStudyTargetHours: 6,
  weeklyStudyCompletedHours: 3.5,
  weeklyLessonTarget: 3,
  weeklyLessonCompleted: 2,
};

export const studentLearningData = {
  milestones: [
    { id: 1, title: 'Complete React Hooks module', progress: 80, dueDate: '2026-04-22' },
    { id: 2, title: 'Submit API Design quiz', progress: 40, dueDate: '2026-04-24' },
    { id: 3, title: 'Finish portfolio wireframe review', progress: 60, dueDate: '2026-04-28' },
  ],
  recommendedTopics: [
    'State management with context patterns',
    'Secure authentication flow design',
    'UI accessibility and interaction states',
  ],
};

// services/mock/studentMockData.js
export const studentAssignmentsData = [
  {
    id: 1,
    title: "React Hooks Deep Dive",
    course: "Advanced React Development",
    description: "Implement custom hooks and understand the hook lifecycle",
    dueDate: "2024-12-20",
    points: 100,
    status: "pending",
    submissionType: "File Upload",
    attachment: "/materials/react-hooks-guide.pdf",
    createdAt: "2024-12-01"
  },
  {
    id: 2,
    title: "Node.js REST API",
    course: "Backend Development",
    description: "Build a RESTful API with Express and MongoDB",
    dueDate: "2024-12-18",
    points: 150,
    status: "submitted",
    submissionType: "GitHub Link",
    attachment: "/materials/api-spec.pdf",
    createdAt: "2024-12-02"
  },
  {
    id: 3,
    title: "Database Design Project",
    course: "Database Systems",
    description: "Design and implement a normalized database schema",
    dueDate: "2024-12-15",
    points: 200,
    status: "graded",
    grade: 185,
    feedback: "Excellent work! Great normalization and indexing strategy.",
    submissionType: "File Upload",
    attachment: "/materials/db-template.sql",
    createdAt: "2024-11-28"
  },
  {
    id: 4,
    title: "UI/UX Case Study",
    course: "User Experience Design",
    description: "Analyze and redesign a popular app interface",
    dueDate: "2024-12-22",
    points: 120,
    status: "pending",
    submissionType: "PDF Upload",
    attachment: "/materials/case-study-template.pdf",
    createdAt: "2024-12-05"
  },
  {
    id: 5,
    title: "Algorithm Analysis",
    course: "Data Structures & Algorithms",
    description: "Implement and analyze sorting algorithms",
    dueDate: "2024-12-10",
    points: 80,
    status: "graded",
    grade: 75,
    feedback: "Good implementation, but optimize the merge sort.",
    submissionType: "Code Upload",
    attachment: "/materials/algorithms-guide.pdf",
    createdAt: "2024-12-03"
  }
];

export const studentGradesData = {
  summary: {
    gpa: 3.72,
    average: 88,
    attendance: 93,
  },
  gradebook: [
    { id: 1, course: 'Advanced Web Development with React', assessment: 'Hooks Deep Dive', score: 92, maxScore: 100, weight: '20%' },
    { id: 2, course: 'Full-Stack PHP Mastery', assessment: 'API Design Quiz', score: 81, maxScore: 100, weight: '15%' },
    { id: 3, course: 'UI/UX Design Principles', assessment: 'Prototype Review', score: 95, maxScore: 100, weight: '25%' },
    { id: 4, course: 'Advanced Web Development with React', assessment: 'Mini Project', score: 88, maxScore: 100, weight: '40%' },
  ],
};

export const studentMessagesData = {
  unreadCount: 3,
  threads: [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Instructor',
      lastMessage: 'Please review the rubric before final submission.',
      time: '09:24 AM',
      unread: true,
    },
    {
      id: 2,
      name: 'UI/UX Team Group',
      role: 'Group Chat',
      lastMessage: 'I uploaded the latest wireframe updates.',
      time: 'Yesterday',
      unread: true,
    },
    {
      id: 3,
      name: 'Course Support',
      role: 'Support',
      lastMessage: 'Your extension request has been approved.',
      time: 'Apr 15',
      unread: false,
    },
  ],
};