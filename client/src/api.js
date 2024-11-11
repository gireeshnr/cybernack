import axios from 'axios';

// Determine base URL based on environment variables or window location
const baseURL = process.env.REACT_APP_API_BASE_URL || 
                (window.location.hostname === 'localhost'
                ? 'http://localhost:8000'
                : 'https://app.cybernack.com');

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
      console.warn('401 Unauthorized error received. Ensure the UI handles this state appropriately.');
      // Optionally, you can trigger a Redux action here to handle logout or error state.
    }
    return Promise.reject(error);
  }
);

export default instance;