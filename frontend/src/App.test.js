import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:8000';

// Mock authSlice
jest.mock('./store/slices/authSlice');

test('renders App component', () => {
  const { container } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(container).toBeInTheDocument();
}); 