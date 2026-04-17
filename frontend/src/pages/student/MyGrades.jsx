import React from 'react';
import { studentGradesData } from '../../services/mock/studentMockData';
import { GraduationCap, BarChart3, Percent } from 'lucide-react';

const toLetterGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

const MyGrades = () => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">My Grades</h1>
        <p className="text-slate-500 mt-1">Review your gradebook, GPA trend, and attendance snapshot.</p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <GraduationCap size={20} />
          </div>
          <p className="text-sm text-slate-500">Current GPA</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{studentGradesData.summary.gpa}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <BarChart3 size={20} />
          </div>
          <p className="text-sm text-slate-500">Average Score</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{studentGradesData.summary.average}%</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
            <Percent size={20} />
          </div>
          <p className="text-sm text-slate-500">Attendance</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{studentGradesData.summary.attendance}%</p>
        </div>
      </section>

      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-slate-500 border-b border-slate-100">
              <th className="pb-3">Course</th>
              <th className="pb-3">Assessment</th>
              <th className="pb-3">Score</th>
              <th className="pb-3">Letter</th>
              <th className="pb-3">Weight</th>
            </tr>
          </thead>
          <tbody>
            {studentGradesData.gradebook.map((item) => {
              const percent = Math.round((item.score / item.maxScore) * 100);
              return (
                <tr key={item.id} className="border-b border-slate-50 text-sm text-slate-700">
                  <td className="py-4 font-semibold">{item.course}</td>
                  <td className="py-4">{item.assessment}</td>
                  <td className="py-4">{item.score}/{item.maxScore} ({percent}%)</td>
                  <td className="py-4 font-bold">{toLetterGrade(percent)}</td>
                  <td className="py-4">{item.weight}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default MyGrades;
