from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    HotspotItem,
    DepartmentAnalyticsItem
)
from app.services.analytics_service import (
    get_analytics_overview,
    get_analytics_hotspots,
    get_department_analytics
)

router = APIRouter(prefix="/analytics", tags=["Analytics & Governance"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_overview(db: Session = Depends(get_db)):
    data = get_analytics_overview(db)
    return AnalyticsOverviewResponse(**data)

@router.get("/hotspots", response_model=List[HotspotItem])
def get_hotspots(db: Session = Depends(get_db)):
    data = get_analytics_hotspots(db)
    return [HotspotItem(**item) for item in data]

@router.get("/departments", response_model=List[DepartmentAnalyticsItem])
def get_departments_analytics(db: Session = Depends(get_db)):
    data = get_department_analytics(db)
    return [DepartmentAnalyticsItem(**item) for item in data]
