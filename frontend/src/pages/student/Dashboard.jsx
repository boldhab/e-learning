import React from 'react';
import { mockCourses, mockAssignments } from '../../services/mock/mockData';
import { studentDashboardData } from '../../services/mock/studentMockData';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Play,
  FileText,
  CalendarDays,
  CheckCircle2,
  Timer,
  TrendingUp,
  Star,
  ArrowUpRight,
} from 'lucide-react';

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

const getDueStatus = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((due - now) / msPerDay);

  if (daysLeft <= 1) {
    return {
      label: 'Due soon',
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    };
  }

  if (daysLeft <= 3) {
    return {
      label: `${daysLeft} days left`,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    };
  }

  return {
    label: `${daysLeft} days left`,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
};

const formatDueDate = (dueDate) => {
  const parsedDate = new Date(dueDate);
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Dashboard = () => {
  const { user } = useAuth();

  const enrolledCourses = mockCourses;
  const totalLessons = enrolledCourses.reduce((total, course) => total + course.lessons.length, 0);
  const completedLessons = enrolledCourses.reduce(
    (total, course) => total + course.lessons.filter((lesson) => lesson.complete).length,
    0
  );
  const averageProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((total, course) => total + course.progress, 0) / enrolledCourses.length
        )
      : 0;
  const pendingAssignments = mockAssignments.filter((assignment) => assignment.status === 'pending');
  const nextDeadlines = [...pendingAssignments]
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const recommendedCourse = [...enrolledCourses].sort((a, b) => b.rating - a.rating)[0] || null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Welcome back, <span className="text-primary-400">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            You are currently tracking at <span className="text-white font-bold">{averageProgress}%</span>{' '}
            overall progress with <span className="text-white font-bold">{pendingAssignments.length}</span>{' '}
            active assignment{pendingAssignments.length === 1 ? '' : 's'} to finish.
          </p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 group">
            Continue Learning
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="absolute top-0 right-0 w-80 h-full bg-primary-600/10 skew-x-12 transform translate-x-20 hidden lg:block"></div>
        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:flex items-center justify-center">
          <div className="w-48 h-48 bg-primary-500 rounded-full blur-[80px] opacity-30"></div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={enrolledCourses.length} color="bg-indigo-100 text-indigo-600" />
        <StatCard icon={CheckCircle2} label="Completed Lessons" value={`${completedLessons}/${totalLessons}`} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={Clock} label="Pending Tasks" value={pendingAssignments.length} color="bg-orange-100 text-orange-600" />
        <StatCard icon={Award} label="Study Streak" value={`${studentDashboardData.streakDays} days`} color="bg-teal-100 text-teal-600" />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">This Week Focus</h2>
              <p className="text-slate-500 mt-1">Stay consistent and finish your highest-impact tasks first.</p>
            </div>
            <button className="w-max px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold inline-flex items-center gap-2 transition-colors">
              View Study Plan
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <p className="font-semibold text-slate-800">Progress Goal</p>
              </div>
              <p className="text-sm text-slate-500 mb-4">Complete at least {studentDashboardData.weeklyLessonTarget} lessons this week to stay on track.</p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${Math.round((studentDashboardData.weeklyLessonCompleted / studentDashboardData.weeklyLessonTarget) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{studentDashboardData.weeklyLessonCompleted} of {studentDashboardData.weeklyLessonTarget} lessons completed</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Timer size={20} />
                </div>
                <p className="font-semibold text-slate-800">Study Time</p>
              </div>
              <p className="text-sm text-slate-500 mb-4">Target {studentDashboardData.weeklyStudyTargetHours} focused hours this week.</p>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.round((studentDashboardData.weeklyStudyCompletedHours / studentDashboardData.weeklyStudyTargetHours) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{studentDashboardData.weeklyStudyCompletedHours}h logged of {studentDashboardData.weeklyStudyTargetHours}h target</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Upcoming Deadlines</h3>
              <p className="text-xs text-slate-500">Sorted by nearest due date</p>
            </div>
          </div>

          <div className="space-y-3">
            {nextDeadlines.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No pending deadlines. Great momentum.
              </div>
            )}

            {nextDeadlines.map((assignment) => {
              const status = getDueStatus(assignment.dueDate);

              return (
                <div key={assignment.id} className="rounded-xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-800 text-sm">{assignment.title}</p>
                  <p className="text-xs text-slate-500 mt-1">Due {formatDueDate(assignment.dueDate)}</p>
                  <span className={`inline-block mt-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
          <button className="text-primary-600 font-bold hover:text-primary-700 transition-colors uppercase text-sm tracking-widest">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course) => {
            const lessonsComplete = course.lessons.filter((lesson) => lesson.complete).length;

            return (
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
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-slate-400 uppercase tracking-wider">Lessons</p>
                      <p className="font-bold text-slate-700">{lessonsComplete}/{course.lessons.length}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-slate-400 uppercase tracking-wider">Duration</p>
                      <p className="font-bold text-slate-700">{course.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="text-xs text-slate-400 font-medium">{course.instructor}</p>
                    <p className="text-xs font-bold text-slate-600 inline-flex items-center gap-1">
                      <Star size={14} className="text-amber-500" fill="currentColor" />
                      {course.rating}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Upcoming Assignments</h2>
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <div key={assignment.id} className="glass p-6 rounded-2xl flex items-center justify-between hover:border-primary-200 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{assignment.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Due on {formatDueDate(assignment.dueDate)}</p>
                  </div>
                </div>
                <button className="text-sm font-bold text-primary-600 hover:underline">Submit Now</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl shadow-indigo-100 relative overflow-hidden min-h-[300px]">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Recommended Next</h3>
            {recommendedCourse ? (
              <>
                <p className="text-indigo-100 mb-1">{recommendedCourse.title}</p>
                <p className="text-indigo-200 text-sm mb-6">Top-rated by students and aligned with your learning track.</p>
              </>
            ) : (
              <p className="text-indigo-100 mb-6">Explore our expert-led advanced courses today.</p>
            )}
            <button className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl text-sm transition-all hover:shadow-lg">Explore Course</button>
          </div>
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
