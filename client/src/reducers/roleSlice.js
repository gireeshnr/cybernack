// client/src/reducers/roleSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api';
import { toast } from 'react-hot-toast';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '')}/role`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    toast.error('Error fetching roles.');
    return rejectWithValue(error.message);
  }
});

export const createRole = createAsyncThunk('roles/createRole', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL, data, getAuthHeaders());
    toast.success('Role created successfully!');
    return response.data; // Ensure this returns the newly created role
  } catch (error) {
    if (error.response?.data?.message === 'A role with the same name already exists.') {
      return rejectWithValue({ message: error.response.data.message });
    }
    toast.error('Error creating role.');
    return rejectWithValue(error.message);
  }
});

export const updateRole = createAsyncThunk('roles/updateRole', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
    toast.success('Role updated successfully!');
    return response.data;
  } catch (error) {
    toast.error('Error updating role.');
    return rejectWithValue(error.message);
  }
});

export const deleteRole = createAsyncThunk('roles/deleteRole', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    toast.success('Role deleted successfully!');
    return id;
  } catch (error) {
    toast.error('Error deleting role.');
    return rejectWithValue(error.message);
  }
});

const roleSlice = createSlice({
  name: 'roles',
  initialState: { roles: [], loading: false, error: null },
  reducers: {
    clearRoleError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // CREATE
      .addCase(createRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload); // Add the new role to the state
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // DELETE
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRoleError } = roleSlice.actions;
export default roleSlice.reducer;