import axios from '../api';
import {
  GET_SUBSCRIPTIONS_SUCCESS,
  CREATE_SUBSCRIPTION_SUCCESS,
  UPDATE_SUBSCRIPTION_SUCCESS,
  DELETE_SUBSCRIPTIONS_SUCCESS,
} from '../actions/types';
import { toast } from 'react-hot-toast';

/**
 * 1) GET /subscription
 *    Fetches all subscriptions from the server.
 */
export const getSubscriptions = () => async (dispatch) => {
  try {
      const response = await axios.get('/subscription');
      console.log('Fetched subscriptions:', response.data);
      dispatch({ type: GET_SUBSCRIPTIONS_SUCCESS, payload: response.data });
  } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscriptions.');
      throw error;
  }
};

/**
 * 2) POST /subscription/create
 *    Creates a new subscription using the provided data.
 */
export const createSubscription = (subscriptionData) => async (dispatch) => {
  try {
    const response = await axios.post('/subscription/create', subscriptionData);
    dispatch({
      type: CREATE_SUBSCRIPTION_SUCCESS,
      payload: response.data.subscription,
    });
    toast.success('Subscription created successfully!');
    dispatch(getSubscriptions()); // Refresh the list
  } catch (error) {
    console.error('Error creating subscription:', error);
    toast.error('Failed to create subscription. Please try again.');
    throw error;
  }
};

/**
 * 3) PUT /subscription/:id
 *    Updates an existing subscription using the provided ID and data.
 */
export const updateSubscription = (subId, subscriptionData) => async (dispatch) => {
  try {
    const response = await axios.put(`/subscription/${subId}`, subscriptionData);
    dispatch({
      type: UPDATE_SUBSCRIPTION_SUCCESS,
      payload: response.data.subscription,
    });
    toast.success('Subscription updated successfully!');
    dispatch(getSubscriptions()); // Refresh the list
  } catch (error) {
    console.error('Error updating subscription:', error);
    toast.error('Failed to update subscription. Please try again.');
    throw error;
  }
};

/**
 * 4) POST /subscription/delete
 *    Deletes multiple subscriptions by their IDs.
 */
export const deleteSubscriptions = (subIds) => async (dispatch) => {
  try {
    await axios.post('/subscription/delete', { subIds });
    dispatch({ type: DELETE_SUBSCRIPTIONS_SUCCESS, payload: subIds });
    toast.success('Subscriptions deleted successfully!');
    dispatch(getSubscriptions()); // Refresh the list
  } catch (error) {
    console.error('Error deleting subscriptions:', error);
    toast.error('Failed to delete subscriptions. Please try again.');
    throw error;
  }
};

/**
 * Utility function to format subscription data for display purposes.
 * This function is optional but can be used in components to process
 * subscription data before rendering.
 */
export const formatSubscriptionData = (subscriptions) => {
  return subscriptions.map((sub) => ({
    ...sub,
    priceInfo: `$${sub.priceMonthly} / month, $${sub.priceYearly} / year`,
    featuresList: sub.features.join(', '),
  }));
};

/**
 * Placeholder for future enhancements:
 * For example, filtering subscriptions by criteria or grouping them by status.
 */
export const filterActiveSubscriptions = (subscriptions) => {
  return subscriptions.filter((sub) => sub.isActive);
};