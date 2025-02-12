import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Typically read from environment variables
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_URL = `${baseURL}/question`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_jwt_token');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// Thunks

// Fetch all questions
export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      return response.data;
    } catch (error) {
      toast.error('Error fetching questions.');
      return rejectWithValue(error.message);
    }
  }
);

// Create question
export const createQuestion = createAsyncThunk(
  'questions/createQuestion',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeaders());
      toast.success('Question created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Error creating question.');
      return rejectWithValue(error.message);
    }
  }
);

// Update question
export const updateQuestion = createAsyncThunk(
  'questions/updateQuestion',
  async ({ id, questionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, questionData, getAuthHeaders());
      toast.success('Question updated!');
      return response.data;
    } catch (error) {
      toast.error('Error updating question.');
      return rejectWithValue(error.message);
    }
  }
);

// Delete question
export const deleteQuestion = createAsyncThunk(
  'questions/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
      // We'll show a single toast in the UI for bulk deletes
      return id;
    } catch (error) {
      toast.error('Error deleting question.');
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    questions: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearQuestionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuestions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.questions = payload;
      })
      .addCase(fetchQuestions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Create
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuestion.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.questions.push(payload);
      })
      .addCase(createQuestion.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Update
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuestion.fulfilled, (state, { payload }) => {
        state.loading = false;
        const index = state.questions.findIndex((q) => q._id === payload._id);
        if (index !== -1) {
          state.questions[index] = payload;
        }
      })
      .addCase(updateQuestion.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Delete
      .addCase(deleteQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteQuestion.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.questions = state.questions.filter((q) => q._id !== payload);
      })
      .addCase(deleteQuestion.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearQuestionError } = questionSlice.actions;
export default questionSlice.reducer;
