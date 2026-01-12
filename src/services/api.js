import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Video References API
export const videoReferencesAPI = {
  getAll: () => api.get('/video-references'),
  getById: (id) => api.get(`/video-references/${id}`),
  search: (id, sourceUrl) => {
    const params = {};
    if (id) params.id = id;
    if (sourceUrl) params.source_url = sourceUrl;
    return api.get('/video-references', { params });
  },
  create: (data) => api.post('/video-references', data),
  update: (id, data) => api.put(`/video-references/${id}`, data),
  delete: (id) => api.delete(`/video-references/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
};

// Tutorials API
export const tutorialsAPI = {
  getAll: () => api.get('/tutorials'),
};

export default api;

