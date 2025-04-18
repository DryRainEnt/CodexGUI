import axios from 'axios';
import useApiKeyStore from '../store/apiKeyStore';

// Create base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add API key from store
api.interceptors.request.use(
  (config) => {
    const apiKey = useApiKeyStore.getState().apiKey;
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
