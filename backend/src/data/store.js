/**
 * In-memory data store.
 * -------------------------------------------------------------------------
 * CitizenFirst AI's controllers talk to this module's interface
 * (getCases, createCase, updateCase, ...) rather than to Mongoose
 * directly. That indirection is deliberate: it lets the whole product —
 * citizen reporting, AI scoring, department routing, the Command Center —
 * run correctly with zero external setup for a demo or a judge, while
 * the /models directory documents the exact Mongoose schema a team would
 * swap in for production. Migrating later means changing this file's
 * internals, not the controllers or routes.
 */

const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const {
  departments: seedDepartments,
  demoUsers,
  generateDemoCases
} = require('./seedData');
const { computePriorityScore, priorityBand } = require('../services/priorityScoring');

const state = {
  cases: [],
  users: [],
  departments: [],
  notifications: []
};

function scoreAndStamp(caseRecord) {
  const result = computePriorityScore({
    severity: caseRecord.severity,
    citizenReports: caseRecord.citizenReports,
    affectedPopulationEstimate: caseRecord.affectedPopulationEstimate,
    locationTags: caseRecord.locationTags || [],
    firstReportedAt: caseRecord.firstReportedAt,
    slaHours: caseRecord.slaHours
  });
  caseRecord.priorityScore = result.score;
  caseRecord.priorityBand = priorityBand(result.score);
  caseRecord.priorityFactors = result.factors;
  return caseRecord;
}

function seed() {
  state.departments = seedDepartments.map((d) => ({
    ...d,
    id: uuid(),
    connectionStatus: 'connected',
    lastSyncAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 60000).toISOString(),
    isMockIntegration: true
  }));

  const demoCases = generateDemoCases(48);
  state.cases = demoCases.map((c) => scoreAndStamp({ id: uuid(), ...c }));

  state.users = demoUsers.map((u) => ({
    id: uuid(),
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department || null,
    passwordHash: bcrypt.hashSync(u.password, 8),
    preferredLanguage: 'en',
    accessibility: { highContrast: false, fontScale: 1, simpleLanguage: false }
  }));

  state.notifications = state.cases.slice(0, 6).map((c) => ({
    id: uuid(),
    userId: null,
    caseId: c.caseId,
    message: `Your request ${c.caseId} has been assigned.`,
    type: 'assigned',
    read: false,
    createdAt: new Date().toISOString()
  }));
}

seed();

// ---------- Cases ----------
function getCases(filters = {}) {
  let results = [...state.cases];
  if (filters.status) results = results.filter((c) => c.status === filters.status);
  if (filters.city) results = results.filter((c) => c.city === filters.city);
  if (filters.department) results = results.filter((c) => c.departments.includes(filters.department));
  if (filters.severity) results = results.filter((c) => c.severity === filters.severity);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter(
      (c) =>
        c.caseId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.issueLabel.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
    );
  }
  return results;
}

function getCaseById(caseId) {
  return state.cases.find((c) => c.caseId === caseId) || null;
}

function createCase(payload) {
  const record = scoreAndStamp({
    id: uuid(),
    caseId: payload.caseId,
    title: payload.title,
    description: payload.description,
    issueType: payload.issueType,
    issueLabel: payload.issueLabel,
    city: payload.city,
    ward: payload.ward,
    location: payload.location,
    locationTags: payload.locationTags || [],
    departments: payload.departments,
    primaryDepartment: payload.primaryDepartment,
    status: 'Submitted',
    severity: payload.severity || 'Medium',
    citizenReports: 1,
    affectedPopulationEstimate: payload.affectedPopulationEstimate || 40,
    isDuplicateCluster: false,
    linkedReportIds: [],
    masterCaseId: null,
    slaHours: payload.slaHours || 72,
    firstReportedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    reportedBy: payload.reportedBy || null,
    assignedOfficer: null,
    timeline: [
      { stage: 'Submitted', at: new Date().toISOString(), note: 'Citizen submitted request' }
    ],
    evidence: payload.evidence || [],
    aiAnalysis: payload.aiAnalysis || null,
    citizenFeedback: null,
    demoData: true
  });
  state.cases.unshift(record);
  return record;
}

