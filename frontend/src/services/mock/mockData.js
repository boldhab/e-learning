export const mockCourses = [
  {
    id: 1,
    title: "Advanced Web Development with React",
    description: "Master modern frontend frameworks and building scalable applications.",
    instructor: "Dr. Sarah Johnson",
    level: "Advanced",
    duration: "12 Weeks",
    students: 1240,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400",
    progress: 45,
    lessons: [
      { id: 101, title: "Introduction to React Hooks", duration: "45m", complete: true },
      { id: 102, title: "State Management with Context API", duration: "1h 20m", complete: true },
      { id: 103, title: "Advanced Patterns in React", duration: "55m", complete: false },
    ]
  },
  {
    id: 2,
    title: "Full-Stack PHP Mastery",
    description: "Build robust backends with modern PHP 8 and SQL databases.",
    instructor: "Michael Chen",
    level: "Intermediate",
    duration: "10 Weeks",
    students: 850,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?auto=format&fit=crop&q=80&w=400",
    progress: 20,
    lessons: [
      { id: 201, title: "PDO and Database Security", duration: "1h 10m", complete: true },
      { id: 202, title: "RESTful API Design", duration: "1h 30m", complete: false },
    ]
  },
  {
    id: 3,
    title: "UI/UX Design Principles",
    description: "Learn how to create stunning user interfaces and great user experiences.",
    instructor: "Emily Rodriguez",
    level: "Beginner",
    duration: "8 Weeks",
    students: 2100,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=400",
    progress: 85,
    lessons: [
      { id: 301, title: "Typography and Color Theory", duration: "30m", complete: true },
      { id: 302, title: "Wireframing in Figma", duration: "50m", complete: true },
    ]
  }
];

export const mockAssignments = [
  {
    id: 1,
    courseId: 1,
    title: "Build a Weather Dashboard",
    description: "Use OpenWeather API and React to create a responsive weather app.",
    dueDate: "2026-04-25",
    status: "pending", // pending, submitted, graded
    points: 100
  },
  {
    id: 2,
    courseId: 3,
    title: "Final Portfolio Wireframe",
    description: "Submit your final high-fidelity wireframes for your portfolio project.",
    dueDate: "2026-04-20",
    status: "submitted",
    points: 50
  }
];

export const mockStats = {
  activeStudents: 450,
  activeTeachers: 32,
  averageGrade: "A-",
  contentUploads: 12,
  pendingAssignments: 3,
  systemUptime: "99.99%",
  monthlyRevenue: "$12,450"
};

export const mockUsers = [
  { id: 1, name: "Admin User", email: "admin@school.com", role: "admin", status: "active", joined: "2024-01-15" },
  { id: 2, name: "Dr. Sarah Johnson", email: "sarah.j@school.com", role: "teacher", status: "active", joined: "2024-02-10" },
  { id: 3, name: "Michael Chen", email: "m.chen@school.com", role: "teacher", status: "active", joined: "2024-02-12" },
  { id: 4, name: "John Doe", email: "student@school.com", role: "student", status: "active", joined: "2024-03-01" },
  { id: 5, name: "Jane Smith", email: "jane.s@school.com", role: "student", status: "active", joined: "2024-03-05" },
  { id: 6, name: "Alex Rover", email: "alex.r@school.com", role: "student", status: "suspended", joined: "2024-03-10" },
  { id: 7, name: "Emily Davis", email: "emily.d@school.com", role: "student", status: "active", joined: "2024-03-12" },
  { id: 8, name: "Kevin Hart", email: "kevin.h@school.com", role: "teacher", status: "inactive", joined: "2024-03-15" },
];
