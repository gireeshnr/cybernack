import axios from '../api'; // Configured axios instance import
import {
  GET_SUBSCRIPTIONS_SUCCESS,
  CREATE_ORGANIZATION_SUCCESS,
  AUTH_USER,
  UNAUTH_USER,
  AUTH_ERROR,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
  SIGNUP_USER,
  GET_USERS_SUCCESS,
  GET_ORGANIZATIONS_SUCCESS,
  DELETE_ORGANIZATIONS_SUCCESS,
  ADD_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
  DELETE_USERS_SUCCESS,
  UPDATE_ORGANIZATION_STATUS_SUCCESS,
  CREATE_SUBSCRIPTION_SUCCESS,
  UPDATE_SUBSCRIPTION_SUCCESS,
  DELETE_SUBSCRIPTIONS_SUCCESS,
} from '../actions/types';

// Sign-in functionality
export const signUserIn = (data) => async (dispatch) => {
  try {
    const res = await axios.post('/auth/signin', data);
    console.log('Sign-in successful, token received:', res.data.token);
    dispatch({ type: AUTH_USER });
    localStorage.setItem('auth_jwt_token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    dispatch(getUserProfile());
  } catch (error) {
    console.error('Sign-in error:', error.response || error.message);
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
    console.error('Profile fetch error:', error);
  }
};

// Update user profile
export const updateUserProfile = (data) => async (dispatch) => {
  try {
    const response = await axios.post('/user/profile', data);
    dispatch({ type: UPDATE_USER_PROFILE, payload: response.data });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Sign-up functionality
export const signUserUp = (userData) => async (dispatch) => {
  try {
    const response = await axios.post('/auth/signup', userData);
    dispatch({ type: SIGNUP_USER, payload: response.data });
    alert('Signup successful! Please check your email for the activation link.');
  } catch (error) {
    console.error('Error during sign up:', error);
    dispatch({ type: AUTH_ERROR, payload: 'Error signing up. Please try again.' });
    throw error;
  }
};

// Fetch subscriptions
export const getSubscriptions = () => async (dispatch) => {
  try {
    const response = await axios.get('/subscription');
    dispatch({ type: GET_SUBSCRIPTIONS_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

// Create subscription
export const createSubscription = (subscriptionData) => async (dispatch) => {
  try {
    const response = await axios.post('/subscription/create', subscriptionData);
    dispatch({ type: CREATE_SUBSCRIPTION_SUCCESS, payload: response.data.subscription });
    dispatch(getSubscriptions());
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Update subscription
export const updateSubscription = (subId, subscriptionData) => async (dispatch) => {
  try {
    const response = await axios.put(`/subscription/${subId}`, subscriptionData);
    dispatch({ type: UPDATE_SUBSCRIPTION_SUCCESS, payload: response.data.subscription });
    dispatch(getSubscriptions());
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

// Delete subscriptions
export const deleteSubscriptions = (subIds) => async (dispatch) => {
  try {
    await axios.post('/subscription/delete', { subIds });
    dispatch({ type: DELETE_SUBSCRIPTIONS_SUCCESS, payload: subIds });
    dispatch(getSubscriptions());
  } catch (error) {
    console.error('Error deleting subscriptions:', error);
    throw error;
  }
};

// Fetch users for an organization
export const getUsers = () => async (dispatch) => {
  try {
    const response = await axios.get('/user/list');
    dispatch({ type: GET_USERS_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Fetch organizations
export const getOrganizations = () => async (dispatch) => {
  try {
    const response = await axios.get('/organization');
    dispatch({ type: GET_ORGANIZATIONS_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
};

// Create organization
export const createOrganization = (orgData) => async (dispatch) => {
  try {
    const response = await axios.post('/organization/create', orgData);
    dispatch({ type: CREATE_ORGANIZATION_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

// Update organization details
export const updateOrganization = (orgId, data) => async (dispatch) => {
  try {
    const updatedData = {
      orgId,
      name: data.orgName,
      isActive: data.isActive,
      subscription: data.subscription,
    };
    const response = await axios.post('/organization/update', updatedData);
    dispatch({ type: UPDATE_ORGANIZATION_STATUS_SUCCESS, payload: response.data.organization });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

// Delete organizations
export const deleteOrganizations = (orgIds) => async (dispatch) => {
  try {
    await axios.post('/organization/delete', { orgIds });
    dispatch({ type: DELETE_ORGANIZATIONS_SUCCESS, payload: orgIds });
  } catch (error) {
    console.error('Error deleting organizations:', error);
    throw error;
  }
};

// Add user to an organization
export const addUser = (userData) => async (dispatch) => {
  try {
    const response = await axios.post('/user/add', userData);
    dispatch({ type: ADD_USER_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Update user details
export const updateUser = (userId, userData) => async (dispatch) => {
  try {
    const response = await axios.post(`/user/update/${userId}`, userData);
    dispatch({ type: UPDATE_USER_SUCCESS, payload: response.data });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete users from an organization
export const deleteUsers = (userIds) => async (dispatch) => {
  try {
    await axios.post('/user/delete', { userIds });
    dispatch({ type: DELETE_USERS_SUCCESS, payload: userIds });
  } catch (error) {
    console.error('Error deleting users:', error);
    throw error;
  }
};