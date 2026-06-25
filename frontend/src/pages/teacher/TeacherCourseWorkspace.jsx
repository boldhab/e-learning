import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronRight, Loader2, MessageSquare, PencilLine, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import teacherService from '../../services/teacherService';

const TeacherCourseWorkspace = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await teacherService.getCourses();
        setCourses(data || []);
      } catch (error) {
        console.error('Failed to load teacher courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-500">Teacher Workspace</p>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Course Workspaces</h1>
        <p className="text-slate-500 font-medium max-w-2xl">
          Open the right workspace for each class, update lesson content, preview the student view, and manage course discussions.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 flex items-center justify-center shadow-sm">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
          <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800">No course workspaces yet</h2>
          <p className="text-slate-500 font-medium mt-2">
            Courses will appear here after the admin assigns you to a class and subject.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-[2.25rem] border border-slate-100 p-7 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <BookOpen size={26} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {course.class_name || 'General Enrollment'}
                    </p>
                    <h2 className="text-xl font-black text-slate-900 mt-1 truncate">{course.title}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                      Use this workspace to prepare course notes, upload materials, and guide class discussion.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/teacher/course/${course.id}/edit`}
                  className="w-11 h-11 rounded-2xl bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-400 flex items-center justify-center transition-all shrink-0"
                >
                  <ChevronRight size={18} />
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to={`/teacher/course/${course.id}/edit`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black hover:bg-indigo-600 transition-all"
                >
                  <PencilLine size={16} />
                  Edit Content
                </Link>
                <Link
                  to={`/course/${course.id}/discussions`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-50 text-indigo-700 text-sm font-black hover:bg-indigo-100 transition-all"
                >
                  <MessageSquare size={16} />
                  Discussions
                </Link>
                <Link
                  to={`/teacher/course/${course.id}/preview`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-black hover:bg-emerald-100 transition-all"
                >
                  <Eye size={16} />
                  Preview
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourseWorkspace;
