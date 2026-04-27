import api from './api';

const adminService = {
  getOverview: async () => {
    const response = await api.get('/admin/overview');
    return response.data;
  },

  getUsers: async (role) => {
    const response = await api.get('/admin/users', {
      params: role && role !== 'all' ? { role } : undefined,
    });
    return response.data.users || [];
  },

  registerUser: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  getClasses: async () => {
    const response = await api.get('/classes');
    return response.data.classes || [];
  },

  createClass: async (payload) => {
    const response = await api.post('/classes', payload);
    return response.data;
  },

  deleteClass: async (classId) => {
    const response = await api.delete(`/classes?id=${classId}`);
    return response.data;
  },

  getSubjects: async () => {
    const response = await api.get('/subjects');
    return response.data.subjects || [];
  },

  createSubject: async (name) => {
    const response = await api.post('/subjects', { name });
    return response.data;
  },

  deleteSubject: async (subjectId) => {
    const response = await api.delete(`/subjects?id=${subjectId}`);
    return response.data;
  },

  getYears: async () => {
    const response = await api.get('/admin/years');
    return response.data;
  },

  createYear: async (name) => {
    const response = await api.post('/admin/years', { name });
    return response.data;
  },

  setActiveYear: async (yearId) => {
    const response = await api.post('/admin/active-year', { year_id: yearId });
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/admin/assignments');
    return response.data.assignments || [];
  },

  assignTeacher: async (payload) => {
    const response = await api.post('/admin/assign', payload);
    return response.data;
  },

  assignStudent: async (payload) => {
    const response = await api.post('/admin/assign-student', payload);
    return response.data;
  },
};

export default adminService;
