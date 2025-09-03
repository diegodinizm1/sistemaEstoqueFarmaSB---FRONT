// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '${VITE_API_BASE_URL}/api', // URL base da sua API
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}` // Token JWT
  }
});

export default api;