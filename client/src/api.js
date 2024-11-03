import axios from 'axios';

// Create an axios instance with a base URL
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000', // Use environment variable if available
});

// Request interceptor to add token to headers
instance.interceptors.request.use(
  (config) => {
    // Add token to headers if available
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific status codes (e.g., unauthorized)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
