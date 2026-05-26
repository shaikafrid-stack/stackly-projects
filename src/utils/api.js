import axios from 'axios';

const BASE_URL = 'https://fakestoreapi.com/products';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — log outgoing calls
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const productService = {
  /** Fetch all products */
  getAll: async () => {
    const { data } = await api.get('/');
    return data;
  },

  /** Fetch single product by id */
  getById: async (id) => {
    const { data } = await api.get(`/${id}`);
    return data;
  },

  /** Create a new product */
  create: async (product) => {
    const { data } = await api.post('/', product);
    return data;
  },

  /** Update a product */
  update: async (id, product) => {
    const { data } = await api.put(`/${id}`, product);
    return data;
  },

  /** Delete a product */
  remove: async (id) => {
    const { data } = await api.delete(`/${id}`);
    return data;
  },
};

export default api;
