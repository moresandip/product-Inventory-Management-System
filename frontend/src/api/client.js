import axios from 'axios';

const normalizeBaseUrl = (url) => {
  if (!url) {
    return null;
  }
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const apiBase =
  normalizeBaseUrl(process.env.REACT_APP_API_BASE_URL) ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

const api = axios.create({
  baseURL: `${apiBase}/api`,
});

export default api;

