import React from 'react';
import { studentAssignmentsData } from '../../services/mock/studentMockData';
import { FileText, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';

const statusClasses = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  submitted: 'bg-blue-50 text-blue-700 border-blue-100',
  graded: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const Assignments = () => {
  const pendingCount = studentAssignmentsData.filter((item) => item.status === 'pending').length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Assignments</h1>
          <p className="text-slate-500 mt-1">Manage pending work, submissions, and grading updates.</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 text-sm font-semibold">
          {pendingCount} pending assignment{pendingCount === 1 ? '' : 's'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{studentAssignmentsData.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Submitted</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{studentAssignmentsData.filter((a) => a.status === 'submitted').length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-500">Graded</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{studentAssignmentsData.filter((a) => a.status === 'graded').length}</p>
        </div>
      </div>

      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        {studentAssignmentsData.map((assignment) => (
          <div key={assignment.id} className="rounded-2xl border border-slate-100 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-bold text-slate-800">{assignment.title}</p>
              <p className="text-sm text-slate-500">{assignment.course}</p>
              <p className="text-xs text-slate-500">Submission: {assignment.submissionType}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                <CalendarClock size={14} />
                Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                <FileText size={14} />
                {assignment.points} pts
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-semibold ${statusClasses[assignment.status]}`}>
                {assignment.status === 'graded' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {assignment.status}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Assignments;
