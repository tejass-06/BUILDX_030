from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.complaint import Complaint, ComplaintStatus
from app.models.department import Department
from app.models.work import DepartmentWork
from app.services.ai_service import calculate_geo_distance
from app.services.sla_service import evaluate_sla_status

def get_analytics_overview(db: Session) -> Dict[str, int]:
    all_complaints = db.query(Complaint).all()
    
    total = len(all_complaints)
    resolved = sum(1 for c in all_complaints if c.status == ComplaintStatus.RESOLVED.value)
    closed = sum(1 for c in all_complaints if c.status == ComplaintStatus.CLOSED.value)
    reopened = sum(1 for c in all_complaints if c.status == ComplaintStatus.REOPENED.value)
    
    active = sum(1 for c in all_complaints if c.status in [
        ComplaintStatus.SUBMITTED.value,
        ComplaintStatus.ASSIGNED.value,
        ComplaintStatus.IN_PROGRESS.value,
        ComplaintStatus.CITIZEN_VERIFICATION.value,
        ComplaintStatus.REOPENED.value
    ])

    sla_breached_count = 0
    for c in all_complaints:
        if evaluate_sla_status(c.created_at, c.sla_hours, c.sla_deadline, c.status) == "BREACHED":
            sla_breached_count += 1

    return {
        "total_complaints": total,
        "active_complaints": active,
        "resolved_complaints": resolved,
        "closed_complaints": closed,
        "reopened_complaints": reopened,
        "sla_breached": sla_breached_count
    }

def get_analytics_hotspots(db: Session) -> List[Dict[str, Any]]:
    # Group by category and address / area
    complaints = db.query(Complaint).filter(Complaint.latitude.isnot(None)).all()
    if not complaints:
        # Fallback to all complaints grouping by address
        complaints = db.query(Complaint).all()

    hotspot_map: Dict[str, Dict[str, Any]] = {}
    for c in complaints:
        area_key = c.address or "Nagpur Central"
        group_key = f"{area_key}_{c.category}"
        if group_key not in hotspot_map:
            hotspot_map[group_key] = {
                "area": area_key,
                "category": c.category,
                "complaint_count": 0,
                "latitude": c.latitude,
                "longitude": c.longitude
            }
        hotspot_map[group_key]["complaint_count"] += 1

    result = list(hotspot_map.values())
    result.sort(key=lambda x: x["complaint_count"], reverse=True)
    return result

def get_department_analytics(db: Session) -> List[Dict[str, Any]]:
    departments = db.query(Department).all()
    results = []

    for dept in departments:
        dept_complaints = db.query(Complaint).filter(Complaint.department_id == dept.id).all()
        total = len(dept_complaints)
        resolved = sum(1 for c in dept_complaints if c.status in [ComplaintStatus.RESOLVED.value, ComplaintStatus.CLOSED.value])
        active = total - resolved
        
        sla_breached = 0
        for c in dept_complaints:
            if evaluate_sla_status(c.created_at, c.sla_hours, c.sla_deadline, c.status) == "BREACHED":
                sla_breached += 1

        results.append({
            "department": dept.name,
            "department_code": dept.code,
            "total": total,
            "resolved": resolved,
            "active": active,
            "sla_breached": sla_breached
        })

    return results

def detect_department_conflicts(db: Session, max_distance_meters: float = 200.0) -> List[Dict[str, Any]]:
    """
    Detects civic road/infrastructure conflicts:
    When two works from DIFFERENT departments overlap in time and are within < 200m distance.
    """
    works = db.query(DepartmentWork).filter(DepartmentWork.status.notin_(["COMPLETED", "CANCELLED"])).all()
    conflicts = []

    for i in range(len(works)):
        for j in range(i + 1, len(works)):
            w1 = works[i]
            w2 = works[j]

            # Only check different departments
            if w1.department_id == w2.department_id:
                continue

            # Check date overlap: (StartA <= EndB) and (EndA >= StartB)
            if not (w1.start_date <= w2.end_date and w1.end_date >= w2.start_date):
                continue

            dist = calculate_geo_distance(w1.latitude, w1.longitude, w2.latitude, w2.longitude)
            if dist is not None and dist <= max_distance_meters:
                conflicts.append({
                    "work_1": {
                        "id": w1.id,
                        "department_id": w1.department_id,
                        "department_name": w1.department.name if w1.department else "",
                        "department_code": w1.department.code if w1.department else "",
                        "title": w1.title,
                        "work_type": w1.work_type,
                        "latitude": w1.latitude,
                        "longitude": w1.longitude,
                        "start_date": w1.start_date,
                        "end_date": w1.end_date,
                        "status": w1.status,
                        "created_at": w1.created_at
                    },
                    "work_2": {
                        "id": w2.id,
                        "department_id": w2.department_id,
                        "department_name": w2.department.name if w2.department else "",
                        "department_code": w2.department.code if w2.department else "",
                        "title": w2.title,
                        "work_type": w2.work_type,
                        "latitude": w2.latitude,
                        "longitude": w2.longitude,
                        "start_date": w2.start_date,
                        "end_date": w2.end_date,
                        "status": w2.status,
                        "created_at": w2.created_at
                    },
                    "distance_meters": round(dist, 1),
                    "conflict_reason": f"Spatial-temporal overlap between {w1.department.name if w1.department else 'Dept 1'} ({w1.work_type}) and {w2.department.name if w2.department else 'Dept 2'} ({w2.work_type}) within {round(dist, 1)}m"
                })

    return conflicts
