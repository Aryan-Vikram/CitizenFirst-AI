const asyncHandler = require('../utils/asyncHandler');
const store = require('../data/store');
const { departments: allDepartments } = require('../data/seedData');

// GET /api/analytics/overview — Command Center top stat cards.
const overview = asyncHandler(async (req, res) => {
  const cases = store.getCases({});
  const active = cases.filter((c) => !['Resolved'].includes(c.status));
  const critical = cases.filter((c) => c.priorityBand === 'Critical');
  const crossDept = cases.filter((c) => c.departments.length > 1);
  const resolved = cases.filter((c) => c.status === 'Resolved');
  const slaBreaches = cases.filter((c) => {
    const ageHours = (Date.now() - new Date(c.firstReportedAt).getTime()) / 36e5;
    return ageHours > c.slaHours && c.status !== 'Resolved';
  });

  res.json({
    totalCases: cases.length,
    activeCases: active.length,
    criticalCases: critical.length,
    crossDepartmentCases: crossDept.length,
    resolvedCases: resolved.length,
    slaBreaches: slaBreaches.length,
    demoNotice: 'Figures are demonstration data for the SIH 2026 prototype.'
  });
});

// GET /api/analytics/charts — series for the Analytics page.
const charts = asyncHandler(async (req, res) => {
  const cases = store.getCases({});

  // Cases over last 14 days (by firstReportedAt).
  const days = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const casesOverTime = days.map((day) => ({
    date: day,
    count: cases.filter((c) => c.firstReportedAt.slice(0, 10) === day).length
  }));

  const severityDistribution = ['Critical', 'High', 'Medium', 'Low'].map((s) => ({
    severity: s,
    count: cases.filter((c) => c.severity === s).length
  }));

  const departmentWorkload = allDepartments.map((d) => ({
    department: d.name,
    code: d.code,
    open: cases.filter((c) => c.departments.includes(d.code) && c.status !== 'Resolved').length,
    resolved: cases.filter((c) => c.departments.includes(d.code) && c.status === 'Resolved').length
  }));

  const resolvedCases = cases.filter((c) => c.status === 'Resolved');
  const resolutionRate = cases.length ? Math.round((resolvedCases.length / cases.length) * 100) : 0;

  const duplicateClusters = cases.filter((c) => c.isDuplicateCluster);
  const duplicateReduction = {
    totalRawReports: duplicateClusters.reduce((sum, c) => sum + c.citizenReports, 0),
    masterCases: duplicateClusters.length
  };

  const slaCompliant = cases.filter((c) => {
    const ageHours = (Date.now() - new Date(c.firstReportedAt).getTime()) / 36e5;
    return ageHours <= c.slaHours || c.status === 'Resolved';
  }).length;

  res.json({
    casesOverTime,
    severityDistribution,
    departmentWorkload,
    resolutionRate,
    avgResolutionTimeHours: 46,
    duplicateReduction,
    slaCompliancePercent: cases.length ? Math.round((slaCompliant / cases.length) * 100) : 100,
    citizenSatisfactionPercent: 81,
    demoNotice: 'Charts use demonstration data and are clearly not official government statistics.'
  });
});

module.exports = { overview, charts };
