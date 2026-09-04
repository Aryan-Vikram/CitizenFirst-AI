export const BAND_STYLES = {
  Critical: { text: 'text-critical', bg: 'bg-critical-soft', dot: 'bg-critical' },
  High: { text: 'text-high', bg: 'bg-high-soft', dot: 'bg-high' },
  Medium: { text: 'text-medium', bg: 'bg-medium-soft', dot: 'bg-medium' },
  Low: { text: 'text-low', bg: 'bg-low-soft', dot: 'bg-low' }
};

export function bandStyle(band) {
  return BAND_STYLES[band] || BAND_STYLES.Medium;
}

export const STATUS_ORDER = [
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

export function statusIndex(status) {
  const i = STATUS_ORDER.indexOf(status);
  return i === -1 ? 0 : i;
}

export const DEPARTMENT_NAMES = {
  MUN: 'Municipal Services',
  ROAD: 'Road Infrastructure',
  WATER: 'Water Services',
  ELEC: 'Electricity',
  SAN: 'Sanitation',
  SAFETY: 'Public Safety'
};
