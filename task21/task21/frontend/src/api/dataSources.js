import api from "./axios";

export const listDataSources = (params) => api.get("/data-sources", { params });
export const getDataSource = (id) => api.get(`/data-sources/${id}`);
export const createDataSource = (payload) => api.post("/data-sources", payload);
export const updateDataSource = (id, payload) => api.put(`/data-sources/${id}`, payload);
export const deleteDataSource = (id) => api.delete(`/data-sources/${id}`);
export const setStatus = (id, status) => api.patch(`/data-sources/${id}/status`, { status });
export const testConnection = (id) => api.post(`/data-sources/${id}/test`);
export const getHistory = (id) => api.get(`/data-sources/${id}/history`);
export const getCategories = () => api.get("/data-sources/meta/categories");

export const getAdminDashboard = () => api.get("/dashboard/admin");
export const getAnalystDashboard = () => api.get("/dashboard/analyst");
