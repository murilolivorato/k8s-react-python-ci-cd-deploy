// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';

// Mock axios
jest.mock('axios', () => {
  const mockAxios = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: {
      transformRequest: [],
      headers: {
        common: {}
      }
    },
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn()
      },
      response: {
        use: jest.fn(),
        eject: jest.fn()
      }
    }
  };
  return mockAxios;
});

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:8000';

// Create a mock store
const mockStore = configureStore({
  reducer: {
    auth: authReducer
  },
  preloadedState: {
    auth: {
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    }
  }
});

// Mock Redux store
jest.mock('./store', () => ({
  store: mockStore,
  clearError: jest.fn()
})); 