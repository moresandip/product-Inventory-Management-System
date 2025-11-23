const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export default {
  fetchProducts,
};
