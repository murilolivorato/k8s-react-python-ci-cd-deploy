import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Use environment variable for API URL and ensure it uses HTTP
const API_URL = process.env.REACT_APP_API_URL;

// Enhanced debug logs
console.log('=== Environment Debug Info ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('Final API_URL:', API_URL);
console.log('Current window location:', window.location.href);
console.log('===========================');

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  // Force HTTP
  httpsAgent: null,
  httpAgent: null,
  // Prevent protocol rewrite
  transformRequest: [
    (data, headers) => {
      headers['X-Requested-With'] = 'XMLHttpRequest';
      return data;
    },
    ...axios.defaults.transformRequest,
  ],
});

// Intercept requests to ensure HTTP
api.interceptors.request.use((config) => {
  // Force HTTP
  if (config.url) {
    config.url = config.url.replace('https://', 'http://');
  }
  if (config.baseURL) {
    config.baseURL = config.baseURL.replace('https://', 'http://');
  }
  return config;
});

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Convert credentials to FormData format as required by FastAPI
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      // Force HTTP in the URL
      const loginUrl = '/api/auth/login'.replace('https://', 'http://');
      console.log('Making request to:', `${API_URL}${loginUrl}`); // Debug log

      const response = await api.post(loginUrl, formData);
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
});

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 