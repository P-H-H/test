import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp for caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
        return Promise.reject(new Error('Authentication failed. Please login again.'));
      }
      
      // Handle forbidden errors
      if (status === 403) {
        return Promise.reject(new Error(data.message || 'Access denied.'));
      }
      
      // Handle validation errors
      if (status === 422) {
        const validationErrors = data.errors || [];
        const errorMessage = validationErrors.length > 0 
          ? validationErrors.map(err => err.msg).join(', ')
          : 'Validation failed.';
        return Promise.reject(new Error(errorMessage));
      }
      
      // Handle server errors
      if (status >= 500) {
        return Promise.reject(new Error('Server error. Please try again later.'));
      }
      
      // Handle other client errors
      return Promise.reject(new Error(data.message || 'Request failed.'));
    }
    
    // Handle network errors
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // GET request with error handling
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request with error handling
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request with error handling
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request with error handling
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request with error handling
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload file with progress tracking
  upload: async (url, file, onProgress, config = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  download: async (url, filename, config = {}) => {
    try {
      const response = await api.get(url, {
        ...config,
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw error;
    }
  },
};

// Export default api instance
export default api;