"""
CitizenFirst AI — AI Service (Python / FastAPI)
=================================================================
Prototype/mock AI microservice for SIH26129. The Node/Express backend
already ships an equivalent in-process mock (backend/src/controllers/
aiController.js) so the full product runs with a single `npm run dev`.
This standalone service exists to satisfy the master-spec architecture
requirement ("keep the architecture ready for a real Python/FastAPI AI
service") and is the natural place to plug in real NLP/CV/similarity
models later — every endpoint here already matches the response shape
the frontend and backend expect.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8001
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.classification import classify_text
from app.priority import compute_priority_score, priority_band
from app.similarity import check_similarity
from app.anomaly import detect_trend
from app.schemas import (
    TextAnalysisRequest,
    TextAnalysisResponse,
    PriorityScoreRequest,
    PriorityScoreResponse,
    SimilarityRequest,
    SimilarityResponse,
)

app = FastAPI(
    title="CitizenFirst AI — AI Service",
    description="Prototype NLP / CV / similarity / anomaly-detection endpoints for SIH26129.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "citizenfirst-ai-ai-service",
        "notice": "SIH 2026 prototype AI service — mock NLP/CV models, not production-trained.",
    }


@app.post("/analyze-text", response_model=TextAnalysisResponse)
def analyze_text(payload: TextAnalysisRequest):
    result = classify_text(payload.description, payload.location_tags)
    return TextAnalysisResponse(
        issue_type=result["issue_type"],
        issue_label=result["issue_label"],
        confidence=result["confidence"],
        severity=result["severity"],
        departments=result["departments"],
        primary_department=result["primary_department"],
        cross_department=result["cross_department"],
        recommended_action=result["recommended_action"],
    )


@app.post("/analyze-image")
def analyze_image(issue_type_hint: str = "road_damage"):
    # A real deployment would run a CV model over the uploaded image.
    # This mock keeps the exact response contract the frontend consumes.
    from app.classification import ISSUE_TYPES
    import random

    meta = ISSUE_TYPES.get(issue_type_hint, ISSUE_TYPES["road_damage"])
    return {
        "detected": meta["label"],
        "confidence": round(0.88 + random.random() * 0.1, 2),
        "severity": "High",
        "potential_impact": "High",
        "suggested_department": meta["primary_dept"],
        "priority_hint": random.randint(80, 95),
        "is_mock_analysis": True,
        "notice": "Prototype computer-vision result — not a live-trained model.",
    }


@app.post("/priority-score", response_model=PriorityScoreResponse)
def priority_score(payload: PriorityScoreRequest):
    result = compute_priority_score(
        severity=payload.severity,
        citizen_reports=payload.citizen_reports,
        affected_population_estimate=payload.affected_population_estimate,
        location_tags=payload.location_tags,
        age_in_hours=payload.age_in_hours,
        sla_hours=payload.sla_hours,
    )
    return PriorityScoreResponse(score=result["score"], factors=result["factors"], explanation=result["explanation"])


@app.get("/priority-band/{score}")
def get_priority_band(score: int):
    if score < 0 or score > 100:
        raise HTTPException(status_code=400, detail="Score must be between 0 and 100.")
    return {"score": score, "band": priority_band(score)}


@app.post("/check-similarity", response_model=SimilarityResponse)
def check_similarity_endpoint(payload: SimilarityRequest):
    result = check_similarity(
        payload.issue_type,
        payload.city,
        payload.lat,
        payload.lng,
        payload.candidate_issue_type,
        payload.candidate_city,
        payload.candidate_lat,
        payload.candidate_lng,
    )
    return SimilarityResponse(**result)


@app.post("/detect-trend")
def detect_trend_endpoint(daily_counts: list[int]):
    return detect_trend(daily_counts)
