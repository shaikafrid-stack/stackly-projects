import client from './client';

export const listDatasets = (params) => client.get('/datasets', { params }).then((r) => r.data);
export const getDataset = (id) => client.get(`/datasets/${id}`).then((r) => r.data);
export const deleteDataset = (id) => client.delete(`/datasets/${id}`);
export const uploadDataset = (formData) =>
  client.post('/datasets/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
export const previewDataset = (id, limit = 20) => client.get(`/datasets/${id}/preview`, { params: { limit } }).then((r) => r.data);
export const getSchema = (id) => client.get(`/datasets/${id}/schema`).then((r) => r.data);
export const validateDataset = (id) => client.post(`/datasets/${id}/validate`).then((r) => r.data);
export const getValidationResults = (id) => client.get(`/datasets/${id}/validation-results`).then((r) => r.data);
export const processDataset = (id) => client.post(`/datasets/${id}/process`).then((r) => r.data);
export const getProcessingStatus = (id) => client.get(`/datasets/${id}/processing-status`).then((r) => r.data);
export const getDashboard = () => client.get('/dashboard/datasets').then((r) => r.data);
