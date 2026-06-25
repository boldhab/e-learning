import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

export default function DiscussionReplyForm({ onSubmit, isLoading = false }) {
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

    if (!content.trim() && !attachment) {
      setError('Please enter a reply or upload an attachment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSubmit({ content: content.trim(), attachment });
      setContent('');
      setAttachment(null);
      setAttachmentPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Text Area */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts or answer..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={4}
          disabled={submitting || isLoading}
        />
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

        <button
          type="submit"
          disabled={submitting || isLoading || (!content.trim() && !attachment)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Submitting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}
