import axios from 'axios';

// This is where you change the endpoint for hosting
// In production, you can use an environment variable: import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const instance = axios.create({
  baseURL: API_BASE_URL,
});

import { toast } from 'react-hot-toast';

// Request interceptor for adding the JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling global errors (like 401 Unauthorized)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
         toast.error("Your session has expired! Please log in again.", { id: 'session-expired' });
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
