import api from './axios';

export const AuthAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  register: (payload) => api.post('/auth/register', payload)
};

export const DatasetAPI = {
  list: (params) => api.get('/datasets', { params }),
  get: (id) => api.get(`/datasets/${id}`),
  preview: (id, versionId) => api.get(`/datasets/${id}/preview`, { params: versionId ? { versionId } : {} })
};

export const TransformAPI = {
  addStep: (datasetId, payload) => api.post(`/datasets/${datasetId}/transform`, payload),
  listSteps: (datasetId) => api.get(`/datasets/${datasetId}/transformations`),
  updateStep: (stepId, payload) => api.put(`/transformations/${stepId}`, payload),
  deleteStep: (stepId) => api.delete(`/transformations/${stepId}`),
  reorder: (datasetId, orderedIds) => api.put(`/datasets/${datasetId}/transformations/reorder`, { orderedIds }),
  preview: (datasetId) => api.post(`/datasets/${datasetId}/transformations/preview`),
  validate: (datasetId, requiredColumns) => api.post(`/datasets/${datasetId}/validate`, { requiredColumns }),
  validationResults: (datasetId) => api.get(`/datasets/${datasetId}/validation-results`)
};

export const VersionAPI = {
  list: (datasetId) => api.get(`/datasets/${datasetId}/versions`),
  get: (datasetId, versionId) => api.get(`/datasets/${datasetId}/versions/${versionId}`),
  create: (datasetId, payload) => api.post(`/datasets/${datasetId}/versions`, payload),
  remove: (datasetId, versionId) => api.delete(`/datasets/${datasetId}/versions/${versionId}`)
};

export const HistoryAPI = {
  forDataset: (datasetId, params) => api.get(`/datasets/${datasetId}/history`, { params }),
  global: (params) => api.get('/history', { params })
};

export const DashboardAPI = {
  get: () => api.get('/dashboard/data-preparation')
};
