const buildModule = (title, subtitle, cta = 'Open Module') => ({
  title,
  subtitle,
  cta,
  metrics: [
    { label: 'Completion', value: '72%' },
    { label: 'Updated', value: 'Today' },
    { label: 'Status', value: 'Active' },
  ],
  items: [
    'Mock data is connected and ready for UI testing.',
    'Role-based access and navigation are configured.',
    'Detailed workflows can be plugged in when backend APIs are ready.',
  ],
});

export const modulePageMockData = {
  courseView: buildModule('Course View', 'Browse enrolled courses, lessons, and progress.', 'Open Courses'),
  performanceReport: buildModule('Performance Report', 'Track results, trends, and achievement milestones.', 'View Reports'),
  unauthorized: buildModule('Unauthorized', 'You do not have permission to access this page.', 'Back to Dashboard'),
  notFound: buildModule('Page Not Found', 'The requested page does not exist or has moved.', 'Go Home'),
  timetableManager: buildModule('Timetable Manager', 'Plan, update, and publish class schedules.', 'Manage Timetable'),
  systemBackup: buildModule('System Backup', 'Monitor and manage backup operations safely.', 'Open Backups'),
  assignmentCreate: buildModule('Assignment Create', 'Create and publish assignments with grading rules.', 'Create Assignment'),
  gradingView: buildModule('Grading View', 'Review submissions and finalize student scores.', 'Open Grading'),
  liveClass: buildModule('Live Class', 'Start or join live classroom sessions.', 'Enter Live Class'),
  profile: buildModule('Profile', 'Manage account profile, preferences, and visibility.', 'Edit Profile'),
  attendanceMark: buildModule('Attendance Mark', 'Record and verify student attendance.', 'Mark Attendance'),
  notifications: buildModule('Notifications', 'Review alerts, reminders, and announcements.', 'View Notifications'),
  forumManage: buildModule('Forum Manage', 'Moderate discussions and pin important threads.', 'Manage Forum'),
  helpCenter: buildModule('Help Center', 'Find guides, FAQs, and support contact options.', 'Open Help Center'),
  contentUpload: buildModule('Content Upload', 'Upload learning content and organize materials.', 'Upload Content'),
  assignmentSubmit: buildModule('Assignment Submit', 'Submit work, check deadlines, and view feedback.', 'Submit Assignment'),
};