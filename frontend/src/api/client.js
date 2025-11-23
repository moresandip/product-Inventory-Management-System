const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchProducts() {
  const url = API_BASE_URL ? `${API_BASE_URL}/api/products` : '/api/products';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}
