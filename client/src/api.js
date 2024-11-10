// client/src/api.js
import axios from 'axios';

// Determine base URL based on environment variables or window location
const baseURL = process.env.REACT_APP_API_BASE_URL || 
                (window.location.hostname === 'localhost'
                ? 'http://localhost:8000' // Local server for development
                : 'https://app.cybernack.com'); // Production server

// Create an axios instance with the base URL
const instance = axios.create({ baseURL });

// Request interceptor to add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default instance;