"""
Emerging-issue / hotspot detection.
----------------------------------------------------------------------
Given a short daily-count series for a ward + issue type, flags a
statistically simple but explainable trend: percentage growth over the
observed window plus an absolute-count risk band. A production version
could swap in a proper time-series anomaly detector (e.g. seasonal
decomposition + z-score) while keeping this exact response contract.
"""


def detect_trend(daily_counts):
    if not daily_counts or len(daily_counts) < 2:
        return {"trend_percent": 0.0, "risk": "Low", "recommendation": "Insufficient data"}

    first, last = daily_counts[0], daily_counts[-1]
    trend_percent = ((last - first) / first * 100) if first > 0 else (100.0 if last > 0 else 0.0)

    total_recent = sum(daily_counts[-3:]) if len(daily_counts) >= 3 else sum(daily_counts)

    if total_recent >= 25 or trend_percent >= 150:
        risk = "High"
        recommendation = "Preventive inspection"
    elif total_recent >= 10 or trend_percent >= 60:
        risk = "Medium"
        recommendation = "Monitor closely"
    else:
        risk = "Low"
        recommendation = "No action needed"

    return {"trend_percent": round(trend_percent, 1), "risk": risk, "recommendation": recommendation}
