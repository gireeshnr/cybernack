import axios from '../api'; // Use configured axios instance from src/api.js
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
export function signUserIn(data) {
  return function (dispatch) {
    return axios
      .post('/auth/signin', data)
      .then((res) => {
        dispatch({ type: AUTH_USER });
        localStorage.setItem('auth_jwt_token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        dispatch(getUserProfile());
        window.location = '/#account';
      })
      .catch((error) => {
        dispatch({ type: AUTH_ERROR, payload: 'Invalid login credentials.' });
        throw error;
      });
  };
}

// Fetch subscriptions
export const getSubscriptions = () => (dispatch) => {
  return axios
    .get('/subscription')
    .then((response) => {
      dispatch({
        type: GET_SUBSCRIPTIONS_SUCCESS,
        payload: response.data,
      });
    })
    .catch((error) => {
      console.error('Error fetching subscriptions:', error);
      throw error;
    });
};

// Create subscription
export const createSubscription = (subscriptionData) => (dispatch) => {
  return axios
    .post('/subscription/create', subscriptionData)
    .then((response) => {
      dispatch({
        type: CREATE_SUBSCRIPTION_SUCCESS,
        payload: response.data.subscription,
      });
      dispatch(getSubscriptions());
    })
    .catch((error) => {
      console.error('Error creating subscription:', error);
      throw error;
    });
};

// Update subscription
export const updateSubscription = (subId, subscriptionData) => (dispatch) => {
  return axios
    .put(`/subscription/${subId}`, subscriptionData)
    .then((response) => {
      dispatch({
        type: UPDATE_SUBSCRIPTION_SUCCESS,
        payload: response.data.subscription,
      });
      dispatch(getSubscriptions());
    })
    .catch((error) => {
      console.error('Error updating subscription:', error);
      throw error;
    });
};

// Delete subscriptions
export const deleteSubscriptions = (subIds) => (dispatch) => {
  return axios
    .post('/subscription/delete', { subIds })
    .then(() => {
      dispatch({
        type: DELETE_SUBSCRIPTIONS_SUCCESS,
        payload: subIds,
      });
      dispatch(getSubscriptions());
    })
    .catch((error) => {
      console.error('Error deleting subscriptions:', error);
      throw error;
    });
};

// Sign-up functionality
export const signUserUp = (userData) => async (dispatch) => {
  try {
    const response = await axios.post('/auth/signup', userData);
    dispatch({ type: SIGNUP_USER, payload: response.data });
    alert('Signup successful! Please check your email for the activation link.');
    window.location = '/#/signin';
  } catch (error) {
    console.error('Error during sign up:', error);
    dispatch({ type: AUTH_ERROR, payload: 'Error signing up. Please try again.' });
    throw error;
  }
};

// Sign-out functionality
export function signUserOut() {
  return function (dispatch) {
    dispatch({ type: UNAUTH_USER });
    localStorage.removeItem('auth_jwt_token');
    delete axios.defaults.headers.common['Authorization'];
  };
}

// Fetch user profile
export function getUserProfile() {
  return function (dispatch) {
    return axios
      .get('/user/profile')
      .then((response) => {
        dispatch({
          type: GET_USER_PROFILE,
          payload: response.data,
        });
      })
      .catch((err) => {
        console.error('Profile fetch error:', err);
      });
  };
}

// Update user profile
export function updateUserProfile(data) {
  return function (dispatch) {
    return axios
      .post('/user/profile', data)
      .then((response) => {
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: response.data,
        });
      })
      .catch((error) => {
        console.error('Error updating user profile:', error);
        throw error;
      });
  };
}

// Fetch users for an organization
export function getUsers() {
  return function (dispatch) {
    return axios
      .get('/user/list')
      .then((response) => {
        dispatch({
          type: GET_USERS_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        throw error;
      });
  };
}

// Fetch organizations
export function getOrganizations() {
  return function (dispatch) {
    return axios
      .get('/organization')
      .then((response) => {
        dispatch({
          type: GET_ORGANIZATIONS_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        console.error('Error fetching organizations:', error);
        throw error;
      });
  };
}

// Create organization
export function createOrganization(orgData) {
  return function (dispatch) {
    return axios
      .post('/organization/create', orgData)
      .then((response) => {
        dispatch({
          type: CREATE_ORGANIZATION_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        console.error('Error creating organization:', error);
        throw error;
      });
  };
}

// Update organization details
export function updateOrganization(orgId, data) {
  const updatedData = {
    orgId,
    name: data.orgName,
    isActive: data.isActive,
    subscription: data.subscription,
  };

  return function (dispatch) {
    return axios
      .post('/organization/update', updatedData)
      .then((response) => {
        dispatch({
          type: UPDATE_ORGANIZATION_STATUS_SUCCESS,
          payload: response.data.organization,
        });
      })
      .catch((error) => {
        console.error('Error updating organization:', error);
        throw error;
      });
  };
}

// Delete organizations
export function deleteOrganizations(orgIds) {
  return function (dispatch) {
    return axios
      .post('/organization/delete', { orgIds })
      .then((response) => {
        dispatch({
          type: DELETE_ORGANIZATIONS_SUCCESS,
          payload: orgIds,
        });
      })
      .catch((error) => {
        console.error('Error deleting organizations:', error);
        throw error;
      });
  };
}

// Add user to an organization
export function addUser(userData) {
  return function (dispatch) {
    return axios
      .post('/user/add', userData)
      .then((response) => {
        dispatch({ type: ADD_USER_SUCCESS, payload: response.data });
      })
      .catch((error) => {
        console.error('Error adding user:', error);
        throw error;
      });
  };
}

// Update user details
export function updateUser(userId, userData) {
  return function (dispatch) {
    return axios
      .post(`/user/update/${userId}`, userData)
      .then((response) => {
        dispatch({ type: UPDATE_USER_SUCCESS, payload: response.data });
      })
      .catch((error) => {
        console.error('Error updating user:', error);
        throw error;
      });
  };
}

// Delete users from an organization
export function deleteUsers(userIds) {
  return function (dispatch) {
    return axios
      .post('/user/delete', { userIds })
      .then((response) => {
        dispatch({ type: DELETE_USERS_SUCCESS, payload: userIds });
      })
      .catch((error) => {
        console.error('Error deleting users:', error);
        throw error;
      });
  };
}