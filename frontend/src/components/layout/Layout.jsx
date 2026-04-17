import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  User, 
  Menu, 
  X,
  Bell
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

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/assignments', icon: FileText, label: 'Assignments' },
    { to: '/messages', icon: MessageSquare, label: 'Messaging' },
    { to: '/performance', icon: BarChart3, label: 'Performance' },
  ];

  return (
    <div className="min-height-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
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

        <nav className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <SidebarLink 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <div className="glass p-4 rounded-2xl flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <User size={20} className="text-slate-600" />
             </div>
             {isSidebarOpen && (
               <div className="overflow-hidden">
                 <p className="font-semibold text-sm text-slate-800 truncate">John Doe</p>
                 <p className="text-xs text-slate-500 truncate">Student ID: 202401</p>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between border-b border-slate-100">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
            <Menu size={24} />
          </button>
          
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search courses, assignments..." 
                className="w-full bg-slate-100 border-none rounded-full py-2 px-6 focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
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
