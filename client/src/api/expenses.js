import api from './api';

export const getExpenses = (params = {}) => api.get('/expenses', { params });
export const createExpense = (data) => api.post('/expenses', data);
