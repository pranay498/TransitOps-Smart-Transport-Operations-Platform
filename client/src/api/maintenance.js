import api from './api';

export const getMaintenance = (params = {}) => api.get('/maintenance', { params });
export const createMaintenance = (data) => api.post('/maintenance', data);
export const closeMaintenance = (id) => api.patch(`/maintenance/${id}/close`);
