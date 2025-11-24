import axios from 'axios';
import { getMockData } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
});

// Add interceptor to handle errors and return mock data
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML (Netlify redirect) which indicates 404/API missing
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html>')) {
      console.warn('API returned HTML, falling back to mock data');
      return Promise.resolve({ data: getMockData(response.config.url, response.config.method) });
    }
    return response;
  },
  (error) => {
    console.warn('API call failed, falling back to mock data', error);
    if (error.config) {
      return Promise.resolve({ data: getMockData(error.config.url, error.config.method) });
    }
    return Promise.reject(error);
  }
);

export async function fetchProducts() {
  // Use the axios instance
  const response = await api.get('/products');
  return response.data;
}
