import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${baseURL}/domain`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchDomains = createAsyncThunk('domains/fetchDomains', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    toast.error('Error fetching domains.');
    return rejectWithValue(error.message);
  }
});

export const createDomain = createAsyncThunk('domains/createDomain', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL, data, getAuthHeaders());
    toast.success('Domain created successfully!');
    return response.data;
  } catch (error) {
    toast.error('Error creating domain.');
    return rejectWithValue(error.message);
  }
});

export const updateDomain = createAsyncThunk(
  'domains/updateDomain',
  async ({ id, domainData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, domainData, getAuthHeaders());
      toast.success('Domain updated!');
      return response.data;
    } catch (error) {
      toast.error('Error updating domain.');
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDomain = createAsyncThunk('domains/deleteDomain', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    toast.success('Domain deleted!');
    return id;
  } catch (error) {
    toast.error('Error deleting domain.');
    return rejectWithValue(error.message);
  }
});

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
      // Fetch
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
      // Create
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
      // Update
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
      // Delete
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
