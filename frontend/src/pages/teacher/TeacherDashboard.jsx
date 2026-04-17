import React from 'react';
import { mockCourses, mockStats } from '../../services/mock/mockData';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Plus, 
  FileUp, 
  BarChart, 
  MoreVertical, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Instructor Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your courses, students, and academic content.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 w-max">
          <Plus size={20} />
          Create New Course
        </button>
      </div>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
              <span className="text-emerald-500 text-xs font-bold">+12%</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">Total Students</p>
           <p className="text-2xl font-bold text-slate-800">{mockStats.activeStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><BarChart size={24} /></div>
              <span className="text-emerald-500 text-xs font-bold">+5%</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">Average Grade</p>
           <p className="text-2xl font-bold text-slate-800">{mockStats.averageGrade}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><FileUp size={24} /></div>
           </div>
           <p className="text-slate-500 text-sm font-medium">Monthly Uploads</p>
           <p className="text-2xl font-bold text-slate-800">{mockStats.contentUploads}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Clock size={24} /></div>
           </div>
           <p className="text-slate-500 text-sm font-medium">Pending Tasks</p>
           <p className="text-2xl font-bold text-slate-800">3</p>
        </div>
      </div>

      {/* Main Grid: Courses and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Your Courses</h2>
            <button className="text-primary-600 text-sm font-bold">View Performance</button>
          </div>

          <div className="space-y-4">
            {mockCourses.map(course => (
              <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={course.image} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div>
                    <h4 className="font-bold text-slate-800">{course.title}</h4>
                    <p className="text-xs text-slate-500">{course.students} Students Enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue</p>
                    <p className="text-sm font-bold text-slate-800">$2,450.00</p>
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Upload / Activity */}
        <div className="space-y-8">
           <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <h3 className="text-xl font-bold mb-4">Quick Upload</h3>
              <p className="text-slate-400 text-sm mb-6">Drop PDFs, Videos or Notes to update your classes.</p>
              
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary-500 transition-colors cursor-pointer group">
                 <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary-400">
                    <Plus size={24} />
                 </div>
                 <span className="text-xs font-bold text-slate-500">Pick Files</span>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-100">
              <h3 className="text-xl font-bold mb-6 text-slate-800 text-center">Recent Submissions</h3>
              <div className="space-y-6">
                 {[1, 2].map(i => (
                   <div key={i} className="flex items-start gap-4">
                      <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500"></div>
                      <div>
                         <p className="text-sm font-bold text-slate-800">Assignment {i === 1 ? 'React Hooks' : 'PHP Security'}</p>
                         <p className="text-xs text-slate-400">Submitted by {i === 1 ? 'John Doe' : 'Jane Smith'}</p>
                      </div>
                   </div>
                 ))}
                 <button className="w-full py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Go to Gradebook</button>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
};

export default TeacherDashboard;
