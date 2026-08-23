import axios from 'axios';

// Fetch base URL from Vite environment or default to local port 4000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: API_URL,
  timeout: 600000, // 10 minutes for multi-url scraper comparison calls
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token from localStorage if present
client.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('pricedekho_user');
      if (stored) {
        const { token } = JSON.parse(stored);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error('Error reading auth token from localStorage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized errors and force logout
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized. Logging out...');
      localStorage.removeItem('pricedekho_user');
      // Redirect to login page if window is defined (browser environment)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
