import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, GraduationCap, School } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Mock registration logic
    localStorage.setItem('elearning_user', JSON.stringify({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: formData.role
    }));

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-slate-100">
        
        {/* Decorative Side */}
        <div className="md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Start your journey <br /> with us today.
            </h2>
            <p className="text-slate-400 text-lg">
              Join a community of learners and educators dedicated to excellence.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="p-4 glass-dark rounded-2xl border-white/5 flex items-center gap-4">
               <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                  <GraduationCap size={20} />
               </div>
               <p className="text-sm font-medium">Access to 1000+ premium resources</p>
            </div>
            <div className="p-4 glass-dark rounded-2xl border-white/5 flex items-center gap-4">
               <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white">
                  <School size={20} />
               </div>
               <p className="text-sm font-medium">Connect with top-tier educators</p>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full blur-[120px] opacity-20"></div>
        </div>

        {/* Form Side */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h3>
            <p className="text-slate-500">Become a part of the Millennium community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-2">
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: 'student'})}
                className={`py-3 rounded-xl border-2 transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
                  formData.role === 'student' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <GraduationCap size={18} />
                Student
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, role: 'teacher'})}
                className={`py-3 rounded-xl border-2 transition-all font-semibold text-sm flex items-center justify-center gap-2 ${
                  formData.role === 'teacher' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <User size={18} />
                Teacher
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none bg-slate-50"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none bg-slate-50"
                  placeholder="name@school.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none bg-slate-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white rounded-xl py-4 font-bold shadow-lg hover:bg-black transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account? {' '}
            <Link to="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
