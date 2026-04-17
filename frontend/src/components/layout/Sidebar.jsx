import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  User, 
  X,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, isOpen }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' 
        : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
    } ${!isOpen && 'justify-center px-0'}`}
  >
    <Icon size={20} className="shrink-0" />
    {isOpen && <span className="font-medium truncate">{label}</span>}
  </Link>
);

export const Sidebar = ({ isOpen, setOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getNavItems = () => {
    const common = [{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' }];

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
        { to: '/teacher/courses', icon: BookOpen, label: 'My Courses' },
        { to: '/teacher/grading', icon: BarChart3, label: 'Grading' },
        { to: '/teacher/forum', icon: MessageSquare, label: 'Messages' },
      ];
    }

    return [
      ...common,
      { to: '/student/courses', icon: BookOpen, label: 'My Learning' },
      { to: '/student/assignments', icon: FileText, label: 'Assignments' },
      { to: '/student/grades', icon: BarChart3, label: 'My Grades' },
      { to: '/student/messages', icon: MessageSquare, label: 'Messaging' },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside 
      className={`fixed lg:relative z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0 lg:w-20'
      } overflow-hidden flex flex-col`}
    >
      <div className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">M</div>
          {isOpen && <span className="font-bold text-xl text-slate-800 truncate">Millennium</span>}
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden">
          <X size={24} />
        </button>
      </div>

      <nav className="px-4 py-4 space-y-2 flex-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <SidebarLink 
            key={item.to} 
            {...item} 
            isOpen={isOpen}
            active={location.pathname === item.to}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50 shrink-0">
        <div className={`glass p-4 rounded-2xl flex items-center gap-3 transition-all ${!isOpen && 'justify-center px-0'}`}>
           <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
              <User size={20} className="text-slate-600" />
           </div>
           {isOpen && (
             <div className="overflow-hidden flex-1">
               <p className="font-semibold text-sm text-slate-800 truncate">{user?.name}</p>
               <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{user?.role}</p>
             </div>
           )}
           {isOpen && (
             <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
               <LogOut size={18} />
             </button>
           )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
