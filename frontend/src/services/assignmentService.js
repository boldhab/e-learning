import { mockAssignments } from './mock/mockData';
import { studentAssignmentsData } from './mock/studentMockData';

const assignments = [...studentAssignmentsData, ...mockAssignments];

export const assignmentService = {
  getAll: async () => assignments,

  getByStatus: async (status) => assignments.filter((item) => item.status === status),

  getById: async (id) => assignments.find((item) => String(item.id) === String(id)) || null,

  submit: async ({ id, payload }) => {
    const item = assignments.find((entry) => String(entry.id) === String(id));
    if (!item) throw new Error('Assignment not found');
    item.status = 'submitted';
    item.submission = payload || {};
    return item;
  },
};

export default assignmentService;
