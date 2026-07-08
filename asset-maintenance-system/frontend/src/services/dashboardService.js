import api from './api';

export const dashboardService = {
  admin: () => api.get('/dashboard/admin'),
  maintenance: () => api.get('/dashboard/maintenance'),
  employee: () => api.get('/dashboard/employee'),
};
