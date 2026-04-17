import { mockUsers } from './mock/mockData';

const users = [...mockUsers];

export const userService = {
  getAll: async () => users,

  getById: async (id) => users.find((user) => String(user.id) === String(id)) || null,

  getByRole: async (role) => users.filter((user) => user.role === role),

  updateStatus: async ({ id, status }) => {
    const user = users.find((item) => String(item.id) === String(id));
    if (!user) throw new Error('User not found');
    user.status = status;
    return user;
  },
};

export default userService;
