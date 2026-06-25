import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import discussionService from '../../services/discussionService';

/* ─────────────────────────────────────────────────────────────── */
/*  Inline group-creation form                                      */
/* ─────────────────────────────────────────────────────────────── */
const NewGroupForm = ({ courseId, course, onCreated, onCancel }) => {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Group name is required'); return; }
    try {
      setSubmitting(true);
      setError(null);
      const res = await discussionService.createGroup(courseId, name.trim(), description.trim());
      if (res?.success) {
        setName('');
        setDescription('');
        onCreated(res.group);
      } else {
        setError(res?.error || 'Failed to create group');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-4 animate-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-indigo-700 uppercase tracking-widest">New Discussion Group</p>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Context badge */}
      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
        {course.class_name && (
          <span className="px-2 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-lg">
            📚 {course.class_name}
          </span>
        )}
        <span className="px-2 py-1 bg-white border border-amber-200 text-amber-600 rounded-lg">
          📖 {course.title}
        </span>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Week 3 — Algebra Questions"
          disabled={submitting}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description for the group…"
          rows={2}
          disabled={submitting}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-3 text-sm font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex-1 py-3 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {submitting ? 'Creating…' : 'Create Group'}
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/*  Single course card with expandable groups list                  */
/* ─────────────────────────────────────────────────────────────── */
const CourseCard = ({ course }) => {
  const [groups, setGroups]               = useState(null);
  const [expanded, setExpanded]           = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const loadedRef                         = useRef(false); // tracks fetch, immune to stale closure

  const fetchGroups = useCallback(async () => {
    try {
      console.log(`Fetching groups for course ${course.id}...`);
      setLoadingGroups(true);
      const data = await discussionService.getGroups(course.id);
      console.log(`Groups received:`, data.groups);
      setGroups(Array.isArray(data.groups) ? data.groups : []);
      loadedRef.current = true;
    } catch (err) {
      console.error(`Failed to fetch groups for course ${course.id}:`, err);
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, [course.id]);

  const handleToggle = () => {
    if (!expanded && !loadedRef.current) {
      fetchGroups();
    }
    setExpanded((v) => !v);
  };

  const handleGroupCreated = () => {
    console.log('Group created successfully, refreshing list...');
    setShowForm(false);
    fetchGroups(); // always re-fetch from API after creation
  };

  return (
    <div className="bg-white rounded-[2.25rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden">
      {/* Course header */}
      <div className="p-7 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {course.class_name && (
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                  {course.class_name}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">{course.title}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Discussion center — create groups, answer questions, guide conversations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/course/${course.id}/discussions`}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black hover:bg-indigo-600 transition-all"
          >
            Open
            <ArrowRight size={14} />
          </Link>
          <button
            onClick={handleToggle}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              expanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
            title={expanded ? 'Hide groups' : 'Show groups'}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable groups section */}
      {expanded && (
        <div className="border-t border-slate-50 px-7 pb-7 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mt-5 mb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Discussion Groups</p>
            <div className="flex items-center gap-2">
               <button
                onClick={() => fetchGroups()}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                title="Refresh groups"
                disabled={loadingGroups}
              >
                <Loader2 size={14} className={loadingGroups ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-all"
              >
                <Plus size={13} />
                New Group
              </button>
            </div>
          </div>

          {showForm && (
            <NewGroupForm
              courseId={course.id}
              course={course}
              onCreated={handleGroupCreated}
              onCancel={() => setShowForm(false)}
            />
          )}

          {loadingGroups && !groups ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading conversations...</p>
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="space-y-3">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Users size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-800 group-hover:text-indigo-700 truncate">{g.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {g.subject_name && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-md">
                            {g.subject_name}
                          </span>
                        )}
                        {g.class_name && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                            {g.class_name}
                          </span>
                        )}
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded-md">
                          {g.discussion_count ?? 0} posts
                        </span>
                      </div>
                      {g.description && (
                        <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-1">{g.description}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/course/${course.id}/discussions`}
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          ) : !loadingGroups && groups ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-black text-slate-900">No discussion groups yet</p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Create a group to start a conversation for this course.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────── */
/*  Page root                                                       */
/* ─────────────────────────────────────────────────────────────── */
const TeacherDiscussionHub = () => {
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        console.log('TeacherDiscussionHub: Loading courses...');
        const data = await teacherService.getCourses();
        console.log('TeacherDiscussionHub: Courses loaded:', data);
        setCourses(data || []);
      } catch (error) {
        console.error('TeacherDiscussionHub: Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Communication</p>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Discussion Hubs</h1>
        <p className="text-slate-500 font-medium max-w-2xl">
          Manage discussion groups for each of your courses. Create groups scoped to a class and
          subject so students can access the right conversation space from their messaging dashboard.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 flex items-center justify-center shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
          <MessageSquare className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800">No discussion hubs available</h2>
          <p className="text-slate-500 font-medium mt-2">
            Once you are assigned courses, their discussion spaces will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDiscussionHub;
