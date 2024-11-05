import axios from 'axios';

// Set base URL based on environment variable
const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create an axios instance with the base URL
const instance = axios.create({
  baseURL,
});

// Request interceptor to add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;