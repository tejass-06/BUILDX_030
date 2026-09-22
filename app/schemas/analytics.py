from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class AnalyticsOverviewResponse(BaseModel):
    total_complaints: int
    active_complaints: int
    resolved_complaints: int
    closed_complaints: int
    reopened_complaints: int
    sla_breached: int

class HotspotItem(BaseModel):
    area: str
    category: str
    complaint_count: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DepartmentAnalyticsItem(BaseModel):
    department: str
    department_code: str
    total: int
    resolved: int
    active: int
    sla_breached: int

class DepartmentWorkCreate(BaseModel):
    department_id: int
    title: str
    work_type: str
    latitude: float
    longitude: float
    start_date: datetime
    end_date: datetime
    status: Optional[str] = "SCHEDULED"

class DepartmentWorkResponse(BaseModel):
    id: int
    department_id: int
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    title: str
    work_type: str
    latitude: float
    longitude: float
    start_date: datetime
    end_date: datetime
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WorkConflictItem(BaseModel):
    work_1: DepartmentWorkResponse
    work_2: DepartmentWorkResponse
    distance_meters: float
    conflict_reason: str

class DepartmentConflictResponse(BaseModel):
    conflict_count: int
    conflicts: List[WorkConflictItem]
