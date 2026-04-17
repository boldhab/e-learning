import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, GraduationCap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left Side - Branding/Illustration */}
        <div className="md:w-1/2 bg-primary-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-xl">M</div>
              <span className="text-2xl font-bold tracking-tight">Millennium</span>
            </div>
            
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              Empowering the next <br /> generation of leaders.
            </h2>
            <p className="text-primary-100 text-lg">
              Access your digital classroom and stay connected with your peers and teachers.
            </p>
          </div>

          <div className="relative z-10 mt-12 p-6 glass rounded-2xl border-white/20">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                   <GraduationCap size={24} />
                </div>
                <div>
                   <p className="font-semibold">Join 5000+ Students</p>
                   <p className="text-sm text-primary-100">Across 150+ diverse courses.</p>
                </div>
             </div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-1/2 -right-24 w-48 h-48 bg-primary-400 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h3>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-600 bg-slate-50"
                  placeholder="name@school.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">Forgot Password?</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-slate-600 bg-slate-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white rounded-xl py-4 font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Sign In
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 uppercase tracking-widest text-xs font-bold">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-slate-600">
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-slate-600 text-sm">
                GitHub
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? {' '}
            <Link to="/register" className="text-primary-600 font-bold hover:underline transition-all">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
