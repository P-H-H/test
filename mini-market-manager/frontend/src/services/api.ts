import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle different error status codes
    switch (error.response?.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 422:
        // Validation errors
        if (error.response.data.errors) {
          error.response.data.errors.forEach((err: any) => {
            toast.error(err.msg || err.message);
          });
        } else {
          toast.error(message);
        }
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (error.code === 'NETWORK_ERROR') {
          toast.error('Network error. Please check your connection.');
        } else {
          toast.error(message);
        }
    }

    return Promise.reject(error);
  }
);

export default api;