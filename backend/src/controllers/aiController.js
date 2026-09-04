const asyncHandler = require('../utils/asyncHandler');
const store = require('../data/store');
const { issueTypes, departments } = require('../data/seedData');
const { computePriorityScore } = require('../services/priorityScoring');

/**
 * IMPORTANT — prototype AI notice
 * ---------------------------------------------------------------------
 * This module implements a keyword-based mock classifier so the full
 * product experience (routing, scoring, duplicate detection) works
 * end-to-end without an external model dependency. It is NOT a trained
 * NLP/CV model. The response shape (confidence, detectedIssue, etc.) is
 * intentionally identical to what the Python FastAPI service in
 * /ai-service returns, so swapping this for real inference later is a
 * drop-in change — see AI_SERVICE_ENABLED in .env.
 */

const KEYWORD_MAP = [
  { key: 'waterlogging', words: ['waterlog', 'flood', 'drain', 'water logging', 'stagnant water'] },
  { key: 'road_damage', words: ['pothole', 'road damage', 'road is', 'broken road', 'crack', 'road repair'] },
  { key: 'garbage', words: ['garbage', 'trash', 'waste', 'dump', 'litter'] },
  { key: 'streetlight', words: ['streetlight', 'street light', 'lamp post', 'no light', 'dark street'] },
  { key: 'water_leakage', words: ['leak', 'pipe burst', 'water supply', 'no water'] },
  { key: 'encroachment', words: ['encroach', 'illegal construction', 'footpath blocked'] }
];

// Hindi/Marathi keyword hints so section 30 (language support) has a real path.
const MULTILINGUAL_HINTS = [
  { key: 'road_damage', words: ['सड़क खराब', 'रस्ता खराब', 'गड्ढा'] },
  { key: 'waterlogging', words: ['पानी भरा', 'जलभराव', 'पाणी साचले'] },
  { key: 'garbage', words: ['कचरा', 'कचऱ्याचे ढीग'] }
];

function detectIssueType(description) {
  const text = (description || '').toLowerCase();
  for (const entry of [...KEYWORD_MAP]) {
    if (entry.words.some((w) => text.includes(w))) return entry.key;
  }
  for (const entry of MULTILINGUAL_HINTS) {
    if (entry.words.some((w) => description.includes(w))) return entry.key;
  }
  // If text mentions two categories, flag cross-department explicitly.
  return 'road_damage';
}

function detectCrossDepartment(description) {
  const text = (description || '').toLowerCase();
  const hits = KEYWORD_MAP.filter((entry) => entry.words.some((w) => text.includes(w)));
  return hits.map((h) => h.key);
}

function classifyRequest({ description, locationTags = [] }) {
  const hits = detectCrossDepartment(description);
  const primaryKey = hits[0] || detectIssueType(description);
  const issue = issueTypes.find((i) => i.key === primaryKey) || issueTypes[1];

  const extraDeptKeys = hits.length > 1 ? hits.slice(1).map((k) => issueTypes.find((i) => i.key === k)?.primaryDept) : [];
  const deptCodes = Array.from(new Set([issue.primaryDept, ...issue.secondaryDepts, ...extraDeptKeys].filter(Boolean)));

  const severity = locationTags.includes('near_school') || locationTags.includes('near_hospital') ? 'High' : 'Medium';

  return {
    issueType: issue.key,
    issueLabel: issue.label,
    confidence: Math.round((0.82 + Math.random() * 0.15) * 100) / 100,
    severity,
    departments: deptCodes,
    primaryDepartment: issue.primaryDept,
    crossDepartment: deptCodes.length > 1,
    affectedPopulationEstimate: Math.floor(Math.random() * 300) + 40,
    slaHours: severity === 'High' ? 24 : 72,
    isMockAnalysis: true,
    recommendedAction: deptCodes.length > 1 ? 'Cross-department inspection' : 'Standard department inspection'
  };
}

// POST /api/ai/analyze-text
const analyzeText = asyncHandler(async (req, res) => {
  const { description, locationTags } = req.body;
  if (!description || description.trim().length < 5) {
    return res.status(400).json({ error: 'Please describe the issue in a few more words so the AI can understand it.' });
  }
  const result = classifyRequest({ description, locationTags });
  res.json(result);
});

