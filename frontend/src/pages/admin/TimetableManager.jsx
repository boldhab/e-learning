import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const TimetableManager = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [forms, setForms] = useState({
    className: '',
    subjectName: '',
    class_id: '',
    subject_id: '',
    teacher_id: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [classesData, subjectsData, teachersData, assignmentsData] = await Promise.all([
        adminService.getClasses(),
        adminService.getSubjects(),
        adminService.getUsers('teacher'),
        adminService.getAssignments(),
      ]);

      setClasses(classesData);
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load academic setup.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitAction = async (callback, successMessage) => {
    setMessage('');
    setError('');

    try {
      await callback();
      setMessage(successMessage);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.details || err?.response?.data?.error || 'Action failed.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Academic Setup</h1>
        <p className="mt-1 text-slate-500">Create classes and subjects, then assign teachers to the correct class-subject combination.</p>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAction(async () => {
              await adminService.createClass(forms.className);
              setForms((prev) => ({ ...prev, className: '' }));
            }, 'Class created successfully.');
          }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900">Create Class</h2>
          <input
            value={forms.className}
            onChange={(e) => setForms((prev) => ({ ...prev, className: e.target.value }))}
            placeholder="Class name"
            className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            required
          />
          <button type="submit" className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Save class
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAction(async () => {
              await adminService.createSubject(forms.subjectName);
              setForms((prev) => ({ ...prev, subjectName: '' }));
            }, 'Subject created successfully.');
          }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900">Create Subject</h2>
          <input
            value={forms.subjectName}
            onChange={(e) => setForms((prev) => ({ ...prev, subjectName: e.target.value }))}
            placeholder="Subject name"
            className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            required
          />
          <button type="submit" className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Save subject
          </button>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitAction(async () => {
              await adminService.assignTeacher({
                class_id: Number(forms.class_id),
                subject_id: Number(forms.subject_id),
                teacher_id: Number(forms.teacher_id),
              });
              setForms((prev) => ({ ...prev, class_id: '', subject_id: '', teacher_id: '' }));
            }, 'Teacher assigned successfully.');
          }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900">Assign Teacher</h2>
          <div className="mt-5 space-y-4">
            <select
              value={forms.class_id}
              onChange={(e) => setForms((prev) => ({ ...prev, class_id: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
              required
            >
              <option value="">Select class</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>

            <select
              value={forms.subject_id}
              onChange={(e) => setForms((prev) => ({ ...prev, subject_id: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
              required
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <select
              value={forms.teacher_id}
              onChange={(e) => setForms((prev) => ({ ...prev, teacher_id: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
              required
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.teaching_subject || 'No specialization'})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-4 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Assign teacher
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Classes</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading classes...</p>
            ) : (
              classes.map((classItem) => (
                <div key={classItem.id} className="rounded-2xl bg-slate-50 px-4 py-3 font-medium text-slate-700">
                  {classItem.name}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Subjects</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading subjects...</p>
            ) : (
              subjects.map((subject) => (
                <div key={subject.id} className="rounded-2xl bg-slate-50 px-4 py-3 font-medium text-slate-700">
                  {subject.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Current Teacher Assignments</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Year</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{assignment.class_name}</td>
                  <td className="px-4 py-3 text-slate-700">{assignment.subject_name}</td>
                  <td className="px-4 py-3 text-slate-700">{assignment.teacher_name}</td>
                  <td className="px-4 py-3 text-slate-500">{assignment.academic_year_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && assignments.length === 0 && (
            <p className="pt-4 text-sm text-slate-500">No teacher assignments have been created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableManager;
