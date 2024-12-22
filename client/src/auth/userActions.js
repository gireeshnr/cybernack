import axios from '../api';
import {
  GET_USERS_SUCCESS,
  ADD_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  DELETE_USERS_SUCCESS,
} from '../actions/types';

// Fetch users for an organization
export const getUsers = () => async (dispatch) => {
  try {
    const response = await axios.get('/user/list');
    dispatch({ type: GET_USERS_SUCCESS, payload: response.data });
  } catch {
    throw new Error('Error fetching users.');
  }
};

// Add user to an organization
export const addUser = (userData) => async (dispatch) => {
  try {
    const response = await axios.post('/user/add', userData);
    dispatch({ type: ADD_USER_SUCCESS, payload: response.data });
  } catch {
    throw new Error('Error adding user.');
  }
};

// Update user details
export const updateUser = (userId, userData) => async (dispatch) => {
  try {
    const response = await axios.post(`/user/update/${userId}`, userData);
    dispatch({ type: UPDATE_USER_SUCCESS, payload: response.data });
  } catch {
    throw new Error('Error updating user.');
  }
};

// Delete users from an organization
export const deleteUsers = (userIds) => async (dispatch) => {
  try {
    await axios.post('/user/delete', { userIds });
    dispatch({ type: DELETE_USERS_SUCCESS, payload: userIds });
  } catch {
    throw new Error('Error deleting users.');
  }
};