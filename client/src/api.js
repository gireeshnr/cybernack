import axios from 'axios';

// Use environment variable for base URL or default to localhost for development
const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_BASE_URL
  : 'http://localhost:8000';

// Create an axios instance with the base URL
const instance = axios.create({
  baseURL,
});

// Request interceptor to add token to headers
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