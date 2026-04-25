import axios from 'axios';
import storage from '../utils/localStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/E-learning/backend/index.php/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const user = storage.get('user');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
