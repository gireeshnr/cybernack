import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api';
import { toast } from 'react-hot-toast';

const API_URL =
  (process.env.REACT_APP_API_BASE_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '')) +
  '/subject';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Error fetching subjects.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const createSubject = createAsyncThunk(
  'subjects/createSubject',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeaders());
      toast.success('Subject created successfully!');
      return response.data;
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Error creating subject.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const updateSubject = createAsyncThunk(
  'subjects/updateSubject',
  async ({ id, subjectData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${id}`,
        subjectData,
        getAuthHeaders()
      );
      toast.success('Subject updated successfully!');
      return response.data;
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Error updating subject.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'subjects/deleteSubject',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      toast.success('Subject deleted successfully!');
      return id;
    } catch (error) {
      const errMsg =
        error.response?.data?.message || 'Error deleting subject.';
      toast.error(errMsg);
      return rejectWithValue(errMsg);
    }
  }
);

const subjectSlice = createSlice({
  name: 'subjects',
  initialState: { subjects: [], loading: false, error: null },
  reducers: {
    clearSubjectError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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