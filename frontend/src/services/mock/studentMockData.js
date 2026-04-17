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

export const studentAssignmentsData = [
  {
    id: 1,
    title: 'Build a Weather Dashboard',
    course: 'Advanced Web Development with React',
    dueDate: '2026-04-25',
    points: 100,
    status: 'pending',
    submissionType: 'GitHub repository link',
  },
  {
    id: 2,
    title: 'REST API Security Checklist',
    course: 'Full-Stack PHP Mastery',
    dueDate: '2026-04-27',
    points: 70,
    status: 'pending',
    submissionType: 'PDF upload',
  },
  {
    id: 3,
    title: 'Final Portfolio Wireframe',
    course: 'UI/UX Design Principles',
    dueDate: '2026-04-20',
    points: 50,
    status: 'submitted',
    submissionType: 'Figma link',
  },
  {
    id: 4,
    title: 'Component Refactor Reflection',
    course: 'Advanced Web Development with React',
    dueDate: '2026-04-15',
    points: 40,
    status: 'graded',
    score: 36,
    submissionType: 'Markdown report',
  },
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
