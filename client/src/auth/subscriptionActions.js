import axios from '../api';
import {
  GET_SUBSCRIPTIONS_SUCCESS,
  CREATE_SUBSCRIPTION_SUCCESS,
  UPDATE_SUBSCRIPTION_SUCCESS,
  DELETE_SUBSCRIPTIONS_SUCCESS,
} from '../actions/types';

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