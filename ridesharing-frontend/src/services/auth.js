import api from './api';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

export const ridesApi = {
  create: (data) => api.post('/api/rides', data),
  search: (params) => api.get('/api/rides/search', { params }),
  getMyRides: () => api.get('/api/rides/my'),
  getById: (id) => api.get(`/api/rides/${id}`),
};
