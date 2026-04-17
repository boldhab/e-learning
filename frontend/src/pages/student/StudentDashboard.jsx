import React from 'react';
import { mockCourses, mockAssignments } from '../../services/mock/mockData';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, Award, ChevronRight, Play } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass p-5 rounded-2xl flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const enrolledCourses = mockCourses; // In a real app, we'd filter by enrollment
  const pendingAssignments = mockAssignments.filter(a => a.status === 'pending');

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Welcome back, <span className="text-primary-400">{user?.name}</span>! 👋
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            You have completed <span className="text-white font-bold">45%</span> of your course goals this month. Keep up the great work!
          </p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 group">
            Resume Learning
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-80 h-full bg-primary-600/10 skew-x-12 transform translate-x-20 hidden lg:block"></div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:flex items-center justify-center">
            <div className="w-48 h-48 bg-primary-500 rounded-full blur-[80px] opacity-30"></div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={enrolledCourses.length} color="bg-indigo-100 text-indigo-600" />
        <StatCard icon={Clock} label="Hours Spent" value="24.5h" color="bg-orange-100 text-orange-600" />
        <StatCard icon={Award} label="Achievements" value="12" color="bg-teal-100 text-teal-600" />
      </div>

      {/* Course Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
          <button className="text-primary-600 font-bold hover:text-primary-700 transition-colors uppercase text-sm tracking-widest">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 transform hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm uppercase tracking-wider">
                   {course.level}
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-lg">
                      <Play size={20} fill="currentColor" />
                   </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-xl text-slate-800 mb-2 truncate">{course.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-400">PROGRESS</span>
                    <span className="text-primary-600">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <p className="text-xs text-slate-400 font-medium">{course.instructor}</p>
                   <p className="text-xs font-bold text-slate-600">{course.lessons.length} Lessons</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Assignments and Deadlines */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Upcoming Assignments</h2>
            <div className="space-y-4">
               {pendingAssignments.map(assignment => (
                 <div key={assignment.id} className="glass p-6 rounded-2xl flex items-center justify-between hover:border-primary-200 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          <FileText size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800">{assignment.title}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">Due on {assignment.dueDate}</p>
                       </div>
                    </div>
                    <button className="text-sm font-bold text-primary-600 hover:underline">Submit Now</button>
                 </div>
               ))}
            </div>
         </div>
         
         <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="text-2xl font-bold mb-2">Ready to level up?</h3>
               <p className="text-indigo-100 mb-6">Explore our expert-led advanced courses today.</p>
               <button className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl text-sm transition-all hover:shadow-lg">Browse Catalog</button>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
         </div>
      </section>
      
    </div>
  );
};

// Simplified icon import for the dashboard
import { FileText } from 'lucide-react';

export default StudentDashboard;
