// client/src/api.js
import axios from 'axios';

const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://your-production-url.com');

const instance = axios.create({ baseURL });

instance.interceptors.request.use(
  (config) => {
    // If you store a token in localStorage:
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
      // e.g. redirect to login
      localStorage.removeItem('auth_jwt_token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default instance;