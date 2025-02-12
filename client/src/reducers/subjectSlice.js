import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Base URL
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${baseURL}/subject`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// Thunks

// Fetch all subjects
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      toast.error('Error fetching subjects.');
      return rejectWithValue(error.message);
    }
  }
);

// Create a new subject
export const createSubject = createAsyncThunk(
  'subjects/createSubject',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeaders());
      toast.success('Subject created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Error creating subject.');
      return rejectWithValue(error.message);
    }
  }
);

// Update a subject
export const updateSubject = createAsyncThunk(
  'subjects/updateSubject',
  async ({ id, subjectData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, subjectData, getAuthHeaders());
      toast.success('Subject updated!');
      return response.data;
    } catch (error) {
      toast.error('Error updating subject.');
      return rejectWithValue(error.message);
    }
  }
);

// Delete a subject
export const deleteSubject = createAsyncThunk(
  'subjects/deleteSubject',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      // Return the subject's _id so we can remove it from state
      return id;
    } catch (error) {
      toast.error('Error deleting subject.');
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const subjectSlice = createSlice({
  name: 'subjects',
  initialState: {
    subjects: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSubjectError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjects.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subjects = payload;
      })
      .addCase(fetchSubjects.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Create
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSubject.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subjects.push(payload);
      })
      .addCase(createSubject.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Update
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubject.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.subjects.findIndex((s) => s._id === payload._id);
        if (index !== -1) {
          state.subjects[index] = payload;
        }
      })
      .addCase(updateSubject.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Delete
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSubject.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.subjects = state.subjects.filter((s) => s._id !== payload);
      })
      .addCase(deleteSubject.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearSubjectError } = subjectSlice.actions;
export default subjectSlice.reducer;
