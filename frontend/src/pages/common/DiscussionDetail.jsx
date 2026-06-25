import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import discussionService from '../../services/discussionService';
import DiscussionThread from '../../components/discussions/DiscussionThread';
import DiscussionReplyForm from '../../components/discussions/DiscussionReplyForm';
import { MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react';

export default function DiscussionDetail() {
  const { courseId, discussionId } = useParams();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    loadDiscussion();
  }, [discussionId]);

  const loadDiscussion = async () => {
    try {
      setLoading(true);
      const data = await discussionService.getDiscussion(discussionId);
      setDiscussion(data.discussion);
      setReplies(data.replies || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (replyData) => {
    try {
      const response = await discussionService.addReply(
        discussionId,
        replyData.content,
        replyData.attachment
      );
      setReplies(response.replies || []);
      setReplyingTo(null);
    } catch (err) {
      setError(err.message || 'Failed to add reply');
    }
  };

  const handleReaction = async (replyId, reactionType) => {
    try {
      await discussionService.addReaction(replyId, reactionType);
      await loadDiscussion();
    } catch (err) {
      setError(err.message || 'Failed to add reaction');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center p-8 text-gray-500">
        Discussion not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Discussion Header */}
      <DiscussionThread discussion={discussion} />

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <MessageCircle className="w-5 h-5" />
          <span>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</span>
        </div>

        {/* Replies List */}
        <div className="space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg p-4 border border-gray-200">
              {/* Reply Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {reply.user_avatar && (
                    <img
                      src={reply.user_avatar}
                      alt={reply.user_name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{reply.user_name}</p>
                    <p className="text-xs text-gray-500">{reply.user_role}</p>
                  </div>
                </div>
                {reply.is_best_answer && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Best Answer
                  </span>
                )}
              </div>

              {/* Reply Content */}
              <p className="text-gray-700 mb-3">{reply.content}</p>

              {/* Attachment */}
              {reply.attachment_url && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  {reply.attachment_type === 'image' || reply.attachment_type?.startsWith('image/') ? (
                    <img
                      src={reply.attachment_url}
                      alt="attachment"
                      className="max-w-md rounded"
                    />
                  ) : (
                    <a
                      href={reply.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      📎 Download attachment
                    </a>
                  )}
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleReaction(reply.id, 'like')}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{reply.like_count || 0}</span>
                </button>
                <button
                  onClick={() => handleReaction(reply.id, 'helpful')}
                  className="text-gray-600 hover:text-green-600"
                >
                  👍 {reply.helpful_count || 0}
                </button>
                <button
                  onClick={() => handleReaction(reply.id, 'confused')}
                  className="text-gray-600 hover:text-yellow-600"
                >
                  😕 {reply.confused_count || 0}
                </button>
              </div>

              {/* Metadata */}
              <p className="text-xs text-gray-400 mt-3">
                {new Date(reply.created_at).toLocaleDateString()} at {new Date(reply.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Your Reply</h3>
        <DiscussionReplyForm onSubmit={handleReplySubmit} />
      </div>
    </div>
  );
}
