// client/src/api.js
import axios from 'axios';

// Determine base URL based on environment variables or window location
const baseURL = process.env.REACT_APP_API_BASE_URL || 
                (window.location.hostname === 'localhost'
                ? 'http://localhost:8000' // Local server for development
                : 'https://app.cybernack.com'); // Production server

console.log('Axios baseURL:', baseURL); // Log to ensure the correct base URL is being used

// Create an axios instance with the base URL
const instance = axios.create({ baseURL });

// Request interceptor to add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_jwt_token');
    if (token) {
      console.log('Adding token to request headers.');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage.');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response);
      if (error.response.status === 401) {
        console.warn('Unauthorized access detected, redirecting to sign-in page.');
        window.location.href = '/signin';
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return Promise.reject(error);
  }
);

export default instance;