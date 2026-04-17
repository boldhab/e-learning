import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

// Dashboard Switcher Logic
const DashboardSwitcher = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
          <Route path="admin/courses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="p-10 text-slate-400 font-bold uppercase tracking-widest text-center glass m-10 rounded-3xl">System Courses Manager (Coming Soon)</div>
            </ProtectedRoute>
          } />
          <Route path="admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="p-10 text-slate-400 font-bold uppercase tracking-widest text-center glass m-10 rounded-3xl">Global System Settings (Coming Soon)</div>
            </ProtectedRoute>
          } />
          
          {/* Shared/Role-Specific Routes */}
          <Route path="courses" element={<div className="p-10 text-slate-400 font-bold text-center">Courses Module</div>} />
          <Route path="assignments" element={<div className="p-10 text-slate-400 font-bold text-center">Assignments Module</div>} />
          <Route path="messages" element={<div className="p-10 text-slate-400 font-bold text-center">Messaging Center</div>} />
          <Route path="performance" element={<div className="p-10 text-slate-400 font-bold text-center">Performance & Grades</div>} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
