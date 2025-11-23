import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
});

export async function fetchProducts() {
  // Use the axios instance
  const response = await api.get('/products');
  return response.data;
}
