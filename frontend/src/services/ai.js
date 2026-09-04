import { api } from './api.js';

export const aiService = {
  analyzeText: (description, locationTags = []) => api.post('/ai/analyze-text', { description, locationTags }),
  analyzeImage: (issueTypeHint) => api.post('/ai/analyze-image', { issueTypeHint }),
  explainPriority: (caseId) => api.get(`/ai/priority-explain/${encodeURIComponent(caseId)}`, { auth: true }),
  hotspots: () => api.get('/ai/hotspots', { auth: true }),
  insights: () => api.get('/ai/insights', { auth: true })
};
