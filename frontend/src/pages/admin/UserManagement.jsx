import React, { useState } from 'react';
import { mockUsers } from '../../services/mock/mockData';
import { Search, Filter, MoreHorizontal, UserPlus, Mail, ShieldCheck, Ban } from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
      case 'suspended': return 'bg-red-50 text-red-600 ring-red-100';
      case 'inactive': return 'bg-slate-100 text-slate-500 ring-slate-200';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Total {mockUsers.length} registered accounts across the platform.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 w-max shadow-lg shadow-primary-100">
          <UserPlus size={20} />
          Invite User
        </button>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-400 hidden md:block" />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flex-1 md:w-40 bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined Date</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest border ${
                      user.role === 'admin' ? 'border-primary-200 text-primary-600 bg-primary-50' : 
                      user.role === 'teacher' ? 'border-indigo-200 text-indigo-600 bg-indigo-50' : 
                      'border-slate-200 text-slate-500 bg-slate-50'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ring-1 ${getStatusColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 font-medium">
                    {user.joined}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-primary-600 shadow-sm border border-transparent hover:border-slate-100">
                          <Mail size={16} />
                       </button>
                       <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-emerald-600 shadow-sm border border-transparent hover:border-slate-100">
                          <ShieldCheck size={16} />
                       </button>
                       <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 shadow-sm border border-transparent hover:border-slate-100">
                          <Ban size={16} />
                       </button>
                       <button className="p-2 hover:bg-white rounded-lg text-slate-400 shadow-sm border border-transparent hover:border-slate-100 ml-2">
                          <MoreHorizontal size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-slate-400 font-medium">No users found matching your search.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
           <span>Showing {filteredUsers.length} of {mockUsers.length} users</span>
           <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50">Previous</button>
              <button className="px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
