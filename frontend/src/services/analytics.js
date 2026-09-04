import { api } from './api.js';

export const analyticsService = {
  overview: () => api.get('/analytics/overview', { auth: true }),
  charts: () => api.get('/analytics/charts', { auth: true })
};
