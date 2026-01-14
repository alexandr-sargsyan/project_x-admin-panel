import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена в заголовки
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Токен невалиден или нет прав - удаляем токен
      localStorage.removeItem('auth_token');
      // Редирект на логин будет обработан в компонентах
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (data) => {
  return api.post('/login', data);
};

export const getAdminMe = async () => {
  return api.get('/admin/me');
};

export const logout = async () => {
  localStorage.removeItem('auth_token');
};

// Video References API (Admin routes)
export const videoReferencesAPI = {
  getAll: () => api.get('/admin/video-references'),
  getById: (id) => api.get(`/admin/video-references/${id}`),
  search: (id, sourceUrl) => {
    const params = {};
    if (id) params.id = id;
    if (sourceUrl) params.source_url = sourceUrl;
    return api.get('/admin/video-references', { params });
  },
  create: (data) => api.post('/admin/video-references', data),
  update: (id, data) => api.put(`/admin/video-references/${id}`, data),
  delete: (id) => api.delete(`/admin/video-references/${id}`),
};

// Categories API (Admin routes)
export const categoriesAPI = {
  getAll: () => api.get('/admin/categories'),
  getById: (id) => api.get(`/admin/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
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

