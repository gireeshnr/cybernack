import axios from 'axios';

// Determine base URL based on environment
const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_BASE_URL
  : 'http://localhost:8000';

console.log('Axios baseURL:', baseURL);

// Create an axios instance with the base URL
const instance = axios.create({
  baseURL,
});

// Request interceptor to add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_jwt_token');
    if (token) {
      console.log('Token found, adding to headers.');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage.');
    }
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
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
    console.error('Error in response interceptor:', error);
    if (error.response) {
      console.error('Error response details:', error.response);
      if (error.response.status === 401) {
        console.warn('Unauthorized access detected, redirecting to signin.');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;