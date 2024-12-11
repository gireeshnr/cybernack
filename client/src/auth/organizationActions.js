import axios from '../api';
import {
  CREATE_ORGANIZATION_SUCCESS,
  GET_ORGANIZATIONS_SUCCESS,
  DELETE_ORGANIZATIONS_SUCCESS,
  UPDATE_ORGANIZATION_STATUS_SUCCESS,
} from '../actions/types';

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