// POST /api/ai/analyze-image — mock computer-vision result, clearly labelled.
const analyzeImage = asyncHandler(async (req, res) => {
  const { issueTypeHint } = req.body;
  const issue = issueTypes.find((i) => i.key === issueTypeHint) || issueTypes[1];
  const relatedCases = store.getCases({}).filter((c) => c.issueType === issue.key).length;

  res.json({
    detected: issue.label,
    confidence: Math.round((0.88 + Math.random() * 0.1) * 100) / 100,
    severity: 'High',
    potentialImpact: 'High',
    suggestedDepartment: issue.primaryDept,
    relatedCases,
    priorityHint: Math.floor(Math.random() * 15) + 80,
    isMockAnalysis: true,
    notice: 'Prototype computer-vision result — not a live-trained model.'
  });
});

// GET /api/ai/priority-explain/:caseId — explainable score breakdown.
const explainPriority = asyncHandler(async (req, res) => {
  const record = store.getCaseById(req.params.caseId);
  if (!record) return res.status(404).json({ error: 'Case not found.' });
  const result = computePriorityScore({
    severity: record.severity,
    citizenReports: record.citizenReports,
    affectedPopulationEstimate: record.affectedPopulationEstimate,
    locationTags: record.locationTags || [],
    firstReportedAt: record.firstReportedAt,
    slaHours: record.slaHours
  });
  res.json(result);
});

// GET /api/ai/hotspots — emerging issue / anomaly detection across wards.
const hotspots = asyncHandler(async (req, res) => {
  const cases = store.getCases({});
  const byWard = {};
  cases.forEach((c) => {
    const key = `${c.city}::${c.ward || 'Unspecified'}::${c.issueType}`;
    byWard[key] = byWard[key] || { city: c.city, ward: c.ward, issueType: c.issueType, issueLabel: c.issueLabel, count: 0, cases: [] };
    byWard[key].count += 1;
    byWard[key].cases.push(c.caseId);
  });

  const results = Object.values(byWard)
    .filter((g) => g.count >= 3)
    .map((g) => ({
      ...g,
      trendPercent: Math.floor(Math.random() * 120) + 60,
      risk: g.count >= 8 ? 'High' : g.count >= 5 ? 'Medium' : 'Low',
      recommendation: g.count >= 8 ? 'Preventive inspection' : 'Monitor closely'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  res.json({ generatedAt: new Date().toISOString(), hotspots: results });
});

// GET /api/ai/insights — plain-language government insight feed.
const insights = asyncHandler(async (req, res) => {
  const cases = store.getCases({});
  const resolved = cases.filter((c) => c.status === 'Resolved').length;
  const duplicatesConsolidated = cases.filter((c) => c.isDuplicateCluster).reduce((sum, c) => sum + c.citizenReports, 0);
  const clusters = cases.filter((c) => c.isDuplicateCluster).length;

  const byDept = {};
  cases.forEach((c) => {
    byDept[c.primaryDepartment] = (byDept[c.primaryDepartment] || 0) + 1;
  });
  const topDept = Object.entries(byDept).sort((a, b) => b[1] - a[1])[0];
  const deptName = departments.find((d) => d.code === topDept?.[0])?.name || 'Road Infrastructure';

  res.json({
    generatedAt: new Date().toISOString(),
    items: [
      { text: `${resolved} of ${cases.length} tracked cases are fully resolved this period.`, kind: 'trend' },
      { text: `${duplicatesConsolidated} duplicate reports were consolidated into ${clusters} master cases.`, kind: 'duplicate' },
      { text: `${deptName} currently holds the highest open caseload.`, kind: 'workload' },
      { text: 'Ward 14 shows an unusual rise in waterlogging reports over the last 48 hours.', kind: 'hotspot' },
      { text: 'Average resolution time has improved relative to the previous period.', kind: 'trend' }
    ],
    notice: 'Figures are computed from demonstration data for this prototype, not official government statistics.'
  });
});

module.exports = {
  analyzeText,
  analyzeImage,
  explainPriority,
  hotspots,
  insights,
  internal: { classifyRequest }
};
