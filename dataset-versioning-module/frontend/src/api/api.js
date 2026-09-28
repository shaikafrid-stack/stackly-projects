import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dv_token');
      localStorage.removeItem('dv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  demoAccounts: () => api.get('/auth/demo-accounts'),
};

export const datasetApi = {
  list: () => api.get('/datasets'),
  get: (id) => api.get(`/datasets/${id}`),
  create: (payload) => api.post('/datasets', payload),
};

export const versionApi = {
  listForDataset: (datasetId) => api.get(`/datasets/${datasetId}/versions`),
  getDetails: (versionId) => api.get(`/versions/${versionId}`),
  create: (datasetId, payload) => api.post(`/datasets/${datasetId}/versions`, payload),
  compare: (versionA, versionB) => api.get('/versions/compare', { params: { versionA, versionB } }),
  restore: (versionId, restoredBy) => api.post(`/versions/${versionId}/restore`, { restoredBy }),
  updateStatus: (versionId, status, updatedBy) => api.patch(`/versions/${versionId}/status`, { status, updatedBy }),
};

export const changeHistoryApi = {
  forDataset: (datasetId) => api.get(`/datasets/${datasetId}/change-history`),
};

export const lineageApi = {
  forDataset: (datasetId) => api.get(`/datasets/${datasetId}/lineage`),
};

export const dashboardApi = {
  summary: () => api.get('/dashboard/summary'),
};

export default api;
