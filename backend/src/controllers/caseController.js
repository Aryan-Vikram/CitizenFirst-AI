const asyncHandler = require('../utils/asyncHandler');
const store = require('../data/store');
const { generateCaseId } = require('../services/caseIdGenerator');
const { findDuplicateCluster } = require('../services/duplicateDetection');
const { classifyRequest } = require('./aiController').internal;

// GET /api/cases  — supports filters used by the priority queue, My Requests,
// Department Dashboard and GIS map: status, city, department, severity, q
const listCases = asyncHandler(async (req, res) => {
  const { status, city, department, severity, q, sortBy } = req.query;
  let cases = store.getCases({ status, city, department, severity, q });

  if (sortBy === 'priority' || !sortBy) {
    cases = [...cases].sort((a, b) => b.priorityScore - a.priorityScore);
  } else if (sortBy === 'recent') {
    cases = [...cases].sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));
  } else if (sortBy === 'age') {
    cases = [...cases].sort((a, b) => new Date(a.firstReportedAt) - new Date(b.firstReportedAt));
  }

  res.json({ count: cases.length, cases });
});

// GET /api/cases/priority-queue — the Government Command Center's core view:
// open cases ranked by explainable priority score, banded for quick triage.
const priorityQueue = asyncHandler(async (req, res) => {
  const openStatuses = [
    'Submitted', 'AI Verified', 'Routed', 'Department Accepted', 'Field Inspection', 'Work in Progress'
  ];
  const cases = store
    .getCases({})
    .filter((c) => openStatuses.includes(c.status))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const bands = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  cases.forEach((c) => { bands[c.priorityBand] = (bands[c.priorityBand] || 0) + 1; });

  const slaBreaches = cases.filter((c) => {
    const ageHours = (Date.now() - new Date(c.firstReportedAt).getTime()) / 36e5;
    return ageHours > c.slaHours;
  }).length;

  res.json({
    generatedAt: new Date().toISOString(),
    totalOpen: cases.length,
    bands,
    slaBreaches,
    queue: cases.slice(0, 100)
  });
});

// GET /api/cases/:caseId — full case detail incl. timeline, for Case Tracking.
const getCase = asyncHandler(async (req, res) => {
  const record = store.getCaseById(req.params.caseId);
  if (!record) {
    return res.status(404).json({ error: `No case found with ID ${req.params.caseId}. Check the ID and try again.` });
  }
  res.json({ case: record });
});

// POST /api/cases — the citizen "Report a Request" submission endpoint.
// Runs AI understanding, duplicate detection, and department routing in one
// orchestrated flow, mirroring the master-spec citizen workflow.
const createCase = asyncHandler(async (req, res) => {
  const { description, city, ward, location, severityOverride, mediaType, locationTags, photoDataUrl } = req.body;

  if (!description || !city || !location) {
    return res.status(400).json({ error: 'A description, city, and location are required to submit a request.' });
  }

  // A citizen-attached photo is capped generously here; real deployments
  // would store this in object storage (S3/GCS) and save only the URL.
  if (photoDataUrl && photoDataUrl.length > 6_000_000) {
    return res.status(413).json({ error: 'That photo is too large. Please attach a smaller image.' });
  }

  const analysis = classifyRequest({ description, locationTags });

  const caseId = generateCaseId(city);
  const candidate = {
    caseId,
    title: `${analysis.issueLabel} — ${ward || city}`,
    description,
    issueType: analysis.issueType,
    issueLabel: analysis.issueLabel,
    city,
    ward: ward || null,
    location,
    locationTags: locationTags || [],
    departments: analysis.departments,
    primaryDepartment: analysis.primaryDepartment,
    severity: severityOverride || analysis.severity,
    affectedPopulationEstimate: analysis.affectedPopulationEstimate,
    slaHours: analysis.slaHours,
    reportedBy: req.user ? req.user.id : null,
    aiAnalysis: {
      detectedIssue: analysis.issueLabel,
      confidence: analysis.confidence,
      suggestedDepartment: analysis.primaryDepartment,
      relatedCases: 0,
      isMockAnalysis: true
    },
    evidence: photoDataUrl
      ? [{ type: 'photo', url: photoDataUrl, stage: 'before', uploadedAt: new Date().toISOString() }]
      : mediaType
      ? [{ type: mediaType, url: null, stage: 'general' }]
      : []
  };

  // Duplicate intelligence: does this match an existing open cluster?
  const existing = store.getCases({ status: undefined });
  const dup = findDuplicateCluster(
    { ...candidate, firstReportedAt: new Date().toISOString() },
    existing
  );

  if (dup.isDuplicate) {
    const master = store.attachDuplicateReport(dup.masterCase.caseId);
    return res.status(200).json({
      duplicate: true,
      message: `This matches an existing report ${dup.masterCase.caseId} nearby. Your report has been consolidated into that case instead of creating a duplicate.`,
      case: master,
      aiAnalysis: analysis
    });
  }

  const created = store.createCase(candidate);
  store.updateCaseStatus(created.caseId, 'AI Verified', 'AI classified issue and routed to department(s)', 'ai_system');
  store.updateCaseStatus(created.caseId, 'Routed', `Routed to ${analysis.departments.join(', ')}`, 'ai_system');

  store.createNotification({
    userId: req.user ? req.user.id : null,
    caseId: created.caseId,
    message: `Your request ${created.caseId} has been received and routed to ${analysis.primaryDepartment}.`,
    type: 'assigned'
  });

  res.status(201).json({ duplicate: false, case: store.getCaseById(created.caseId), aiAnalysis: analysis });
});

// PATCH /api/cases/:caseId/status — department/officer workflow actions.
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const allowed = [
    'Department Accepted', 'Field Inspection', 'Work in Progress',
    'Resolution Submitted', 'AI Verification', 'Resolved'
  ];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }
  const record = store.updateCaseStatus(req.params.caseId, status, note, req.user?.name || 'officer');
  if (!record) return res.status(404).json({ error: 'Case not found.' });

  store.createNotification({
    caseId: record.caseId,
    message:
      status === 'Resolved'
        ? `Your issue ${record.caseId} has been marked resolved. Please confirm whether it's actually fixed.`
        : `${record.caseId} status updated: ${status}.`,
    type: status === 'Resolved' ? 'confirm_resolution' : 'info_requested'
  });

  res.json({ case: record });
});

// POST /api/cases/:caseId/evidence — before/after verification photos.
const addEvidence = asyncHandler(async (req, res) => {
  const { type, url, stage } = req.body;
  if (!type || !stage) {
    return res.status(400).json({ error: 'Evidence type and stage are required.' });
  }
  const record = store.addEvidence(req.params.caseId, { type, url: url || null, stage });
  if (!record) return res.status(404).json({ error: 'Case not found.' });
  res.status(201).json({ case: record });
});

// POST /api/cases/:caseId/feedback — closes the citizen feedback loop.
const submitFeedback = asyncHandler(async (req, res) => {
  const { resolved, rating, comment } = req.body;
  if (!['yes', 'no', 'partially'].includes(resolved)) {
    return res.status(400).json({ error: "Feedback 'resolved' must be yes, no, or partially." });
  }
  const record = store.submitFeedback(req.params.caseId, { resolved, rating, comment });
  if (!record) return res.status(404).json({ error: 'Case not found.' });
  res.json({ case: record });
});

module.exports = {
  listCases,
  priorityQueue,
  getCase,
  createCase,
  updateStatus,
  addEvidence,
  submitFeedback
};
