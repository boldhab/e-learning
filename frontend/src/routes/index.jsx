import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Layout
import Layout from '../components/layout/Layout';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import NotFound from '../pages/errors/NotFound';
import { PagePlaceholder } from '../components/common/PagePlaceholder';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import CourseContentEditor from '../pages/teacher/CourseContentEditor';

const ComingSoonPage = () => (
  <PagePlaceholder
    variant="comingSoon"
    title="Coming Soon"
    description="This page is temporarily disabled. Only Login and Register are available right now."
    action={false}
    secondaryAction={false}
  />
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes: all app pages show Coming Soon */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="teacher/course/:courseId/edit" element={<CourseContentEditor />} />
        <Route path="*" element={<ComingSoonPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
