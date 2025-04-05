import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api';
import { toast } from 'react-hot-toast';

const API_URL = (process.env.REACT_APP_API_BASE_URL || '') + '/domain';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchDomains = createAsyncThunk(
  'domains/fetchDomains',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error fetching domains.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const createDomain = createAsyncThunk(
  'domains/createDomain',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeaders());
      toast.success('Domain created successfully!');
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error creating domain.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const updateDomain = createAsyncThunk(
  'domains/updateDomain',
  async ({ id, domainData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, domainData, getAuthHeaders());
      toast.success('Domain updated successfully!');
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error updating domain.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const deleteDomain = createAsyncThunk(
  'domains/deleteDomain',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      toast.success('Domain deleted successfully!');
      return id;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error deleting domain.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

const domainSlice = createSlice({
  name: 'domains',
  initialState: { domains: [], loading: false, error: null },
  reducers: {
    clearDomainError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDomains.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDomains.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.domains = payload;
      })
      .addCase(fetchDomains.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createDomain.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDomain.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.domains.push(payload);
      })
      .addCase(createDomain.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateDomain.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDomain.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.domains.findIndex((d) => d._id === payload._id);
        if (index !== -1) {
          state.domains[index] = payload;
        }
      })
      .addCase(updateDomain.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteDomain.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDomain.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.domains = state.domains.filter((d) => d._id !== payload);
      })
      .addCase(deleteDomain.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearDomainError } = domainSlice.actions;
export default domainSlice.reducer;