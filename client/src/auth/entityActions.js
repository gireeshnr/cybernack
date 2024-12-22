import axios from 'axios';
import { toast } from 'react-hot-toast';

// Action Types
export const GET_ENTITIES = 'GET_ENTITIES';
export const CREATE_ENTITY = 'CREATE_ENTITY';
export const UPDATE_ENTITY = 'UPDATE_ENTITY';
export const DELETE_ENTITIES = 'DELETE_ENTITIES';

// Get all entities
export const getEntities = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/entities');
    dispatch({ type: GET_ENTITIES, payload: response.data });
  } catch {
    toast.error('Error fetching entities.');
  }
};

// Create a new entity
export const createEntity = (entityData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/entities', entityData);
    dispatch({ type: CREATE_ENTITY, payload: response.data });
    toast.success('Entity created successfully!');
  } catch {
    toast.error('Error creating entity.');
  }
};

// Update an existing entity
export const updateEntity = (entityId, entityData) => async (dispatch) => {
  try {
    const response = await axios.put(`/api/entities/${entityId}`, entityData);
    dispatch({ type: UPDATE_ENTITY, payload: response.data });
    toast.success('Entity updated successfully!');
  } catch {
    toast.error('Error updating entity.');
  }
};

// Delete selected entities
export const deleteEntities = (entityIds) => async (dispatch) => {
  try {
    await axios.post('/api/entities/delete', { ids: entityIds });
    dispatch({ type: DELETE_ENTITIES, payload: entityIds });
    toast.success('Selected entities deleted successfully!');
  } catch {
    toast.error('Error deleting entities.');
  }
};