import { render, screen } from '@testing-library/react';
import App from './App';

const mockGet = jest.fn((url) => {
  if (url === '/products/categories') {
    return Promise.resolve({ data: [] });
  }

  if (url === '/products') {
    return Promise.resolve({
      data: { products: [], pagination: { page: 1, pages: 0, limit: 10, total: 0 } },
    });
  }

  return Promise.resolve({ data: [] });
});

jest.mock('./api/client', () => ({
  get: (...args) => mockGet(...args),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({})),
}));

test('renders inventory title', async () => {
  render(<App />);
  expect(await screen.findByText(/Inventory Management/i)).toBeInTheDocument();
});
