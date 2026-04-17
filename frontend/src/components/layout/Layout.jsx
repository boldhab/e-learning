import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  User, 
  Menu, 
  X,
  Bell,
  Users,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
        : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Define navigation items based on role
  const getNavItems = () => {
    const common = [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ];

    if (user?.role === 'admin') {
      return [
        ...common,
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/courses', icon: BookOpen, label: 'System Courses' },
        { to: '/admin/settings', icon: Settings, label: 'System Settings' },
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...common,
        { to: '/courses', icon: BookOpen, label: 'My Courses' },
        { to: '/performance', icon: BarChart3, label: 'Student Grades' },
        { to: '/messages', icon: MessageSquare, label: 'Messages' },
      ];
    }

    // Default: Student
    return [
      ...common,
      { to: '/courses', icon: BookOpen, label: 'My Learning' },
      { to: '/assignments', icon: FileText, label: 'Assignments' },
      { to: '/performance', icon: BarChart3, label: 'My Grades' },
      { to: '/messages', icon: MessageSquare, label: 'Messaging' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden flex flex-col`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            {isSidebarOpen && <span className="font-bold text-xl text-slate-800">Millennium</span>}
          </div>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden">
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 py-4 space-y-2 flex-1">
          {navItems.map((item) => (
            <SidebarLink 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className={`glass p-4 rounded-2xl flex items-center gap-3 transition-all ${!isSidebarOpen && 'justify-center px-0'}`}>
             <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-slate-600" />
             </div>
             {isSidebarOpen && (
               <div className="overflow-hidden flex-1">
                 <p className="font-semibold text-sm text-slate-800 truncate">{user?.name}</p>
                 <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{user?.role}</p>
               </div>
             )}
             {isSidebarOpen && (
               <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                 <LogOut size={18} />
               </button>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
            <Menu size={24} />
          </button>
          
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search resources, users..." 
                className="w-full bg-slate-100 border-none rounded-full py-2 px-6 focus:ring-2 focus:ring-primary-500 transition-all text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 hidden md:block overflow-hidden capitalize flex items-center justify-center text-primary-600 font-bold text-xs">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
