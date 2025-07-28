import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
};

export const donationAPI = {
  create: (donationData) => api.post('/api/donate', donationData),
  getAll: (params = {}) => api.get('/api/donate', { params }),
  getById: (id) => api.get(`/api/donate/${id}`),
  updateStatus: (id, status) => api.patch(`/api/donate/${id}`, { status }),
  delete: (id) => api.delete(`/api/donate/${id}`),
};

export const statsAPI = {
  getStats: () => api.get('/api/stats'),
};

export const adminAPI = {
  getDashboard: () => api.get('/api/admin/dashboard'),
};

export default api;
