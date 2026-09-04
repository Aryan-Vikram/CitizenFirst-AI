"""
Explainable priority scoring — Python mirror of
backend/src/services/priorityScoring.js so both services agree on how a
score is produced. Kept intentionally simple and inspectable rather than
a black-box model, per the product's transparency requirement.
"""
import math

WEIGHTS = {
    "severity": 30,
    "citizens_affected": 25,
    "location_risk": 20,
    "duration": 15,
    "report_frequency": 10,
}

SEVERITY_BASE = {"Critical": 1.0, "High": 0.8, "Medium": 0.5, "Low": 0.25}

LOCATION_RISK_FACTORS = {
    "near_school": 0.35,
    "near_hospital": 0.3,
    "main_arterial_road": 0.2,
    "residential_dense": 0.15,
}


def _clamp(value, lo, hi):
    return max(lo, min(hi, value))


def compute_priority_score(
    severity="Medium",
    citizen_reports=1,
    affected_population_estimate=0,
    location_tags=None,
    age_in_hours=0.0,
    sla_hours=72.0,
):
    location_tags = location_tags or []

    severity_points = round(SEVERITY_BASE.get(severity, 0.5) * WEIGHTS["severity"])

    report_component = _clamp(math.log2(citizen_reports + 1) / math.log2(50), 0, 1)
    population_component = _clamp(math.log2(affected_population_estimate + 1) / math.log2(2000), 0, 1)
    citizens_points = round((report_component * 0.65 + population_component * 0.35) * WEIGHTS["citizens_affected"])

    if location_tags:
        factor = _clamp(sum(LOCATION_RISK_FACTORS.get(t, 0.05) for t in location_tags), 0, 1)
    else:
        factor = 0.2
    location_points = round(factor * WEIGHTS["location_risk"])

    duration_ratio = _clamp(age_in_hours / (sla_hours or 72), 0, 1.5)
    duration_points = round(_clamp(duration_ratio, 0, 1) * WEIGHTS["duration"])

    reports_per_day = citizen_reports / max(age_in_hours / 24, 0.25)
    freq_component = _clamp(math.log2(reports_per_day + 1) / math.log2(15), 0, 1)
    freq_points = round(freq_component * WEIGHTS["report_frequency"])

    total = severity_points + citizens_points + location_points + duration_points + freq_points

    factors = {
        "severity": {"points": severity_points, "max": WEIGHTS["severity"], "reason": f"Severity classified as {severity}"},
        "citizensAffected": {
            "points": citizens_points,
            "max": WEIGHTS["citizens_affected"],
            "reason": f"{citizen_reports} citizen report(s), ~{affected_population_estimate} people estimated affected",
        },
        "locationRisk": {
            "points": location_points,
            "max": WEIGHTS["location_risk"],
            "reason": (", ".join(t.replace("_", " ") for t in location_tags) if location_tags else "No elevated location-risk context detected"),
        },
        "duration": {
            "points": duration_points,
            "max": WEIGHTS["duration"],
            "reason": f"Open for {age_in_hours:.1f}h against a {sla_hours:.0f}h SLA target",
        },
        "reportFrequency": {
            "points": freq_points,
            "max": WEIGHTS["report_frequency"],
            "reason": f"~{reports_per_day:.1f} new report(s) per day",
        },
    }

    return {
        "score": int(_clamp(total, 0, 100)),
        "factors": factors,
        "explanation": "Priority is calculated from transparent, inspectable factors to support human decision-making.",
    }


def priority_band(score: int) -> str:
    if score >= 80:
        return "Critical"
    if score >= 60:
        return "High"
    if score >= 35:
        return "Medium"
    return "Low"
