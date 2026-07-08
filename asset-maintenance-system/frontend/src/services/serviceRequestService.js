import api from './api';

export const serviceRequestService = {
  getAll: (params) => api.get('/service-requests', { params }),
  getById: (id) => api.get(`/service-requests/${id}`),
  create: (data) => api.post('/service-requests', data),
  update: (id, data) => api.put(`/service-requests/${id}`, data),
  remove: (id) => api.delete(`/service-requests/${id}`),
};
