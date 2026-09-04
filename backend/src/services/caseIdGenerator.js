const CITY_CODES = {
  Mumbai: 'MUM',
  Pune: 'PUN',
  Nagpur: 'NAG',
  Nashik: 'NSK',
  Thane: 'THN',
  Kolhapur: 'KOL',
  'Navi Mumbai': 'NMB',
  'Chhatrapati Sambhajinagar': 'CSN'
};

let counter = 5000 + Math.floor(Math.random() * 500);

/**
 * Generates a Universal Case ID: CFAI-MH-<CITY>-<YEAR>-<SEQ>
 * e.g. CFAI-MH-PUN-2026-004821
 */
function generateCaseId(city) {
  const code = CITY_CODES[city] || 'MH';
  const year = new Date().getFullYear();
  counter += 1;
  return `CFAI-MH-${code}-${year}-${String(counter).padStart(6, '0')}`;
}

module.exports = { generateCaseId, CITY_CODES };
