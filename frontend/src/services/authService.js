import storage from '../utils/localStorage';
import { mockUsers } from './mock/mockData';

const USER_KEY = 'user';

const resolveRole = (email = '') => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = mockUsers.find(
    (candidate) => candidate.email.toLowerCase() === normalizedEmail
  );

  if (existingUser?.role) return existingUser.role;
  if (normalizedEmail.includes('admin')) return 'admin';
  if (normalizedEmail.includes('teacher')) return 'teacher';
  return 'student';
};

export const authService = {
  login: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = {
      id: Date.now(),
      name: email.split('@')[0],
      email,
      role: resolveRole(email),
      token: 'mock-token',
    };

    storage.set(USER_KEY, user);
    return user;
  },

  register: async ({ name, email, password, role = 'student' }) => {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    const user = {
      id: Date.now(),
      name,
      email,
      role,
      token: 'mock-token',
    };

    storage.set(USER_KEY, user);
    return user;
  },

  logout: async () => {
    storage.remove(USER_KEY);
    return true;
  },

  getCurrentUser: () => storage.get(USER_KEY),
};

export default authService;
