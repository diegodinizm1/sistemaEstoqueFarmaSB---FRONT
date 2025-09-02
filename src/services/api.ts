// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // URL base da sua API
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}` // Token JWT
  }
});

export default api;