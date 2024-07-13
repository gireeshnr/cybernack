// src/actions/index.js
import axios from 'axios';
import { AUTH_USER, UNAUTH_USER, AUTH_ERROR, SIGNUP_USER, GET_USER_PROFILE, UPDATE_USER_PROFILE } from './types';
import { refreshToken } from '../utils/token'; // Correct import statement

const ROOT_URL = process.env.API_URI || 'http://localhost:8000';

axios.defaults.baseURL = ROOT_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('auth_jwt_token');
  if (token) {
    const tokenExpiry = JSON.parse(atob(token.split('.')[1])).exp;
    const now = Date.now() / 1000;
    if (tokenExpiry - now < 300) { // Refresh if token expires in less than 5 minutes
      const newToken = await refreshToken();
      config.headers['Authorization'] = `Bearer ${newToken}`;
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export function signUserIn(data) {
  return function (dispatch) {
    return axios
      .post(`/auth/signin`, data)
      .then(res => {
        dispatch({ type: AUTH_USER });
        localStorage.setItem('auth_jwt_token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        window.location = '/#account';
      })
      .catch(error => {
        console.log(error);
        dispatch({ type: AUTH_ERROR, payload: 'Invalid login credentials.' });
        throw error; // Propagate the error
      });
  };
}

export const signUserUp = (userData) => async dispatch => {
  try {
    const response = await axios.post('/auth/signup', userData);
    dispatch({ type: SIGNUP_USER, payload: response.data });
    dispatch({ type: AUTH_USER });
    localStorage.setItem('auth_jwt_token', response.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    window.location = '/#account';
  } catch (error) {
    console.error('Signup error:', error);
    dispatch({ type: AUTH_ERROR, payload: 'Error signing up. Please try again.' });
    throw error; // Propagate the error
  }
};

export function signUserOut() {
  return function (dispatch) {
    dispatch({ type: UNAUTH_USER });
    localStorage.removeItem('auth_jwt_token');
    delete axios.defaults.headers.common['Authorization'];
  };
}

export function getUserProfile() {
  return function (dispatch) {
    return axios.get(`/user/profile`)
      .then(response => {
        dispatch({
          type: GET_USER_PROFILE,
          payload: response.data
        });
      });
  };
}

export function updateUserProfile(data) {
  return function (dispatch) {
    return axios.post(`/user/profile`, data)
      .then(response => {
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: response.data
        });
      });
  };
}

const request = axios;
export { request };
