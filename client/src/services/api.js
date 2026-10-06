import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meetingmind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error formatting and 401 handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking /api/auth/me during initial page load
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (!isAuthCheck) {
        localStorage.removeItem('meetingmind_token');
        localStorage.removeItem('meetingmind_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateSettings: (data) => api.put('/auth/settings', data),
  logout: () => api.post('/auth/logout')
};

// Meeting Services
export const meetingsAPI = {
  create: (data) => api.post('/meetings', data),
  getAll: (params) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  updateActionItemStatus: (meetingId, itemId, data) =>
    api.patch(`/meetings/${meetingId}/action-items/${itemId}`, data),
  getDashboardStats: () => api.get('/meetings/stats/dashboard')
};

// AI Services
export const aiAPI = {
  analyzeMeeting: (meetingId, transcript) =>
    api.post(`/meetings/${meetingId}/analyze`, { transcript }),
  analyzeRaw: (transcript) => api.post('/ai/analyze-raw', { transcript }),
  testKey: (apiKey) => api.post('/ai/test-key', { apiKey })
};

export default api;
