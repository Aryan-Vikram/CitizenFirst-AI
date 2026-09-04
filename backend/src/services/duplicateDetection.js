/**
 * Duplicate Intelligence
 * -------------------------------------------------------------------------
 * A lightweight, explainable similarity check: two reports are treated as
 * the same underlying issue when they share an issue type, sit within a
 * small geographic radius, and were filed within a short time window.
 * In production this is the seam where a real embedding-similarity model
 * (see /ai-service) would plug in — the interface stays identical.
 */

const EARTH_RADIUS_M = 6371000;

function haversineDistanceMeters(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_M * c;
}

const PROXIMITY_METERS = 400;
const TIME_WINDOW_HOURS = 72;

function findDuplicateCluster(candidateCase, existingCases) {
  const candidateTime = new Date(candidateCase.firstReportedAt || Date.now()).getTime();

  const matches = existingCases.filter((existing) => {
    if (existing.caseId === candidateCase.caseId) return false;
    if (existing.issueType !== candidateCase.issueType) return false;
    if (existing.city !== candidateCase.city) return false;

    const distance = haversineDistanceMeters(existing.location, candidateCase.location);
    if (distance > PROXIMITY_METERS) return false;

    const existingTime = new Date(existing.firstReportedAt).getTime();
    const hoursApart = Math.abs(candidateTime - existingTime) / (1000 * 60 * 60);
    if (hoursApart > TIME_WINDOW_HOURS) return false;

    return true;
  });

  if (!matches.length) {
    return { isDuplicate: false, masterCase: null, distanceMeters: null };
  }

  // Prefer consolidating into the oldest matching case (the "master").
  const master = matches.sort(
    (a, b) => new Date(a.firstReportedAt) - new Date(b.firstReportedAt)
  )[0];

  return {
    isDuplicate: true,
    masterCase: master,
    distanceMeters: Math.round(haversineDistanceMeters(master.location, candidateCase.location)),
    matchCount: matches.length
  };
}

module.exports = { findDuplicateCluster, haversineDistanceMeters };
