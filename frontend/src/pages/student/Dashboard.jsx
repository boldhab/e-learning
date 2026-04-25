/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react';
import { mockCourses, mockAssignments } from '../../services/mock/mockData';
import { studentDashboardData } from '../../services/mock/studentMockData';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Clock,
  ChevronRight,
  Play,
  CalendarDays,
  CheckCircle2,
  Timer,
  Star,
  ArrowUpRight,
  Bell,
  X,
  RefreshCw,
  AlertCircle,
  Calendar,
  Target,
  Flame,
  Zap,
  Sparkles,
  Users,
  MessageSquare,
  Video,
  Download,
  Share2
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, trend, onClick }) => (
  <div 
    onClick={onClick}
    className="glass p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} transition-all group-hover:scale-110`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
          </p>
        )}
      </div>
    </div>
    <ChevronRight size={20} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const getDueStatus = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((due - now) / msPerDay);

  if (daysLeft < 0) {
    return {
      label: 'Overdue',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      icon: AlertCircle
    };
  }
  if (daysLeft === 0) {
    return {
      label: 'Due Today',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: Timer
    };
  }
  if (daysLeft <= 2) {
    return {
      label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: Clock
    };
  }
  return {
    label: `${daysLeft} days left`,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: Calendar
  };
};

const formatDueDate = (dueDate) => {
  const parsedDate = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (parsedDate.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (parsedDate.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New Assignment', message: 'React Hooks assignment has been posted', time: '2 hours ago', read: false, type: 'assignment' },
    { id: 2, title: 'Grade Released', message: 'Your Database project has been graded', time: '1 day ago', read: true, type: 'grade' },
    { id: 3, title: 'Live Class', message: 'Web Development class starts in 30 min', time: '1 day ago', read: false, type: 'class' },
  ];

  const enrolledCourses = mockCourses;
  const totalLessons = enrolledCourses.reduce((total, course) => total + course.lessons.length, 0);
  const completedLessons = enrolledCourses.reduce(
    (total, course) => total + course.lessons.filter((lesson) => lesson.complete).length,
    0
  );
  const averageProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((total, course) => total + course.progress, 0) / enrolledCourses.length)
    : 0;
  
  const pendingAssignments = mockAssignments.filter((assignment) => assignment.status === 'pending');
  const nextDeadlines = [...pendingAssignments]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recommendedCourse = [...enrolledCourses].sort((a, b) => b.rating - a.rating)[0] || null;
  
  // Calculate weekly activity data
  const weeklyActivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      hours: Math.floor(Math.random() * 4) + 1,
      lessons: Math.floor(Math.random() * 3)
    }));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const achievementBadges = [
    { icon: Flame, label: '7 Day Streak', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { icon: Target, label: 'Quiz Master', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { icon: Zap, label: 'Fast Learner', color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header with Notifications */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
            {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your learning journey today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            disabled={refreshing}
          >
            <RefreshCw size={20} className={`text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Bell size={20} className="text-slate-600" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fadeInDown">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)}>
                    <X size={16} className="text-slate-400" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                      <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={BookOpen} 
          label="Enrolled Courses" 
          value={enrolledCourses.length} 
          color="bg-indigo-100 text-indigo-600"
          trend={12}
          onClick={() => window.location.href = '/student/courses'}
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Completed Lessons" 
          value={`${completedLessons}/${totalLessons}`} 
          color="bg-emerald-100 text-emerald-600"
          trend={8}
          onClick={() => window.location.href = '/student/courses'}
        />
        <StatCard 
          icon={Clock} 
          label="Pending Tasks" 
          value={pendingAssignments.length} 
          color="bg-amber-100 text-amber-600"
          trend={-5}
          onClick={() => window.location.href = '/student/assignments'}
        />
        <StatCard 
          icon={Flame} 
          label="Study Streak" 
          value={`${studentDashboardData.streakDays} days`} 
          color="bg-orange-100 text-orange-600"
          trend={3}
          onClick={() => window.location.href = '/student/performance'}
        />
      </div>

      {/* Welcome Banner with Progress */}
      <Card variant="gradient" padding="lg" className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-yellow-300" />
              <span className="text-white/80 text-sm font-medium">Your Progress</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              You&apos;re doing great! 🎉
            </h2>
            <p className="text-white/70 mb-4">
              Complete {Math.ceil((100 - averageProgress) / 10)} more lessons to reach your monthly goal.
            </p>
            <div className="max-w-md">
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span>Overall Progress</span>
                <span>{averageProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000"
                  style={{ width: `${averageProgress}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {achievementBadges.map((badge, idx) => (
              <div key={idx} className={`${badge.bgColor} backdrop-blur-sm rounded-xl px-4 py-2 text-center`}>
                <badge.icon size={20} className={`${badge.color} mx-auto mb-1`} />
                <p className="text-xs font-semibold text-slate-700">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl"></div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Courses & Activity */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly Activity Chart */}
          <Card variant="white" padding="lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Weekly Activity</h3>
                <p className="text-sm text-slate-500">Your learning hours this week</p>
              </div>
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyActivity.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-lg transition-all duration-500 hover:from-indigo-600 hover:to-indigo-500 cursor-pointer"
                    style={{ height: `${(day.hours / 5) * 100}%` }}
                  />
                  <span className="text-xs font-medium text-slate-500">{day.day}</span>
                  <span className="text-xs font-bold text-indigo-600">{day.hours}h</span>
                </div>
              ))}
            </div>
          </Card>

          {/* My Courses Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">My Courses</h3>
                <p className="text-sm text-slate-500">Continue where you left off</p>
              </div>
              <Link to="/student/courses" className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1">
                View All
                <ArrowUpRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {enrolledCourses.slice(0, 2).map((course) => {
                const lessonsComplete = course.lessons.filter((lesson) => lesson.complete).length;
                const nextLesson = course.lessons.find(lesson => !lesson.complete);
                
                return (
                  <div key={course.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-100">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-32 md:h-auto relative overflow-hidden">
                        <img 
                          src={course.image} 
                          alt={course.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play size={32} className="text-white" />
                        </div>
                      </div>
                      
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-800">{course.title}</h4>
                            <p className="text-sm text-slate-500">{course.instructor}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            <span className="text-sm font-semibold text-slate-700">{course.rating}</span>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-indigo-600 font-semibold">{course.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              {lessonsComplete}/{course.lessons.length} lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {course.duration}
                            </span>
                          </div>
                          {nextLesson && (
                            <Button size="sm" variant="primary">
                              Continue Lesson
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Assignments & Recommendations */}
        <div className="space-y-6">
          
          {/* Upcoming Deadlines */}
          <Card variant="white" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <CalendarDays size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Upcoming Deadlines</h3>
                <p className="text-xs text-slate-500">Due this week</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {nextDeadlines.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm text-slate-600">All caught up! 🎉</p>
                  <p className="text-xs text-slate-400">No pending deadlines</p>
                </div>
              ) : (
                nextDeadlines.map((assignment) => {
                  const status = getDueStatus(assignment.dueDate);
                  const StatusIcon = status.icon;
                  
                  return (
                    <div key={assignment.id} className="rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-sm">{assignment.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{assignment.course}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${status.color}`}>
                              <StatusIcon size={12} />
                              {status.label}
                            </span>
                            <span className="text-xs text-slate-400">
                              Due {formatDueDate(assignment.dueDate)}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="primary">
                          Submit
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Recommended Course */}
          {recommendedCourse && (
            <Card variant="gradient" padding="lg" className="relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-yellow-300" />
                  <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Recommended For You</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-1">{recommendedCourse.title}</h4>
                <p className="text-white/70 text-sm mb-3">{recommendedCourse.instructor}</p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-1 text-white/80 text-sm">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    {recommendedCourse.rating}
                  </span>
                  <span className="flex items-center gap-1 text-white/80 text-sm">
                    <Users size={14} />
                    {recommendedCourse.students || 1234} students
                  </span>
                </div>
                <Button variant="glass" size="sm">
                  Explore Course
                  <ChevronRight size={16} />
                </Button>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card variant="white" padding="lg">
            <h3 className="font-bold text-slate-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-slate-50 rounded-xl text-left hover:bg-indigo-50 transition-colors group">
                <Video size={18} className="text-indigo-600 mb-2" />
                <p className="font-medium text-slate-700 text-sm">Join Live Class</p>
                <p className="text-xs text-slate-400">Next in 2h</p>
              </button>
              <button className="p-3 bg-slate-50 rounded-xl text-left hover:bg-indigo-50 transition-colors group">
                <MessageSquare size={18} className="text-indigo-600 mb-2" />
                <p className="font-medium text-slate-700 text-sm">Ask Question</p>
                <p className="text-xs text-slate-400">To your teacher</p>
              </button>
              <button className="p-3 bg-slate-50 rounded-xl text-left hover:bg-indigo-50 transition-colors group">
                <Download size={18} className="text-indigo-600 mb-2" />
                <p className="font-medium text-slate-700 text-sm">Offline Mode</p>
                <p className="text-xs text-slate-400">Download materials</p>
              </button>
              <button className="p-3 bg-slate-50 rounded-xl text-left hover:bg-indigo-50 transition-colors group">
                <Share2 size={18} className="text-indigo-600 mb-2" />
                <p className="font-medium text-slate-700 text-sm">Share Progress</p>
                <p className="text-xs text-slate-400">With your mentor</p>
              </button>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;