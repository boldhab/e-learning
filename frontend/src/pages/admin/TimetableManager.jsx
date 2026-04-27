import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import {
  Plus, Trash2, BookOpen, Layers, UserCheck,
  CheckCircle2, Loader2, X, School, BookMarked, ArrowRight
} from 'lucide-react';

const ClassSubjectManager = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { msg, type }

  // Form states
  const [className, setClassName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [assignForm, setAssignForm] = useState({ class_id: '', subject_id: '', teacher_id: '' });
  const [submitting, setSubmitting] = useState('');
  const availableStudents = students.filter((student) => !student.class_id);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cls, subs, tchs, stds, asgns] = await Promise.all([
        adminService.getClasses(),
        adminService.getSubjects(),
        adminService.getUsers('teacher'),
        adminService.getUsers('student'),
        adminService.getAssignments(),
      ]);
      setClasses(cls);
      setSubjects(subs);
      setTeachers(tchs);
      setStudents(stds);
      setAssignments(asgns);
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    if (selectedStudentIds.length === 0) {
      showToast('Select at least one student for the new class', 'error');
      return;
    }
    setSubmitting('class');
    try {
      await adminService.createClass({
        name: className.trim(),
        student_ids: selectedStudentIds,
      });
      setClassName('');
      setSelectedStudentIds([]);
      showToast('Class created and students assigned successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to create class', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setSubmitting('subject');
    try {
      await adminService.createSubject(subjectName.trim());
      setSubjectName('');
      showToast('Subject created successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to create subject', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    setSubmitting('assign');
    try {
      await adminService.assignTeacher({
        class_id: Number(assignForm.class_id),
        subject_id: Number(assignForm.subject_id),
        teacher_id: Number(assignForm.teacher_id),
      });
      setAssignForm({ class_id: '', subject_id: '', teacher_id: '' });
      showToast('Teacher assigned successfully');
      await loadAll();
    } catch (err) {
      showToast(err?.response?.data?.details || err?.response?.data?.error || 'Assignment failed', 'error');
    } finally {
      setSubmitting('');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <X size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Setup</h1>
        <p className="text-slate-500 mt-2 font-medium">Create classes with students already assigned, define subjects, and connect teachers to their designated sections.</p>
      </div>

      {/* 3 Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Create Class */}
        <form onSubmit={handleCreateClass} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-5 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <School size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">New Class</h2>
              <p className="text-xs text-slate-400 font-medium">e.g. "Grade 10A"</p>
            </div>
          </div>
          <input
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Class name..."
            className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-normal placeholder:text-slate-300"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Students</p>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                {selectedStudentIds.length} selected
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto rounded-2xl bg-slate-50 p-3 space-y-2">
              {availableStudents.length > 0 ? (
                availableStudents.map((student) => {
                  const checked = selectedStudentIds.includes(student.id);
                  return (
                    <label
                      key={student.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                        checked ? 'bg-indigo-50 border border-indigo-100' : 'bg-white border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                        <p className="text-xs text-slate-400 truncate">{student.email}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  );
                })
              ) : (
                <p className="px-3 py-6 text-sm text-slate-400 text-center font-medium">
                  No unassigned students available. Create a student account or remove a student from another class first.
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting === 'class' || availableStudents.length === 0}
            className="mt-auto w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting === 'class' ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Create Class
          </button>
        </form>

        {/* Create Subject */}
        <form onSubmit={handleCreateSubject} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-5 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <BookMarked size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">New Subject</h2>
              <p className="text-xs text-slate-400 font-medium">e.g. "Mathematics"</p>
            </div>
          </div>
          <input
            required
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="Subject name..."
            className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:font-normal placeholder:text-slate-300"
          />
          <button
            type="submit"
            disabled={submitting === 'subject'}
            className="mt-auto w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting === 'subject' ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Create Subject
          </button>
        </form>

        {/* Assign Teacher */}
        <form onSubmit={handleAssignTeacher} className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl p-7 space-y-4 flex flex-col">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <UserCheck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Assign Teacher</h2>
              <p className="text-xs text-slate-400 font-medium">Link to class & subject</p>
            </div>
          </div>
          <select
            required
            value={assignForm.class_id}
            onChange={(e) => setAssignForm(p => ({ ...p, class_id: e.target.value }))}
            className="w-full px-5 py-3 bg-white/10 text-white rounded-2xl outline-none font-bold focus:bg-white/20 transition-all appearance-none"
          >
            <option value="" className="text-slate-900">Select class…</option>
            {classes.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
          </select>
          <select
            required
            value={assignForm.subject_id}
            onChange={(e) => setAssignForm(p => ({ ...p, subject_id: e.target.value }))}
            className="w-full px-5 py-3 bg-white/10 text-white rounded-2xl outline-none font-bold focus:bg-white/20 transition-all appearance-none"
          >
            <option value="" className="text-slate-900">Select subject…</option>
            {subjects.map(s => <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>)}
          </select>
          <select
            required
            value={assignForm.teacher_id}
            onChange={(e) => setAssignForm(p => ({ ...p, teacher_id: e.target.value }))}
            className="w-full px-5 py-3 bg-white/10 text-white rounded-2xl outline-none font-bold focus:bg-white/20 transition-all appearance-none"
          >
            <option value="" className="text-slate-900">Select teacher…</option>
            {teachers.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.name} ({t.teaching_subject || 'General'})</option>)}
          </select>
          <button
            type="submit"
            disabled={submitting === 'assign'}
            className="mt-auto w-full py-3.5 bg-white text-slate-900 font-black rounded-2xl transition-all hover:bg-slate-100 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting === 'assign' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            Confirm Assignment
          </button>
        </form>
      </div>

      {/* Lists Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Classes List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={20} className="text-indigo-600" />
            <h3 className="text-xl font-black text-slate-900">Classes <span className="text-slate-300 font-normal">({classes.length})</span></h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : classes.length > 0 ? (
              classes.map(c => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3.5 bg-indigo-50/50 rounded-2xl group hover:bg-indigo-50 transition-colors">
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">ID #{c.id}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 text-sm font-medium">No classes yet. Create one above.</p>
            )}
          </div>
        </div>

        {/* Subjects List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7">
          <div className="flex items-center gap-3 mb-6">
            <Layers size={20} className="text-amber-500" />
            <h3 className="text-xl font-black text-slate-900">Subjects <span className="text-slate-300 font-normal">({subjects.length})</span></h3>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
            ) : subjects.length > 0 ? (
              subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5 bg-amber-50/50 rounded-2xl group hover:bg-amber-50 transition-colors">
                  <span className="font-bold text-slate-800">{s.name}</span>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">ID #{s.id}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 text-sm font-medium">No subjects yet. Create one above.</p>
            )}
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden">
        <div className="p-7 border-b border-slate-50 flex items-center gap-3">
          <UserCheck size={20} className="text-emerald-600" />
          <h3 className="text-xl font-black text-slate-900">Current Teacher Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Class</th>
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject</th>
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Teacher</th>
                <th className="px-7 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-7 py-12 text-center"><Loader2 className="animate-spin text-slate-200 mx-auto" size={32} /></td></tr>
              ) : assignments.length > 0 ? (
                assignments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-7 py-4 font-bold text-slate-800">{a.class_name}</td>
                    <td className="px-7 py-4 text-slate-600 font-medium">{a.subject_name}</td>
                    <td className="px-7 py-4 text-slate-600 font-medium">{a.teacher_name}</td>
                    <td className="px-7 py-4 text-slate-400 text-sm">{a.academic_year_name}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-7 py-12 text-center text-slate-400 font-medium text-sm">No teacher assignments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassSubjectManager;
