from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from app.models.complaint import CivicCategory, PriorityLevel, SeverityLevel, ComplaintStatus, LocationSource
from app.schemas.auth import UserResponse

class ComplaintCreate(BaseModel):
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None

class ComplaintJoinRequest(BaseModel):
    description: Optional[str] = None

class ComplaintReportResponse(BaseModel):
    id: int
    complaint_id: int
    citizen_id: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    image_hash: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    citizen_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ResolutionResponse(BaseModel):
    id: int
    complaint_id: int
    officer_id: int
    resolution_note: str
    after_photo_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_match: bool
    scene_similarity: float
    repair_detected: bool
    ai_confidence: float
    ai_verified: bool
    created_at: datetime
    officer_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CitizenVerificationResponse(BaseModel):
    id: int
    complaint_id: int
    citizen_id: Optional[int] = None
    result: str
    rating: Optional[int] = None
    feedback: Optional[str] = None
    reopen_reason: Optional[str] = None
    created_at: datetime
    citizen_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ComplaintResponse(BaseModel):
    id: int
    public_id: str
    citizen_id: Optional[int] = None
    title: str
    description: str
    language: str
    category: str
    severity: str
    priority: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    location_source: str
    department_id: Optional[int] = None
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    officer_id: Optional[int] = None
    officer_name: Optional[str] = None
    officer_phone: Optional[str] = None
    officer_zone: Optional[str] = None
    officer_designation: Optional[str] = None
    status: str
    sla_hours: int
    sla_deadline: Optional[datetime] = None
    sla_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    image_url: Optional[str] = None
    reports_count: int = 1

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: int
    complaint_id: Optional[int] = None
    public_id: Optional[str] = None
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    role: Optional[str] = None
    action: str
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WhatsAppDeeplinkResponse(BaseModel):
    status: str = "WhatsApp Ready"
    label: str = "Open WhatsApp"
    recipient_phone: Optional[str] = None
    complaint_public_id: str
    deeplink: str
    message: str

class ComplaintDetailResponse(ComplaintResponse):
    reports: List[ComplaintReportResponse] = []
    resolutions: List[ResolutionResponse] = []
    verifications: List[CitizenVerificationResponse] = []
    audit_logs: List[AuditLogResponse] = []
    citizen: Optional[UserResponse] = None
