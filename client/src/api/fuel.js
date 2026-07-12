import api from './api';

export const getFuelLogs = (params = {}) => api.get('/fuel-logs', { params });
export const createFuelLog = (data) => api.post('/fuel-logs', data);
