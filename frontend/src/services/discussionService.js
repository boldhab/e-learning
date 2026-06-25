import api from './api';

const discussionService = {
  // Get groups for a course
  getGroups: async (courseId) => {
    const response = await api.get('/discussions/groups', {
      params: { course_id: courseId }
    });
    return response.data;
  },

  // Create a teacher discussion group
  createGroup: async (courseId, name, description = '') => {
    const response = await api.post('/discussions/groups', {
      course_id: courseId,
      name,
      description,
    });
    return response.data;
  },

  // Get all discussions for a course
  getDiscussions: async (courseId, page = 1, limit = 10, sortBy = 'recent', groupId = null) => {
    const response = await api.get('/discussions', {
      params: {
        course_id: courseId,
        page,
        limit,
        sort_by: sortBy,
        ...(groupId ? { group_id: groupId } : {})
      }
    });
    return response.data;
  },

  // Get single discussion with replies
  getDiscussion: async (discussionId) => {
    const response = await api.get('/discussions/view', {
      params: { id: discussionId }
    });
    return response.data;
  },

  // Create new discussion
  createDiscussion: async (courseId, title, content, attachment = null, groupId = null) => {
    const formData = new FormData();
    formData.append('course_id', courseId);
    formData.append('title', title);
    formData.append('content', content);
    if (groupId) {
      formData.append('group_id', groupId);
    }
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await api.post('/discussions/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Add reply to discussion
  addReply: async (discussionId, content, attachment = null) => {
    const formData = new FormData();
    formData.append('discussion_id', discussionId);
    formData.append('content', content);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    const response = await api.post('/discussions/reply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Add reaction to reply
  addReaction: async (replyId, reactionType = 'like') => {
    const response = await api.post('/discussions/react', {
      reply_id: replyId,
      reaction_type: reactionType
    });
    return response.data;
  },

  // Remove reaction from reply
  removeReaction: async (replyId) => {
    const response = await api.post('/discussions/unreact', {
      reply_id: replyId
    });
    return response.data;
  },

  // Mark reply as best answer
  markBestAnswer: async (replyId) => {
    const response = await api.post('/discussions/best-answer', {
      reply_id: replyId
    });
    return response.data;
  },

  // Search discussions
  searchDiscussions: async (courseId, keyword, page = 1, limit = 10, groupId = null) => {
    const response = await api.get('/discussions/search', {
      params: {
        course_id: courseId,
        keyword,
        page,
        limit,
        ...(groupId ? { group_id: groupId } : {})
      }
    });
    return response.data;
  },

  // Delete discussion
  deleteDiscussion: async (discussionId) => {
    const response = await api.post('/discussions/delete', {
      discussion_id: discussionId
    });
    return response.data;
  },

  // Delete reply
  deleteReply: async (replyId) => {
    const response = await api.post('/discussions/reply/delete', {
      reply_id: replyId
    });
    return response.data;
  }
};

export default discussionService;
