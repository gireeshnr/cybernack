// industrySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Base URL from environment variable (or fallback):
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${baseURL}/industry`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Thunks

// Fetch all industries
export const fetchIndustries = createAsyncThunk(
  'industries/fetchIndustries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      toast.error('Error fetching industries.');
      return rejectWithValue(error.message);
    }
  }
);

// Create a new industry
export const createIndustry = createAsyncThunk(
  'industries/createIndustry',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeaders());
      toast.success('Industry created!');
      return response.data;
    } catch (error) {
      toast.error('Error creating industry.');
      return rejectWithValue(error.message);
    }
  }
);

// Update an industry
export const updateIndustry = createAsyncThunk(
  'industries/updateIndustry',
  async ({ id, industryData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, industryData, getAuthHeaders());
      toast.success('Industry updated!');
      return response.data;
    } catch (error) {
      toast.error('Error updating industry.');
      return rejectWithValue(error.message);
    }
  }
);

// Delete an industry
export const deleteIndustry = createAsyncThunk(
  'industries/deleteIndustry',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      toast.success('Industry deleted!');
      return id;
    } catch (error) {
      toast.error('Error deleting industry.');
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const industrySlice = createSlice({
  name: 'industries',
  initialState: { industries: [], loading: false, error: null },
  reducers: {
    clearIndustriesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIndustries.fulfilled, (state, { payload }) => {
        state.industries = payload;
        state.loading = false;
      })
      .addCase(fetchIndustries.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Create
      .addCase(createIndustry.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIndustry.fulfilled, (state, { payload }) => {
        state.industries.push(payload);
        state.loading = false;
      })
      .addCase(createIndustry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Update
      .addCase(updateIndustry.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateIndustry.fulfilled, (state, { payload }) => {
        const index = state.industries.findIndex((i) => i._id === payload._id);
        if (index !== -1) {
          state.industries[index] = payload;
        }
        state.loading = false;
      })
      .addCase(updateIndustry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Delete
      .addCase(deleteIndustry.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteIndustry.fulfilled, (state, { payload }) => {
        state.industries = state.industries.filter((i) => i._id !== payload);
        state.loading = false;
      })
      .addCase(deleteIndustry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearIndustriesError } = industrySlice.actions;
export default industrySlice.reducer;