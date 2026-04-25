import React from 'react';
import { mockStats } from '../../services/mock/mockData';
import { Shield, Users, BookOpen, Activity, TrendingUp, AlertCircle } from 'lucide-react';

const AdminStat = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} />
      </div>
      <button className="text-slate-400 hover:text-slate-600">
        <Activity size={16} />
      </button>
    </div>
    <div className="mt-4">
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-3xl font-bold text-slate-800">{value}</h4>
        <span className="text-emerald-500 text-xs font-bold">+4.5%</span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">System Command Center</h1>
          <p className="text-slate-500">Global overview of The Millennium School E-Learning ecosystem.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold ring-1 ring-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          SYSTEM ONLINE
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStat 
          icon={Users} 
          label="Total Students" 
          value={mockStats.activeStudents} 
          subtext="Across all grade levels"
          color="bg-blue-50 text-blue-600"
        />
        <AdminStat 
          icon={Shield} 
          label="Active Teachers" 
          value={mockStats.activeTeachers} 
          subtext="Verified instructors"
          color="bg-purple-50 text-purple-600"
        />
        <AdminStat 
          icon={TrendingUp} 
          label="Global Revenue" 
          value={mockStats.monthlyRevenue} 
          subtext="Current month total"
          color="bg-emerald-50 text-emerald-600"
        />
        <AdminStat 
          icon={Activity} 
          label="System Uptime" 
          value={mockStats.systemUptime} 
          subtext="Last 30 days"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Middle Section: Trends and Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mock Analytics Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-800">Enrollment Trends</h3>
              <select className="bg-slate-50 border-none rounded-lg text-sm font-semibold p-2 outline-none">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
              </select>
           </div>
           
           <div className="h-64 flex items-end justify-between gap-2">
              {[40, 60, 45, 90, 65, 80, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                   <div 
                    className="w-full bg-primary-100 rounded-t-lg group-hover:bg-primary-500 transition-all duration-300 relative"
                    style={{ height: `${h}%` }}
                   >
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {h * 5}
                     </div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Day {i+1}</span>
                </div>
              ))}
           </div>
        </div>

        {/* System Health */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <Shield size={20} className="text-primary-400" />
                 Secured Services
              </h3>
              <div className="space-y-4">
                 {[
                   { name: 'Auth Server', status: 'Healthy' },
                   { name: 'Database API', status: 'Healthy' },
                   { name: 'CDN Nodes', status: 'Warning' },
                 ].map(service => (
                   <div key={service.name} className="flex items-center justify-between p-3 glass-dark rounded-xl">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        service.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {service.status.toUpperCase()}
                      </span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-primary-50 border border-primary-100 rounded-3xl p-8">
              <div className="flex items-center gap-3 text-primary-700 mb-4">
                 <AlertCircle size={20} />
                 <h4 className="font-bold uppercase tracking-widest text-xs">Admin Tasks</h4>
              </div>
              <p className="text-sm text-primary-600 mb-4">There are 5 teacher verification requests pending approval.</p>
              <button className="w-full py-3 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
                 Review Requests
              </button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
