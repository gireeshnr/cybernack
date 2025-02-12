// client/src/api.js
import axios from 'axios';

// Prefer REACT_APP_API_BASE_URL.
// If not defined AND we're on localhost, use 'http://localhost:8000'.
// Otherwise, use empty string (which will likely fail if not set).
const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

if (!baseURL) {
  console.warn(
    'No REACT_APP_API_BASE_URL set, and not on localhost. Requests may fail.'
  );
}

const instance = axios.create({ baseURL });

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

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_jwt_token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default instance;