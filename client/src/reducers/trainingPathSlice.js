// client/src/reducers/trainingPathSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api';
import { toast } from 'react-hot-toast';

const API_URL =
  (process.env.REACT_APP_API_BASE_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8000'
      : '')) + '/training-path';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// FETCH
export const fetchTrainingPaths = createAsyncThunk(
  'trainingPath/fetchTrainingPaths',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      toast.error('Error fetching training paths.');
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// CREATE
export const createTrainingPath = createAsyncThunk(
  'trainingPath/createTrainingPath',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeaders());
      toast.success('Training path created successfully!');
      return response.data;
    } catch (error) {
      console.error('Error creating training path:', error);
      if (error.response && error.response.status === 400) {
        // likely a duplicate name error
        const msg = error.response.data?.message || 'A training path with the same name already exists.';
        toast.error(msg);
        return rejectWithValue(msg);
      }
      toast.error('Error creating training path.');
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// UPDATE
export const updateTrainingPath = createAsyncThunk(
  'trainingPath/updateTrainingPath',
  async ({ id, trainingPathData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, trainingPathData, getAuthHeaders());
      toast.success('Training path updated successfully!');
      return response.data;
    } catch (error) {
      console.error('Error updating training path:', error);
      if (error.response && error.response.status === 400) {
        // duplicate
        const msg = error.response.data?.message || 'A training path with the same name already exists.';
        toast.error(msg);
        return rejectWithValue(msg);
      }
      toast.error('Error updating training path.');
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// DELETE
export const deleteTrainingPath = createAsyncThunk(
  'trainingPath/deleteTrainingPath',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      toast.success('Training path deleted successfully!');
      return id;
    } catch (error) {
      console.error('Error deleting training path:', error);
      toast.error(error.response?.data?.message || 'Error deleting training path.');
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const trainingPathSlice = createSlice({
  name: 'trainingPath',
  initialState: { trainingPaths: [], loading: false, error: null },
  reducers: {
    clearTrainingPathError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingPaths.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrainingPaths.fulfilled, (state, action) => {
        state.loading = false;
        state.trainingPaths = action.payload;
      })
      .addCase(fetchTrainingPaths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTrainingPath.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTrainingPath.fulfilled, (state, action) => {
        state.loading = false;
        state.trainingPaths.push(action.payload);
      })
      .addCase(createTrainingPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTrainingPath.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTrainingPath.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trainingPaths.findIndex((tp) => tp._id === action.payload._id);
        if (index !== -1) {
          state.trainingPaths[index] = action.payload;
        }
      })
      .addCase(updateTrainingPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTrainingPath.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTrainingPath.fulfilled, (state, action) => {
        state.loading = false;
        state.trainingPaths = state.trainingPaths.filter((tp) => tp._id !== action.payload);
      })
      .addCase(deleteTrainingPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTrainingPathError } = trainingPathSlice.actions;
export default trainingPathSlice.reducer;