function attachDuplicateReport(masterCaseId) {
  const master = getCaseById(masterCaseId);
  if (!master) return null;
  master.citizenReports += 1;
  master.affectedPopulationEstimate += Math.floor(Math.random() * 20) + 10;
  master.linkedReportIds.push(uuid());
  master.isDuplicateCluster = master.citizenReports > 1;
  master.lastUpdatedAt = new Date().toISOString();
  scoreAndStamp(master);
  return master;
}

function updateCaseStatus(caseId, status, note, actor) {
  const record = getCaseById(caseId);
  if (!record) return null;
  record.status = status;
  record.lastUpdatedAt = new Date().toISOString();
  record.timeline.push({ stage: status, at: new Date().toISOString(), note: note || '', actor: actor || 'system' });
  scoreAndStamp(record);
  return record;
}

function addEvidence(caseId, evidence) {
  const record = getCaseById(caseId);
  if (!record) return null;
  record.evidence.push({ ...evidence, uploadedAt: new Date().toISOString() });
  record.lastUpdatedAt = new Date().toISOString();
  return record;
}

function submitFeedback(caseId, feedback) {
  const record = getCaseById(caseId);
  if (!record) return null;
  record.citizenFeedback = { ...feedback, submittedAt: new Date().toISOString() };
  if (feedback.resolved === 'no') {
    record.status = 'Reopened';
    record.timeline.push({ stage: 'Reopened', at: new Date().toISOString(), note: 'Citizen reported issue not resolved' });
    scoreAndStamp(record);
  }
  return record;
}

function rescoreAll() {
  state.cases.forEach(scoreAndStamp);
  return state.cases;
}

// ---------- Departments ----------
function getDepartments() {
  return state.departments;
}

function getDepartmentWorkload(code) {
  const cases = state.cases.filter((c) => c.departments.includes(code));
  return {
    code,
    total: cases.length,
    critical: cases.filter((c) => c.priorityBand === 'Critical').length,
    high: cases.filter((c) => c.priorityBand === 'High').length,
    medium: cases.filter((c) => c.priorityBand === 'Medium').length,
    low: cases.filter((c) => c.priorityBand === 'Low').length,
    cases: cases.sort((a, b) => b.priorityScore - a.priorityScore)
  };
}

// ---------- Users ----------
function getUserByEmail(email) {
  return state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function getUserById(id) {
  return state.users.find((u) => u.id === id) || null;
}

function createUser({ name, email, password, role = 'citizen', department = null }) {
  if (getUserByEmail(email)) {
    throw new Error('An account with this email already exists.');
  }
  const user = {
    id: uuid(),
    name,
    email,
    role,
    department,
    passwordHash: bcrypt.hashSync(password, 8),
    preferredLanguage: 'en',
    accessibility: { highContrast: false, fontScale: 1, simpleLanguage: false }
  };
  state.users.push(user);
  return user;
}

// ---------- Notifications ----------
function getNotifications() {
  return [...state.notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function createNotification(payload) {
  const n = { id: uuid(), read: false, createdAt: new Date().toISOString(), ...payload };
  state.notifications.unshift(n);
  return n;
}

function markNotificationRead(id) {
  const n = state.notifications.find((x) => x.id === id);
  if (n) n.read = true;
  return n;
}

module.exports = {
  state,
  seed,
  scoreAndStamp,
  getCases,
  getCaseById,
  createCase,
  attachDuplicateReport,
  updateCaseStatus,
  addEvidence,
  submitFeedback,
  rescoreAll,
  getDepartments,
  getDepartmentWorkload,
  getUserByEmail,
  getUserById,
  createUser,
  getNotifications,
  createNotification,
  markNotificationRead
};
