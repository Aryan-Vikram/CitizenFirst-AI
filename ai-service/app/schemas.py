from typing import List, Optional
from pydantic import BaseModel, Field


class TextAnalysisRequest(BaseModel):
    description: str = Field(..., min_length=5)
    location_tags: List[str] = Field(default_factory=list)
    language: Optional[str] = "en"


class TextAnalysisResponse(BaseModel):
    issue_type: str
    issue_label: str
    confidence: float
    severity: str
    departments: List[str]
    primary_department: str
    cross_department: bool
    recommended_action: str
    is_mock_analysis: bool = True


class ImageAnalysisResponse(BaseModel):
    detected: str
    confidence: float
    severity: str
    potential_impact: str
    suggested_department: str
    priority_hint: int
    is_mock_analysis: bool = True
    notice: str


class PriorityFactor(BaseModel):
    points: int
    max: int
    reason: str


class PriorityScoreRequest(BaseModel):
    severity: str = "Medium"
    citizen_reports: int = 1
    affected_population_estimate: int = 0
    location_tags: List[str] = Field(default_factory=list)
    age_in_hours: float = 0
    sla_hours: float = 72


class PriorityScoreResponse(BaseModel):
    score: int
    factors: dict
    explanation: str


class SimilarityRequest(BaseModel):
    issue_type: str
    city: str
    lat: float
    lng: float
    candidate_lat: float
    candidate_lng: float
    candidate_issue_type: str
    candidate_city: str


class SimilarityResponse(BaseModel):
    is_duplicate: bool
    distance_meters: Optional[float]
    reasoning: str


class HotspotPoint(BaseModel):
    ward: str
    city: str
    issue_type: str
    daily_counts: List[int]


class HotspotResult(BaseModel):
    ward: str
    city: str
    issue_type: str
    trend_percent: float
    risk: str
    recommendation: str
