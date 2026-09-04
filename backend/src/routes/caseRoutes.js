const express = require('express');
const {
  listCases,
  priorityQueue,
  getCase,
  createCase,
  updateStatus,
  addEvidence,
  submitFeedback
} = require('../controllers/caseController');
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/priority-queue', optionalAuth, priorityQueue);
router.get('/', optionalAuth, listCases);
router.get('/:caseId', optionalAuth, getCase);

router.post('/', optionalAuth, createCase); // citizens may report anonymously in the demo
router.patch(
  '/:caseId/status',
  requireAuth,
  requireRole('field_officer', 'department_admin', 'government_admin'),
  updateStatus
);
router.post(
  '/:caseId/evidence',
  requireAuth,
  requireRole('field_officer', 'department_admin'),
  addEvidence
);
router.post('/:caseId/feedback', optionalAuth, submitFeedback);

module.exports = router;
