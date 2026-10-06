import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('meetingmind_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('meetingmind_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('meetingmind_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('meetingmind_user', JSON.stringify(res.user));
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem('meetingmind_token');
          localStorage.removeItem('meetingmind_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      if (res.token && res.user) {
        localStorage.setItem('meetingmind_token', res.token);
        localStorage.setItem('meetingmind_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await authAPI.register({ name, email, password });
      if (res.token && res.user) {
        localStorage.setItem('meetingmind_token', res.token);
        localStorage.setItem('meetingmind_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('meetingmind_token');
    localStorage.removeItem('meetingmind_user');
    setToken(null);
    setUser(null);
    try {
      authAPI.logout();
    } catch {
      // Ignore background logout errors
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('meetingmind_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
