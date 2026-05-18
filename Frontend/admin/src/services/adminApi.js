import axios from 'axios';

const BASE = import.meta.env.VITE_ADMIN_API_BASE_URL;

const adminApi = axios.create({ baseURL: BASE });

// Attach admin JWT token to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default adminApi;
