from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.complaint import ComplaintStatus

class OfficerAssignRequest(BaseModel):
    officer_id: Optional[int] = None

class OfficerStatusUpdateRequest(BaseModel):
    status: ComplaintStatus
    note: Optional[str] = None

class OfficerResolveRequest(BaseModel):
    resolution_note: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class OfficerResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    department_id: int
    department_name: str
    department_code: str
    zone: str
    designation: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
