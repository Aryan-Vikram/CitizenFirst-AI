import { api } from './api.js';

export const casesService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '')).toString();
    return api.get(`/cases${qs ? `?${qs}` : ''}`, { auth: true });
  },
  priorityQueue: () => api.get('/cases/priority-queue', { auth: true }),
  get: (caseId) => api.get(`/cases/${encodeURIComponent(caseId)}`, { auth: true }),
  create: (payload) => api.post('/cases', payload, { auth: true }),
  updateStatus: (caseId, status, note) =>
    api.patch(`/cases/${encodeURIComponent(caseId)}/status`, { status, note }, { auth: true }),
  addEvidence: (caseId, evidence) =>
    api.post(`/cases/${encodeURIComponent(caseId)}/evidence`, evidence, { auth: true }),
  submitFeedback: (caseId, feedback) =>
    api.post(`/cases/${encodeURIComponent(caseId)}/feedback`, feedback, { auth: true })
};
