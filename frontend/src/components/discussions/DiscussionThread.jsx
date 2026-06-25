import React from 'react';
import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';

export default function DiscussionThread({ discussion }) {
  if (!discussion) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{discussion.title}</h1>

        {discussion.group_name && (
          <div className="inline-flex items-center px-3 py-1 mb-3 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
            {discussion.group_name}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {discussion.student_avatar && (
              <img
                src={discussion.student_avatar}
                alt={discussion.student_name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{discussion.student_name}</p>
              <p className="text-sm text-gray-500">{discussion.student_role}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(discussion.created_at).toLocaleDateString()} at{' '}
            {new Date(discussion.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{discussion.content}</p>
      </div>

      {/* Attachment */}
      {discussion.attachment_url && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {discussion.attachment_type === 'image' || discussion.attachment_type?.startsWith('image/') ? (
            <img
              src={discussion.attachment_url}
              alt="Discussion attachment"
              className="max-w-full h-auto rounded max-h-96"
            />
          ) : (
            <a
              href={discussion.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              📎 Download Attachment
            </a>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 text-gray-600 border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>{discussion.views || 0} views</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>{discussion.reply_count || 0} replies</span>
        </div>
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4" />
          <span>{discussion.reaction_count || 0} reactions</span>
        </div>
      </div>
    </div>
  );
}
