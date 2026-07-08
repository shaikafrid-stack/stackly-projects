import api from './api';

export const maintenanceService = {
  getAll: (params) => api.get('/maintenance-logs', { params }),
  create: (data) => api.post('/maintenance-logs', data),
};
