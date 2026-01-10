import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with interceptors
const api = axios.create();

// List of paths that should NOT redirect on 401 (OBS overlay pages)
const noRedirectPaths = [
  '/overlay/',
];

// Check if current page is an OBS overlay page or public page
const isPublicPage = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  // Overlay sub-pages for OBS
  const overlaySubPages = ['/notifications', '/mediashare', '/leaderboard', '/qr-donate'];
  // Public pages that don't need auth
  const publicPaths = ['/donate/'];
  
  return overlaySubPages.some(subPage => path.includes(subPage)) || 
         publicPaths.some(publicPath => path.startsWith(publicPath));
};

// Request interceptor - add token to all requests
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

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Skip redirect for public pages (overlay, donate)
      if (isPublicPage()) {
        return Promise.reject(error);
      }

      // Token expired or invalid
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        
        // Only show error and redirect if user was logged in
        if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.', {
            duration: 5000,
            position: 'top-center',
            id: 'session-expired' // Prevent duplicate toasts
          });
          
          // Redirect to landing page
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
