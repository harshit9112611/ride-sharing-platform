import api from './api';

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  verifyEmail: (token) => api.post('/api/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

export const ridesApi = {
  create: (data) => api.post('/api/rides', data),
  search: (params) => api.get('/api/rides/search', { params }),
  getAllAvailable: () => api.get('/api/rides/available'),
  getMyRides: () => api.get('/api/rides/my'),
  getById: (id) => api.get(`/api/rides/${id}`),
  remove: (id) => api.delete(`/api/rides/${id}`),
};

export const bookingsApi = {
  book: (rideId, seatsBooked) => api.post(`/api/rides/${rideId}/book`, { seatsBooked }),
  cancel: (bookingId) => api.delete(`/api/bookings/${bookingId}`),
  getMyBookings: () => api.get('/api/bookings/my'),
  received: (status = 'CONFIRMED') => api.get(`/api/bookings/received?status=${status}`),
};

export const vehiclesApi = {
  getMy: () => api.get('/api/vehicles/my'),
  add: (data) => api.post('/api/vehicles', data),
  update: (id, data) => api.put(`/api/vehicles/${id}`, data),
  remove: (id) => api.delete(`/api/vehicles/${id}`),
};

export const statsApi = {
  getPublic: () => api.get('/api/stats'),
};
