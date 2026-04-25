import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const SystemBackup = () => {
  const [years, setYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [yearName, setYearName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadYears = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminService.getYears();
      setYears(response.years || []);
      setActiveYear(response.active_year || null);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load academic years.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYears();
  }, []);

  const handleCreateYear = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await adminService.createYear(yearName);
      setYearName('');
      setMessage('Academic year created successfully.');
      await loadYears();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create academic year.');
    }
  };

  const handleActivate = async (yearId) => {
    setMessage('');
    setError('');

    try {
      await adminService.setActiveYear(yearId);
      setMessage('Active academic year updated.');
      await loadYears();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to activate academic year.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Academic Year Settings</h1>
        <p className="mt-1 text-slate-500">Create new academic years and choose which one is currently active for assignments and enrollments.</p>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        <form onSubmit={handleCreateYear} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Create Academic Year</h2>
          <p className="mt-1 text-sm text-slate-500">Example: `2026-2027`</p>
          <input
            value={yearName}
            onChange={(e) => setYearName(e.target.value)}
            placeholder="2026-2027"
            className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400"
            required
          />
          <button type="submit" className="mt-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Save academic year
          </button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Available Academic Years</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
              Active: {activeYear?.name || 'Not set'}
            </span>
          </div>

          {loading ? (
            <p className="mt-5 text-sm text-slate-500">Loading years...</p>
          ) : (
            <div className="mt-5 space-y-3">
              {years.map((year) => (
                <div key={year.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-800">{year.name}</p>
                    <p className="text-xs text-slate-400">
                      {Number(year.is_active) === 1 ? 'Currently active' : 'Inactive'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleActivate(year.id)}
                    disabled={Number(year.is_active) === 1}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {Number(year.is_active) === 1 ? 'Active' : 'Set active'}
                  </button>
                </div>
              ))}
              {years.length === 0 && <p className="text-sm text-slate-500">No academic years found yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemBackup;
