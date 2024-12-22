import axios from '../api';
import {
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ERROR,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
  SIGNUP_USER,
} from '../actions/types'; 

// Sign-in functionality
export const signUserIn = (data) => async (dispatch) => {
  try {
    const res = await axios.post('/auth/signin', data);
    dispatch({ type: AUTH_USER });
    localStorage.setItem('auth_jwt_token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    dispatch(getUserProfile());
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: 'Invalid login credentials.' });
    throw error;
  }
};

// Sign-out functionality
export const signUserOut = () => (dispatch) => {
  dispatch({ type: UNAUTH_USER });
  localStorage.removeItem('auth_jwt_token');
  delete axios.defaults.headers.common['Authorization'];
};

// Fetch user profile
export const getUserProfile = () => async (dispatch) => {
  try {
    const response = await axios.get('/user/profile');
    dispatch({ type: GET_USER_PROFILE, payload: response.data });
  } catch (error) {
    // Handle error silently or log to a server-side logging service
  }
};

// Update user profile
export const updateUserProfile = (data) => async (dispatch) => {
  try {
    const response = await axios.post('/user/profile', data);
    dispatch({ type: UPDATE_USER_PROFILE, payload: response.data });
  } catch (error) {
    throw error; // Error handling remains as is
  }
};

// Sign-up functionality
export const signUserUp = (userData) => async (dispatch) => {
  try {
    const response = await axios.post('/auth/signup', userData);
    dispatch({ type: SIGNUP_USER, payload: response.data });
    alert('Signup successful! Please check your email for the activation link.');
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: 'Error signing up. Please try again.' });
    throw error;
  }
};