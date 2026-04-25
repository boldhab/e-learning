import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../services/mock/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for "logged in" user in local storage
    const savedUser = localStorage.getItem('elearning_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      const normalizedEmail = (parsedUser?.email || '').trim().toLowerCase();
      const existingUser = mockUsers.find(
        (candidate) => candidate.email.toLowerCase() === normalizedEmail
      );

      if (existingUser && parsedUser.role !== existingUser.role) {
        const normalizedUser = { ...parsedUser, role: existingUser.role };
        localStorage.setItem('elearning_user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      } else {
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const existingUser = mockUsers.find(
      (candidate) => candidate.email.toLowerCase() === normalizedEmail
    );

    // Use canonical role from mock user records when available.
    let role = existingUser?.role || 'student';

    // Keep a fallback for ad-hoc test emails not present in mock data.
    if (!existingUser) {
      if (normalizedEmail.includes('teacher')) role = 'teacher';
      if (normalizedEmail.includes('admin')) role = 'admin';
    }

    const userData = {
      id: existingUser?.id || Math.random().toString(36).slice(2, 11),
      name:
        existingUser?.name ||
        normalizedEmail.split('@')[0].charAt(0).toUpperCase() +
          normalizedEmail.split('@')[0].slice(1),
      email: normalizedEmail,
      role
    };

    setUser(userData);
    localStorage.setItem('elearning_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elearning_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
