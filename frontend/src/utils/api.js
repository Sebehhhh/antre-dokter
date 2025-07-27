import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const queueAPI = {
  getAvailableSlots: (date) => api.get(`/queue/available-slots?date=${date}`),
  bookQueue: (data) => api.post('/queue/book', data),
  getMyQueues: () => api.get('/queue/my-queues'),
  getCurrentQueue: () => api.get('/queue/current'),
  cancelQueue: (queueId) => api.patch(`/queue/cancel/${queueId}`),
  callNextQueue: () => api.post('/queue/call-next'),
  completeQueue: (queueId) => api.patch(`/queue/complete/${queueId}`),
  updateQueueStatus: (queueId, data) => api.patch(`/queue/update-status/${queueId}`, data),
  getQueuesByDate: (date) => api.get(`/queue/by-date?date=${date}`),
};

export const adminAPI = {
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  getRecentActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/activities${query ? `?${query}` : ''}`);
  },
  getActivityStats: (date) => api.get(`/admin/activities/stats?date=${date}`),
};

export default api;