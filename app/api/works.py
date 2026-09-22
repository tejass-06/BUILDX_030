from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, require_officer
from app.models.work import DepartmentWork
from app.models.department import Department
from app.models.user import User
from app.schemas.analytics import DepartmentWorkCreate, DepartmentWorkResponse, DepartmentConflictResponse, WorkConflictItem
from app.services.analytics_service import detect_department_conflicts

router = APIRouter(prefix="/works", tags=["Department Works & Conflict Resolution"])

@router.get("", response_model=List[DepartmentWorkResponse])
def list_department_works(db: Session = Depends(get_db)):
    works = db.query(DepartmentWork).order_by(DepartmentWork.start_date.desc()).all()
    results = []
    for w in works:
        results.append(DepartmentWorkResponse(
            id=w.id,
            department_id=w.department_id,
            department_name=w.department.name if w.department else "",
            department_code=w.department.code if w.department else "",
            title=w.title,
            work_type=w.work_type,
            latitude=w.latitude,
            longitude=w.longitude,
            start_date=w.start_date,
            end_date=w.end_date,
            status=w.status,
            created_at=w.created_at
        ))
    return results

@router.post("", response_model=DepartmentWorkResponse, status_code=status.HTTP_201_CREATED)
def create_department_work(
    payload: DepartmentWorkCreate,
    db: Session = Depends(get_db)
):
    dept = db.query(Department).filter(Department.id == payload.department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    work = DepartmentWork(
        department_id=payload.department_id,
        title=payload.title,
        work_type=payload.work_type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status or "SCHEDULED",
        created_at=datetime.now(timezone.utc)
    )
    db.add(work)
    db.commit()
    db.refresh(work)

    return DepartmentWorkResponse(
        id=work.id,
        department_id=work.department_id,
        department_name=dept.name,
        department_code=dept.code,
        title=work.title,
        work_type=work.work_type,
        latitude=work.latitude,
        longitude=work.longitude,
        start_date=work.start_date,
        end_date=work.end_date,
        status=work.status,
        created_at=work.created_at
    )

@router.get("/conflicts", response_model=DepartmentConflictResponse)
def get_work_conflicts(max_distance_meters: float = 200.0, db: Session = Depends(get_db)):
    conflicts_data = detect_department_conflicts(db, max_distance_meters=max_distance_meters)
    
    conflict_items = []
    for c in conflicts_data:
        conflict_items.append(WorkConflictItem(
            work_1=DepartmentWorkResponse(**c["work_1"]),
            work_2=DepartmentWorkResponse(**c["work_2"]),
            distance_meters=c["distance_meters"],
            conflict_reason=c["conflict_reason"]
        ))
        
    return DepartmentConflictResponse(
        conflict_count=len(conflict_items),
        conflicts=conflict_items
    )
