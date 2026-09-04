"""
Duplicate/similarity detection — a simple geographic + category proximity
check. This is the natural seam for a real embedding-similarity model
(e.g. sentence-transformers over the description text plus geo distance)
to replace this rule-based version without changing callers.
"""
import math

EARTH_RADIUS_M = 6371000
PROXIMITY_METERS = 400


def haversine_distance_meters(lat1, lng1, lat2, lng2):
    to_rad = math.radians
    d_lat = to_rad(lat2 - lat1)
    d_lng = to_rad(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_M * c


def check_similarity(issue_type, city, lat, lng, candidate_issue_type, candidate_city, candidate_lat, candidate_lng):
    if issue_type != candidate_issue_type or city != candidate_city:
        return {
            "is_duplicate": False,
            "distance_meters": None,
            "reasoning": "Different issue type or city — not treated as a duplicate.",
        }

    distance = haversine_distance_meters(lat, lng, candidate_lat, candidate_lng)
    is_dup = distance <= PROXIMITY_METERS
    reasoning = (
        f"Same issue type and city, {distance:.0f}m apart (within the {PROXIMITY_METERS}m threshold)."
        if is_dup
        else f"Same issue type and city, but {distance:.0f}m apart — outside the {PROXIMITY_METERS}m threshold."
    )
    return {"is_duplicate": is_dup, "distance_meters": round(distance, 1), "reasoning": reasoning}
