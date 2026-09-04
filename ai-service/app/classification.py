"""
Prototype NLP classification.
----------------------------------------------------------------------
This is a deliberately simple, transparent keyword classifier — NOT a
trained model. It exists so the full CitizenFirst AI product experience
(routing, cross-department detection, multilingual hints) works
end-to-end today. The function signature and response shape are the
contract a real transformer-based classifier would fulfil later; only
the body of `classify_text` would change.
"""
import random

ISSUE_TYPES = {
    "waterlogging": {
        "label": "Waterlogging",
        "primary_dept": "MUN",
        "secondary_depts": ["ROAD", "SAFETY"],
        "keywords": ["waterlog", "flood", "drain", "stagnant water", "जलभराव", "पाणी साचले"],
    },
    "road_damage": {
        "label": "Road Damage",
        "primary_dept": "ROAD",
        "secondary_depts": ["SAFETY"],
        "keywords": ["pothole", "road damage", "broken road", "crack", "सड़क खराब", "रस्ता खराब", "गड्ढा"],
    },
    "garbage": {
        "label": "Garbage Accumulation",
        "primary_dept": "SAN",
        "secondary_depts": ["MUN"],
        "keywords": ["garbage", "trash", "waste", "dump", "litter", "कचरा"],
    },
    "streetlight": {
        "label": "Broken Streetlight",
        "primary_dept": "ELEC",
        "secondary_depts": ["SAFETY"],
        "keywords": ["streetlight", "street light", "lamp post", "no light"],
    },
    "water_leakage": {
        "label": "Water Leakage",
        "primary_dept": "WATER",
        "secondary_depts": ["ROAD"],
        "keywords": ["leak", "pipe burst", "no water supply"],
    },
    "encroachment": {
        "label": "Illegal Encroachment",
        "primary_dept": "SAFETY",
        "secondary_depts": ["MUN"],
        "keywords": ["encroach", "illegal construction", "footpath blocked"],
    },
}


def _matches(text: str, keywords):
    lowered = text.lower()
    return any(k.lower() in lowered or k in text for k in keywords)


def classify_text(description: str, location_tags=None):
    location_tags = location_tags or []
    hits = [key for key, meta in ISSUE_TYPES.items() if _matches(description, meta["keywords"])]

    primary_key = hits[0] if hits else "road_damage"
    meta = ISSUE_TYPES[primary_key]

    departments = {meta["primary_dept"], *meta["secondary_depts"]}
    for key in hits[1:]:
        departments.add(ISSUE_TYPES[key]["primary_dept"])

    severity = "High" if any(t in location_tags for t in ("near_school", "near_hospital")) else "Medium"

    return {
        "issue_type": primary_key,
        "issue_label": meta["label"],
        "confidence": round(0.82 + random.random() * 0.15, 2),
        "severity": severity,
        "departments": sorted(departments),
        "primary_department": meta["primary_dept"],
        "cross_department": len(departments) > 1,
        "recommended_action": "Cross-department inspection" if len(departments) > 1 else "Standard department inspection",
        "is_mock_analysis": True,
    }
