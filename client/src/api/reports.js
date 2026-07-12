import api from './api';

export const getKpis = () => api.get('/dashboard/kpis');
export const getFuelEfficiency = () => api.get('/reports/fuel-efficiency');
export const getUtilization = () => api.get('/reports/utilization');
export const getOperationalCost = () => api.get('/reports/operational-cost');
export const getRoi = () => api.get('/reports/roi');
export const exportCsv = (report) => api.get(`/reports/export.csv?report=${report}`, { responseType: 'blob' });
