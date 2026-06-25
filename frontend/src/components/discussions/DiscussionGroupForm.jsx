import React, { useState } from 'react';
import { AlertCircle, BookOpen, GraduationCap } from 'lucide-react';

/**
 * DiscussionGroupForm
 *
 * Props:
 *  - onSubmit(formData)  — called with { name, description }
 *  - onCancel()
 *  - isLoading           — external loading state (optional)
 *  - contextLabel        — short label for the course / context (optional)
 *  - subjectName         — subject derived from the course (optional)
 *  - className           — class name derived from the course (optional)
 */
export default function DiscussionGroupForm({
  onSubmit,
  onCancel,
  isLoading = false,
  contextLabel = '',
  subjectName = '',
  className: classNameProp = '',
}) {
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [error, setError]           = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to create discussion group');
    } finally {
      setSubmitting(false);
    }
  };

  const hasContext = subjectName || classNameProp || contextLabel;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Context indicator — shown when subject/class info is available */}
      {hasContext && (
        <div className="flex flex-wrap gap-2">
          {subjectName && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
              <BookOpen size={10} />
              {subjectName}
            </span>
          )}
          {classNameProp && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg">
              <GraduationCap size={10} />
              {classNameProp}
            </span>
          )}
          {contextLabel && !subjectName && !classNameProp && (
            <span className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              {contextLabel}
            </span>
          )}
        </div>
      )}

      {/* Group name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Week 1 Questions"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitting || isLoading}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional group description"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          disabled={submitting || isLoading}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting || isLoading}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || isLoading || !name.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Creating…' : 'Create Group'}
        </button>
      </div>
    </form>
  );
}