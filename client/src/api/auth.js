import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const login = (email, password) =>
  axios.post(`${API_BASE}/auth/login`, { email, password });
