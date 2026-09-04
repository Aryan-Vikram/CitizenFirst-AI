/**
 * Explainable AI Priority Score
 * -------------------------------------------------------------------------
 * Every case gets a transparent 0–100 score built from five weighted,
 * human-inspectable factors. The AI never makes an opaque "black box"
 * decision — every point is traceable to a reason, and a human can
 * override it. This mirrors the product principle in the master spec:
 * "Priority is calculated from transparent factors to support human
 * decision-making."
 *
 * Weights (sum to 100):
 *   Severity            30
 *   Citizens affected    25
 *   Location risk        20
 *   Duration open        15
 *   Report frequency     10
 */

const WEIGHTS = {
  severity: 30,
  citizensAffected: 25,
  locationRisk: 20,
  duration: 15,
  reportFrequency: 10
};

const SEVERITY_BASE = {
  Critical: 1,
  High: 0.8,
  Medium: 0.5,
  Low: 0.25
};

// Location-risk multipliers for context that raises real-world stakes.
// These are simple, inspectable rules — not a hidden model — by design.
const LOCATION_RISK_FACTORS = {
  near_school: 0.35,
  near_hospital: 0.3,
  main_arterial_road: 0.2,
  residential_dense: 0.15,
  default: 0.05
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scoreSeverity(severity) {
  const base = SEVERITY_BASE[severity] ?? 0.5;
  return Math.round(base * WEIGHTS.severity);
}

function scoreCitizensAffected(citizenReports, affectedPopulationEstimate) {
  // Diminishing returns curve so 1 report and 200 reports don't scale linearly
  // forever, but the difference between 1 and 30 reports is still large.
  const reportComponent = clamp(Math.log2(citizenReports + 1) / Math.log2(50), 0, 1);
  const populationComponent = clamp(Math.log2((affectedPopulationEstimate || 0) + 1) / Math.log2(2000), 0, 1);
  const combined = reportComponent * 0.65 + populationComponent * 0.35;
  return Math.round(combined * WEIGHTS.citizensAffected);
}

function scoreLocationRisk(locationTags = []) {
  if (!locationTags.length) {
    return Math.round(LOCATION_RISK_FACTORS.default * WEIGHTS.locationRisk / 0.05 * 0.2);
  }
  const factor = clamp(
    locationTags.reduce((sum, tag) => sum + (LOCATION_RISK_FACTORS[tag] ?? LOCATION_RISK_FACTORS.default), 0),
    0,
    1
  );
  return Math.round(factor * WEIGHTS.locationRisk);
}

function scoreDuration(ageInHours, slaHours = 72) {
  // Cases open longer than their SLA window score higher, capped at weight.
  const ratio = clamp(ageInHours / (slaHours || 72), 0, 1.5);
  return Math.round(clamp(ratio, 0, 1) * WEIGHTS.duration);
}

function scoreReportFrequency(reportsPerDay) {
  const component = clamp(Math.log2((reportsPerDay || 0) + 1) / Math.log2(15), 0, 1);
  return Math.round(component * WEIGHTS.reportFrequency);
}

/**
 * Compute a full, explainable priority score for a case.
 * @param {object} input
 * @param {'Critical'|'High'|'Medium'|'Low'} input.severity
 * @param {number} input.citizenReports
 * @param {number} input.affectedPopulationEstimate
 * @param {string[]} input.locationTags e.g. ['near_school','main_arterial_road']
 * @param {string|Date} input.firstReportedAt
 * @param {number} input.slaHours
 * @param {number} [input.reportsPerDay] override; otherwise derived from age & reports
 */
function computePriorityScore(input) {
  const {
    severity = 'Medium',
    citizenReports = 1,
    affectedPopulationEstimate = 0,
    locationTags = [],
    firstReportedAt,
    slaHours = 72
  } = input;

  const ageMs = firstReportedAt ? Date.now() - new Date(firstReportedAt).getTime() : 0;
  const ageInHours = Math.max(0, ageMs / (1000 * 60 * 60));
  const ageInDays = Math.max(ageInHours / 24, 0.25);
  const reportsPerDay = input.reportsPerDay ?? citizenReports / ageInDays;

  const factors = {
    severity: {
      points: scoreSeverity(severity),
      max: WEIGHTS.severity,
      reason: `Severity classified as ${severity}`
    },
    citizensAffected: {
      points: scoreCitizensAffected(citizenReports, affectedPopulationEstimate),
      max: WEIGHTS.citizensAffected,
      reason: `${citizenReports} citizen report(s), ~${affectedPopulationEstimate || 0} people estimated affected`
    },
    locationRisk: {
      points: scoreLocationRisk(locationTags),
      max: WEIGHTS.locationRisk,
      reason: locationTags.length
        ? `Location context: ${locationTags.join(', ').replace(/_/g, ' ')}`
        : 'No elevated location-risk context detected'
    },
    duration: {
      points: scoreDuration(ageInHours, slaHours),
      max: WEIGHTS.duration,
      reason: `Open for ${ageInHours.toFixed(1)}h against a ${slaHours}h SLA target`
    },
    reportFrequency: {
      points: scoreReportFrequency(reportsPerDay),
      max: WEIGHTS.reportFrequency,
      reason: `~${reportsPerDay.toFixed(1)} new report(s) per day`
    }
  };

  const total = Object.values(factors).reduce((sum, f) => sum + f.points, 0);

  return {
    score: clamp(total, 0, 100),
    factors,
    explanation: 'Priority is calculated from transparent, inspectable factors to support human decision-making. A department administrator can always override this score.',
    computedAt: new Date().toISOString()
  };
}

function priorityBand(score) {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
}

module.exports = {
  computePriorityScore,
  priorityBand,
  WEIGHTS
};
