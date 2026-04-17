import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Layout
import Layout from '../components/layout/Layout';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import StudentDashboard from '../pages/student/StudentDashboard';
import MyLearning from '../pages/student/MyLearning';
import Assignments from '../pages/student/Assignments';
import MyGrades from '../pages/student/MyGrades';
import Messaging from '../pages/student/Messaging';
import CourseView from '../pages/student/CourseView';
import GradesView from '../pages/student/GradesView';
import AssignmentSubmit from '../pages/student/AssignmentSubmit';
import AttendanceView from '../pages/student/AttendanceView';
import PerformanceReport from '../pages/student/PerformanceReport';
import ForumView from '../pages/student/ForumView';
import LiveClassJoin from '../pages/student/LiveClassJoin';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import ContentUpload from '../pages/teacher/ContentUpload';
import GradingView from '../pages/teacher/GradingView';
import AssignmentCreate from '../pages/teacher/AssignmentCreate';
import AttendanceMark from '../pages/teacher/AttendanceMark';
import LiveClass from '../pages/teacher/LiveClass';
import ForumManage from '../pages/teacher/ForumManage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import TimetableManager from '../pages/admin/TimetableManager';
import SystemBackup from '../pages/admin/SystemBackup';
import Profile from '../pages/common/Profile';
import Notifications from '../pages/common/Notifications';
import HelpCenter from '../pages/common/HelpCenter';
import Unauthorized from '../pages/errors/Unauthorized';
import NotFound from '../pages/errors/NotFound';

// Dashboard Switcher Logic
const DashboardSwitcher = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
};

const CoursesSwitcher = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <ContentUpload />;
  if (user?.role === 'student') return <MyLearning />;
  return <TimetableManager />;
};

const AssignmentsSwitcher = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <AssignmentCreate />;
  return <Assignments />;
};

const MessagesSwitcher = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <ForumManage />;
  if (user?.role === 'student') return <Messaging />;
  return <Notifications />;
};

const PerformanceSwitcher = () => {
  const { user } = useAuth();
  if (user?.role === 'teacher') return <GradingView />;
  if (user?.role === 'student') return <MyGrades />;
  return <AdminDashboard />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Dashboard Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardSwitcher />
          </ProtectedRoute>
        } />
        
        {/* Admin Specific Routes */}
        <Route path="admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />

        <Route path="admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><TimetableManager /></ProtectedRoute>} />
        <Route path="admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><SystemBackup /></ProtectedRoute>} />

        {/* Shared Routes (role-aware) */}
        <Route path="courses" element={<CoursesSwitcher />} />
        <Route path="assignments" element={<AssignmentsSwitcher />} />
        <Route path="messages" element={<MessagesSwitcher />} />
        <Route path="performance" element={<PerformanceSwitcher />} />

        {/* Student Module Routes */}
        <Route path="student/courses" element={<MyLearning />} />
        <Route path="student/assignments" element={<Assignments />} />
        <Route path="student/grades" element={<MyGrades />} />
        <Route path="student/messages" element={<Messaging />} />
        <Route path="student/course-view" element={<CourseView />} />
        <Route path="student/grades-view" element={<GradesView />} />
        <Route path="student/assignment-submit" element={<AssignmentSubmit />} />
        <Route path="student/attendance" element={<AttendanceView />} />
        <Route path="student/performance-report" element={<PerformanceReport />} />
        <Route path="student/forum" element={<ForumView />} />
        <Route path="student/live-class" element={<LiveClassJoin />} />

        {/* Teacher Module Routes */}
        <Route path="teacher/courses" element={<ProtectedRoute allowedRoles={['teacher']}><ContentUpload /></ProtectedRoute>} />
        <Route path="teacher/grading" element={<ProtectedRoute allowedRoles={['teacher']}><GradingView /></ProtectedRoute>} />
        <Route path="teacher/assignments/create" element={<ProtectedRoute allowedRoles={['teacher']}><AssignmentCreate /></ProtectedRoute>} />
        <Route path="teacher/attendance" element={<ProtectedRoute allowedRoles={['teacher']}><AttendanceMark /></ProtectedRoute>} />
        <Route path="teacher/live-class" element={<ProtectedRoute allowedRoles={['teacher']}><LiveClass /></ProtectedRoute>} />
        <Route path="teacher/forum" element={<ProtectedRoute allowedRoles={['teacher']}><ForumManage /></ProtectedRoute>} />

        {/* Common Routes */}
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="help" element={<HelpCenter />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
