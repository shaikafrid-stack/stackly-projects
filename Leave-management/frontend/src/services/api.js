import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  profile: () => api.get('/profile'),
};

export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const leaveAPI = {
  apply: (data) => api.post('/leave/apply', data),
  myLeaves: (params) => api.get('/leave/my', { params }),
  allLeaves: (params) => api.get('/leave/all', { params }),
  approve: (id) => api.put(`/leave/${id}/approve`),
  reject: (id) => api.put(`/leave/${id}/reject`),
};

export const assignAPI = {
  assign: (data) => api.post('/assign-project', data),
  getAll: () => api.get('/employee-projects'),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getEmployees: () => api.get('/users/employees'),
  delete: (id) => api.delete(`/users/${id}`),
};

export const dashboardAPI = {
  admin: () => api.get('/dashboard/admin'),
  manager: () => api.get('/dashboard/manager'),
  employee: () => api.get('/dashboard/employee'),
};

export default api;
