import api from './axios';

export const getDatasets = (params) => api.get('/datasets', { params });
export const getDataset = (id) => api.get(`/datasets/${id}`);
export const uploadDataset = (formData) =>
  api.post('/datasets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteDataset = (id) => api.delete(`/datasets/${id}`);

export const runProfiling = (id) => api.post(`/datasets/${id}/profile`);
export const getProfile = (id) => api.get(`/datasets/${id}/profile`);
export const getColumnProfiles = (id, params) => api.get(`/datasets/${id}/profile/columns`, { params });
export const getColumnProfile = (id, columnId) => api.get(`/datasets/${id}/profile/columns/${columnId}`);

export const getQualityResults = (id) => api.get(`/datasets/${id}/quality`);
export const getQualityIssues = (id, params) => api.get(`/datasets/${id}/quality/issues`, { params });

export const getDashboard = () => api.get('/dashboard/data-quality');

export const getQualityRules = () => api.get('/quality-rules');
export const createQualityRule = (payload) => api.post('/quality-rules', payload);
export const updateQualityRule = (id, payload) => api.put(`/quality-rules/${id}`, payload);
export const deleteQualityRule = (id) => api.delete(`/quality-rules/${id}`);
