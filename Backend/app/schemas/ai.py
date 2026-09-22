from typing import Optional, Dict, List
from pydantic import BaseModel, ConfigDict

class AIAnalyzeRequest(BaseModel):
    title: Optional[str] = ""
    description: str

class AIAnalyzeResponse(BaseModel):
    language: str
    category: str
    summary: str
    severity: str
    priority: str
    responsible_department: str
    suggested_sla_hours: int
    reason: str
    keywords: Optional[List[str]] = []
    ai_provider: Optional[str] = "OLLAMA"
    model_used: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DuplicateSignals(BaseModel):
    photo: float
    location: float
    text: float
    time: float

class AIDuplicateCheckRequest(BaseModel):
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_hash: Optional[str] = None
    category: Optional[str] = None

class AIDuplicateCheckResponse(BaseModel):
    is_duplicate: bool
    duplicate_score: float
    matched_complaint_id: Optional[str] = None
    signals: Optional[DuplicateSignals] = None

    model_config = ConfigDict(from_attributes=True)

class AIVerifyResolutionRequest(BaseModel):
    before_photo_url: Optional[str] = None
    after_photo_url: Optional[str] = None
    complaint_latitude: Optional[float] = None
    complaint_longitude: Optional[float] = None
    resolution_latitude: Optional[float] = None
    resolution_longitude: Optional[float] = None

class AIVerifyResolutionResponse(BaseModel):
    location_match: bool
    scene_similarity: float
    repair_detected: bool
    confidence: float

    model_config = ConfigDict(from_attributes=True)
