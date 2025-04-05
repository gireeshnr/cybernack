import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api';
import { toast } from 'react-hot-toast';

const API_URL =
  (process.env.REACT_APP_API_BASE_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '')) + '/industry';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

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

export const createIndustry = createAsyncThunk(
  'industries/createIndustry',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeaders());
      toast.success('Industry created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Error creating industry.');
      return rejectWithValue(error.message);
    }
  }
);

export const updateIndustry = createAsyncThunk(
  'industries/updateIndustry',
  async ({ id, industryData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, industryData, getAuthHeaders());
      toast.success('Industry updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Error updating industry.');
      return rejectWithValue(error.message);
    }
  }
);

export const deleteIndustry = createAsyncThunk(
  'industries/deleteIndustry',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      toast.success('Industry deleted successfully!');
      return id;
    } catch (error) {
      toast.error('Error deleting industry.');
      return rejectWithValue(error.message);
    }
  }
);

const industrySlice = createSlice({
  name: 'industries',
  initialState: { industries: [], loading: false, error: null },
  reducers: {
    clearIndustryError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndustries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIndustries.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.industries = payload;
      })
      .addCase(fetchIndustries.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createIndustry.pending, (state) => {
        state.loading = true;
      })
      .addCase(createIndustry.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.industries.push(payload);
      })
      .addCase(createIndustry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateIndustry.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateIndustry.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.industries.findIndex((ind) => ind._id === payload._id);
        if (index !== -1) {
          state.industries[index] = payload;
        }
      })
      .addCase(updateIndustry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteIndustry.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteIndustry.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.industries = state.industries.filter((ind) => ind._id !== payload);
      })
      .addCase(deleteIndustry.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearIndustryError } = industrySlice.actions;
export default industrySlice.reducer;