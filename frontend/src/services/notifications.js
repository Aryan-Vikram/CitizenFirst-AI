import { api } from './api.js';

export const notificationsService = {
  list: () => api.get('/notifications', { auth: true }),
  markRead: (id) => api.patch(`/notifications/${id}/read`, {}, { auth: true })
};
