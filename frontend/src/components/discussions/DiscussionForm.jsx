import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

export default function DiscussionForm({ onSubmit, onCancel, isLoading = false }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('File type not allowed. Please upload images, PDF, or Word documents.');
        return;
      }

      setAttachment(file);
      setError(null);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachmentPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(file.name);
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (content.trim().length < 10) {
      setError('Content must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        attachment
      });
    } catch (err) {
      setError(err.message || 'Failed to create discussion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discussion Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your question or topic?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitting || isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">At least 5 characters</p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Details
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Provide more details about your question or topic..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={6}
          disabled={submitting || isLoading}
        />
        <p className="text-xs text-gray-500 mt-1">At least 10 characters</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Attachment Preview */}
      {attachmentPreview && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          {typeof attachmentPreview === 'string' && !attachmentPreview.startsWith('data:') ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-700">📎 {attachmentPreview}</span>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <img
                src={attachmentPreview}
                alt="Preview"
                className="max-w-sm rounded"
              />
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
          <Upload className="w-4 h-4" />
          <span>Attach File</span>
          <input
            type="file"
            onChange={handleAttachmentChange}
            disabled={submitting || isLoading}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
        </label>

        <div className="flex gap-2">
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
            disabled={submitting || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Creating...' : 'Create Discussion'}
          </button>
        </div>
      </div>
    </form>
  );
}
