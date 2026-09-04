import { api } from './api.js';

export const departmentsService = {
  list: () => api.get('/departments'),
  workload: (code) => api.get(`/departments/${code}/workload`, { auth: true })
};
