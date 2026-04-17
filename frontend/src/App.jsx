import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Temporary Mock Components
const Dashboard = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-800">Welcome to Millennium School</h1>
    <p className="mt-2 text-gray-600">Your digital learning journey starts here.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 text-primary-600">
             {i === 1 ? '📚' : i === 2 ? '📝' : '📈'}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {i === 1 ? 'My Courses' : i === 2 ? 'Assignments' : 'Performance'}
          </h3>
          <p className="text-gray-500 text-sm">View and track your {i === 1 ? 'enrolled subjects' : i === 2 ? 'pending tasks' : 'academic progress'}.</p>
        </div>
      ))}
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<div className="p-6">Courses Page (Coming Soon)</div>} />
          <Route path="assignments" element={<div className="p-6">Assignments Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
