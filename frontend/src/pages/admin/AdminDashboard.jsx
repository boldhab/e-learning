import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BookOpen, CalendarRange, GraduationCap, Layers, Shield, Users } from 'lucide-react';
import adminService from '../../services/adminService';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div className={`rounded-2xl p-3 ${color}`}>
        <Icon size={22} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
    </div>
    <p className="mt-5 text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const QuickActionCard = ({ title, description, icon: Icon, link, actionLabel, tone }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className={`inline-flex rounded-2xl p-3 ${tone}`}>
      <Icon size={22} />
    </div>
    <h3 className="mt-5 text-xl font-bold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
    <Link to={link} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
      {actionLabel}
      <ArrowRight size={15} />
    </Link>
  </div>
);

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [overviewData, classData, subjectData, assignmentData, yearData] = await Promise.all([
          adminService.getOverview(),
          adminService.getClasses(),
          adminService.getSubjects(),
          adminService.getAssignments(),
          adminService.getYears(),
        ]);
        setOverview(overviewData);
        setClasses(classData || []);
        setSubjects(subjectData || []);
        setAssignments(assignmentData || []);
        setYears(yearData?.years || []);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load admin dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-sm text-red-600">{error}</div>;
  }

  const stats = overview?.stats || {};
  const recentClasses = classes.slice(0, 5);
  const recentSubjects = subjects.slice(0, 5);
  const recentAssignments = (overview?.recent_assignments || assignments || []).slice(0, 5);
  const yearPreview = years.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Administration Center</h1>
          <p className="mt-1 text-slate-500">
            Run daily school operations, keep sections organized, and control academic-year setup from one workspace.
          </p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          Active Year: {overview?.active_year?.name || 'Not set'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={stats.total_students || 0} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard label="Teachers" value={stats.total_teachers || 0} icon={Shield} color="bg-violet-50 text-violet-600" />
        <StatCard label="Classes" value={stats.total_classes || 0} icon={BookOpen} color="bg-amber-50 text-amber-600" />
        <StatCard label="Assignments" value={stats.total_assignments || 0} icon={Activity} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <QuickActionCard
          title="User Directory"
          description="Create student, teacher, and admin accounts, reset passwords, and control access status."
          icon={Users}
          link="/admin/users"
          actionLabel="Open user management"
          tone="bg-blue-50 text-blue-600"
        />
        <QuickActionCard
          title="Academic Setup"
          description="Create class sections, assign students, define subjects, and match teachers to the right sections."
          icon={GraduationCap}
          link="/admin/courses"
          actionLabel="Open academic setup"
          tone="bg-amber-50 text-amber-600"
        />
        <QuickActionCard
          title="Academic Years"
          description="Create school years and switch the active year that drives enrollment and assignment records."
          icon={CalendarRange}
          link="/admin/settings"
          actionLabel="Manage academic years"
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Accounts</h2>
            <Link to="/admin/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Open user management
            </Link>
          </div>
          <div className="space-y-4">
            {(overview?.recent_users || []).map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {user.role}
                </span>
              </div>
            ))}
            {(!overview?.recent_users || overview.recent_users.length === 0) && (
              <p className="text-sm text-slate-500">No users have been created yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-amber-600" />
              <h2 className="text-xl font-bold text-slate-900">Classes</h2>
            </div>
            <Link to="/admin/courses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {recentClasses.map((classItem) => (
              <div key={classItem.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">{classItem.name}</p>
                <p className="text-xs text-slate-400">Class ID #{classItem.id}</p>
              </div>
            ))}
            {recentClasses.length === 0 && (
              <p className="text-sm text-slate-500">No classes have been created yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers size={20} className="text-violet-600" />
              <h2 className="text-xl font-bold text-slate-900">Subjects</h2>
            </div>
            <Link to="/admin/courses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {recentSubjects.map((subject) => (
              <div key={subject.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">{subject.name}</p>
                <p className="text-xs text-slate-400">Subject ID #{subject.id}</p>
              </div>
            ))}
            {recentSubjects.length === 0 && (
              <p className="text-sm text-slate-500">No subjects have been created yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarRange size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Academic Years</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {stats.total_years || 0} academic year records are available.
            </p>
            <Link
              to="/admin/settings"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Manage years
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Year Records</h2>
            <div className="mt-4 space-y-3">
              {yearPreview.map((year) => (
                <div key={year.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="font-semibold text-slate-800">{year.name}</p>
                  <p className="text-xs text-slate-400">
                    {Number(year.is_active) === 1 ? 'Currently active' : 'Inactive'}
                  </p>
                </div>
              ))}
              {yearPreview.length === 0 && (
                <p className="text-sm text-slate-500">No academic years have been created yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Latest Teaching Assignments</h2>
          <div className="mt-4 space-y-3">
            {recentAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="font-semibold text-slate-800">{assignment.class_name}</p>
                <p className="text-sm text-slate-500">
                  {assignment.subject_name} with {assignment.teacher_name}
                </p>
              </div>
            ))}
            {recentAssignments.length === 0 && (
              <p className="text-sm text-slate-500">No assignments have been created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
