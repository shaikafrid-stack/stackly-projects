import api from './api';

export const userService = {
  getAll: (params) => api.get('/users', { params }),
};
