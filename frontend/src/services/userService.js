import api from './api';

const userService = {
  /**
   * Get all users with optional role filter
   */
  getUsers: async (role = null) => {
    try {
      const url = role ? `/admin/users?role=${role}` : '/admin/users';
      const response = await api.get(url);
      return response.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Create a new user (Invite)
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update user status
   */
  updateStatus: async (userId, status) => {
    try {
      const response = await api.put('/admin/users', { user_id: userId, status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  /**
   * Reset a user's password
   */
  resetPassword: async (userId, password) => {
    try {
      const response = await api.post('/admin/reset-password', { user_id: userId, password });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users?id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default userService;
