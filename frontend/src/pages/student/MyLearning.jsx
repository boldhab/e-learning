import React from 'react';
import { mockCourses } from '../../services/mock/mockData';
import { studentLearningData } from '../../services/mock/studentMockData';
import { BookOpen, Target, CalendarDays, CheckCircle2 } from 'lucide-react';

const MyLearning = () => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Learning</h1>
          <p className="text-slate-500 mt-1">Track your active courses, milestones, and next study targets.</p>
        </div>
        <button className="w-max px-5 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
          Continue Last Lesson
        </button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={20} className="text-primary-600" />
            <h2 className="text-xl font-bold text-slate-800">Enrolled Courses</h2>
          </div>
          <div className="space-y-4">
            {mockCourses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800">{course.title}</h3>
                  <p className="text-sm text-slate-500">{course.instructor} • {course.duration}</p>
                </div>
                <div className="w-full md:w-56">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Milestones</h2>
          </div>
          <div className="space-y-3">
            {studentLearningData.milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="font-semibold text-sm text-slate-800">{milestone.title}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>Due {new Date(milestone.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{milestone.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={20} className="text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-800">Recommended Topics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studentLearningData.recommendedTopics.map((topic) => (
            <div key={topic} className="rounded-xl border border-slate-100 p-4 bg-emerald-50/40">
              <p className="text-sm font-semibold text-slate-700 inline-flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5" />
                {topic}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MyLearning;
