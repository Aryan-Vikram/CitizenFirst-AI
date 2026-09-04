/**
 * Demonstration data for CitizenFirst AI.
 *
 * This file is intentionally the single source of truth for demo content
 * so that judges, developers and the in-memory store all see consistent,
 * clearly-labelled prototype data. Locations use real Maharashtra
 * coordinates; case numbers, citizen counts and timings are illustrative.
 */

const DEMO_DATA_LABEL = 'SIH 2026 prototype data — not live government records';

const cities = [
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lng: 73.7898 },
  { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  { name: 'Kolhapur', state: 'Maharashtra', lat: 16.705, lng: 74.2433 },
  { name: 'Navi Mumbai', state: 'Maharashtra', lat: 19.033, lng: 73.0297 },
  { name: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', lat: 19.8762, lng: 75.3433 }
];

const departments = [
  { code: 'MUN', name: 'Municipal Services', description: 'Water supply, drainage, waste management, civic amenities' },
  { code: 'ROAD', name: 'Road Infrastructure', description: 'Roads, potholes, footpaths, streetlights' },
  { code: 'WATER', name: 'Water Services', description: 'Piped water supply, leakage, quality' },
  { code: 'ELEC', name: 'Electricity', description: 'Power supply, transformers, street lighting faults' },
  { code: 'SAN', name: 'Sanitation', description: 'Garbage collection, sweeping, public toilets' },
  { code: 'SAFETY', name: 'Public Safety', description: 'Hazards, encroachments, safety infrastructure' }
];

const issueTypes = [
  { key: 'waterlogging', label: 'Waterlogging', primaryDept: 'MUN', secondaryDepts: ['ROAD', 'SAFETY'] },
  { key: 'road_damage', label: 'Road Damage', primaryDept: 'ROAD', secondaryDepts: ['SAFETY'] },
  { key: 'garbage', label: 'Garbage Accumulation', primaryDept: 'SAN', secondaryDepts: ['MUN'] },
  { key: 'streetlight', label: 'Broken Streetlight', primaryDept: 'ELEC', secondaryDepts: ['SAFETY'] },
  { key: 'water_leakage', label: 'Water Leakage', primaryDept: 'WATER', secondaryDepts: ['ROAD'] },
  { key: 'encroachment', label: 'Illegal Encroachment', primaryDept: 'SAFETY', secondaryDepts: ['MUN'] }
];

function jitter(base, spread) {
  return base + (Math.random() - 0.5) * spread;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const wardsByCity = {
  Pune: ['Ward 5', 'Ward 12', 'Ward 14', 'Ward 17', 'Ward 21'],
  Mumbai: ['Ward A', 'Ward F North', 'Ward K East', 'Ward M West'],
  Nagpur: ['Ward 3', 'Ward 9', 'Ward 15'],
  Nashik: ['Ward 2', 'Ward 8'],
  Thane: ['Ward 6', 'Ward 11'],
  Kolhapur: ['Ward 4', 'Ward 10'],
  'Navi Mumbai': ['Sector 12', 'Sector 20'],
  'Chhatrapati Sambhajinagar': ['Ward 7', 'Ward 13']
};

const STATUSES = [
  'Submitted',
  'AI Verified',
  'Routed',
  'Department Accepted',
  'Field Inspection',
  'Work in Progress',
  'Resolution Submitted',
  'AI Verification',
  'Resolved'
];

let caseCounter = 4821;

function nextCaseId(city) {
  const cityCode = {
    Mumbai: 'MUM',
    Pune: 'PUN',
    Nagpur: 'NAG',
    Nashik: 'NSK',
    Thane: 'THN',
    Kolhapur: 'KOL',
    'Navi Mumbai': 'NMB',
    'Chhatrapati Sambhajinagar': 'CSN'
  }[city] || 'MH';
  caseCounter += 1;
  return `CFAI-MH-${cityCode}-2026-${String(caseCounter).padStart(6, '0')}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function buildCase(overrides = {}) {
  const city = overrides.city || pick(cities);
  const issue = overrides.issue || pick(issueTypes);
  const ward = overrides.ward || pick(wardsByCity[city.name] || ['Ward 1']);
  const ageDays = overrides.ageDays ?? Math.floor(Math.random() * 12);
  const citizenReports = overrides.citizenReports ?? Math.floor(Math.random() * 15) + 1;
  const status = overrides.status || pick(STATUSES.slice(0, 6));

  const primaryDept = departments.find((d) => d.code === issue.primaryDept);
  const secondaryDepts = issue.secondaryDepts.map((c) => departments.find((d) => d.code === c));

  return {
    caseId: nextCaseId(city.name),
    title: `${issue.label} — ${ward}, ${city.name}`,
    issueType: issue.key,
    issueLabel: issue.label,
    description: overrides.description || `Citizen-reported ${issue.label.toLowerCase()} affecting the local area near ${ward}.`,
    city: city.name,
    ward,
    location: {
      lat: jitter(city.lat, 0.06),
      lng: jitter(city.lng, 0.06)
    },
    departments: [primaryDept.code, ...secondaryDepts.map((d) => d.code)],
    primaryDepartment: primaryDept.code,
    status,
    severity: overrides.severity || pick(['Critical', 'High', 'Medium', 'Low']),
    citizenReports,
    affectedPopulationEstimate: citizenReports * (Math.floor(Math.random() * 40) + 15),
    firstReportedAt: daysAgo(ageDays),
    lastUpdatedAt: daysAgo(Math.max(0, ageDays - Math.floor(Math.random() * ageDays))),
    slaHours: overrides.slaHours ?? 72,
    isDuplicateCluster: citizenReports > 5,
    timeline: [
      { stage: 'Submitted', at: daysAgo(ageDays), note: 'Citizen submitted request' },
      { stage: 'AI Verified', at: daysAgo(Math.max(0, ageDays - 0)), note: 'AI classified issue and extracted location' }
    ],
    evidence: [],
    demoData: true
  };
}

function generateDemoCases(count = 46) {
  const cases = [];
  // A few hand-authored "hero" cases used across the judge demo flow.
  cases.push(
    buildCase({
      city: cities[1], // Pune
      issue: issueTypes[0], // waterlogging
      ward: 'Ward 14',
      ageDays: 2,
      citizenReports: 32,
      status: 'Field Inspection',
      severity: 'Critical',
      description: 'Severe waterlogging near a school; adjoining road surface is also damaged, creating a safety hazard for children.',
      slaHours: 24
    })
  );
  cases.push(
    buildCase({
      city: cities[1],
      issue: issueTypes[1],
      ward: 'Ward 17',
      ageDays: 6,
      citizenReports: 27,
      status: 'Work in Progress',
      severity: 'High',
      description: 'Large pothole cluster causing traffic slowdowns and vehicle damage on the main arterial road.',
      slaHours: 72
    })
  );

  for (let i = 0; i < count; i += 1) {
    cases.push(buildCase());
  }
  return cases;
}

const demoUsers = [
  { name: 'Aisha Khan', email: 'citizen@demo.citizenfirst.ai', role: 'citizen', password: 'demo1234' },
  { name: 'Rahul Deshmukh', email: 'officer@demo.citizenfirst.ai', role: 'field_officer', department: 'ROAD', password: 'demo1234' },
  { name: 'Sunita Patil', email: 'dept.admin@demo.citizenfirst.ai', role: 'department_admin', department: 'MUN', password: 'demo1234' },
  { name: 'Vikram Rao', email: 'gov.admin@demo.citizenfirst.ai', role: 'government_admin', password: 'demo1234' }
];

module.exports = {
  DEMO_DATA_LABEL,
  cities,
  departments,
  issueTypes,
  wardsByCity,
  STATUSES,
  generateDemoCases,
  demoUsers,
  buildCase,
  nextCaseId
};
