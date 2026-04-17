import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
      <button 
        onClick={() => setSidebarOpen(prev => !prev)} 
        className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
      >
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
          {user?.name?.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
