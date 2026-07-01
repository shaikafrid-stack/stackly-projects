import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data) => API.post('/register', data);
export const login = (data) => API.post('/login', data);
export const getProfile = () => API.get('/profile');

// Tickets
export const getTickets = (params) => API.get('/tickets', { params });
export const getTicket = (id) => API.get(`/tickets/${id}`);
export const createTicket = (data) => API.post('/tickets', data);
export const updateTicket = (id, data) => API.put(`/tickets/${id}`, data);
export const deleteTicket = (id) => API.delete(`/tickets/${id}`);

// Comments
export const addComment = (id, data) => API.post(`/tickets/${id}/comment`, data);
export const getComments = (id) => API.get(`/tickets/${id}/comments`);

// SLA
export const getSLA = () => API.get('/sla');
export const updateSLA = (ticketId, data) => API.put(`/sla/${ticketId}`, data);

// Dashboard
export const getAdminDashboard = () => API.get('/dashboard/admin');
export const getAgentDashboard = () => API.get('/dashboard/agent');
export const getCustomerDashboard = () => API.get('/dashboard/customer');

// Users
export const getUsers = () => API.get('/users');
export const getAgents = () => API.get('/users/agents');
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

export default API;
