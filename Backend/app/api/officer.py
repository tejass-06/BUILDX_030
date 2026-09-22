from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_officer
from app.models.user import User
from app.models.officer import Officer
from app.models.complaint import Complaint, ComplaintStatus
from app.models.notification import NotificationChannel
from app.schemas.complaint import ComplaintResponse, ComplaintDetailResponse
from app.schemas.officer import OfficerStatusUpdateRequest, OfficerAssignRequest
from app.core.config import settings
from app.api.complaints import format_complaint_response, format_complaint_detail
from app.services.storage_service import save_evidence_photo
from app.services.verification_service import submit_officer_resolution
from app.services.notification_service import create_notification
from app.services.audit_service import record_audit_log
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/officer", tags=["Officer Operations"])

def verify_officer_department_access(complaint: Complaint, current_user: User, officer: Optional[Officer]):
    if current_user.role != "ADMIN" and current_user.role != "COMMAND_CENTER":
        if not officer:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: No officer profile associated with your user account."
            )
        if complaint.department_id and officer.department_id != complaint.department_id and complaint.officer_id != officer.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: This grievance belongs to a different municipal department."
            )

@router.get("/complaints", response_model=List[ComplaintResponse])
def get_officer_complaints(
    status_filter: Optional[str] = None,
    auth_data: tuple[User, Optional[Officer]] = Depends(require_officer),
    db: Session = Depends(get_db)
):
    current_user, officer = auth_data
    query = db.query(Complaint)
    
    # If officer is tied to a department, filter to department's complaints
    if current_user.role != "ADMIN" and current_user.role != "COMMAND_CENTER":
        if officer and officer.department_id:
            query = query.filter(Complaint.department_id == officer.department_id)
        else:
            return []
        
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
        
    complaints = query.order_by(Complaint.created_at.desc()).all()
    return [format_complaint_response(c) for c in complaints]

@router.get("/complaints/{complaint_id}", response_model=ComplaintDetailResponse)
def get_officer_complaint_detail(
    complaint_id: str,
    auth_data: tuple[User, Optional[Officer]] = Depends(require_officer),
    db: Session = Depends(get_db)
):
    current_user, officer = auth_data
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    verify_officer_department_access(complaint, current_user, officer)

    return format_complaint_detail(complaint)

@router.patch("/complaints/{complaint_id}/assign", response_model=ComplaintResponse)
async def assign_complaint(
    complaint_id: str,
    payload: Optional[OfficerAssignRequest] = None,
    auth_data: tuple[User, Optional[Officer]] = Depends(require_officer),
    db: Session = Depends(get_db)
):
    current_user, officer = auth_data
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    verify_officer_department_access(complaint, current_user, officer)

    target_officer_id = payload.officer_id if (payload and payload.officer_id) else (officer.id if officer else None)
    prev_status = complaint.status
    complaint.officer_id = target_officer_id
    complaint.status = ComplaintStatus.ASSIGNED.value
    complaint.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(complaint)

    # Record Audit Log
    record_audit_log(
        db=db,
        action="ASSIGNED",
        complaint_id=complaint.id,
        public_id=complaint.public_id,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        previous_state=prev_status,
        new_state="ASSIGNED",
        details=f"Assigned to officer ID {target_officer_id}"
    )

    # Broadcast status change
    await ws_manager.broadcast_to_complaint(
        complaint_id=complaint.public_id,
        event="complaint_assigned",
        data={"complaint_id": complaint.id, "public_id": complaint.public_id, "officer_id": target_officer_id, "status": complaint.status}
    )

    return format_complaint_response(complaint)

@router.patch("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
async def update_complaint_status(
    complaint_id: str,
    payload: OfficerStatusUpdateRequest,
    auth_data: tuple[User, Optional[Officer]] = Depends(require_officer),
    db: Session = Depends(get_db)
):
    current_user, officer = auth_data
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    verify_officer_department_access(complaint, current_user, officer)

    prev_status = complaint.status
    complaint.status = payload.status.value
    complaint.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(complaint)

    # Record Audit Log
    action_type = "WORK_STARTED" if payload.status.value == ComplaintStatus.IN_PROGRESS.value else "STATUS_CHANGED"
    record_audit_log(
        db=db,
        action=action_type,
        complaint_id=complaint.id,
        public_id=complaint.public_id,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        previous_state=prev_status,
        new_state=complaint.status,
        details=payload.note or f"Status changed to {complaint.status}"
    )

    # Notify Citizen
    if complaint.citizen_id:
        await create_notification(
            db=db,
            user_id=complaint.citizen_id,
            complaint_id=complaint.id,
            notification_type="status_changed",
            title=f"Status Update: #{complaint.public_id}",
            body=f"Your complaint status is now '{complaint.status}'. Note: {payload.note or 'Work in progress'}",
            channel=NotificationChannel.WEB,
            broadcast_ws=True,
            ws_complaint_public_id=complaint.public_id
        )

    # Broadcast WebSocket
    await ws_manager.broadcast_to_complaint(
        complaint_id=complaint.public_id,
        event="status_changed",
        data={"complaint_id": complaint.id, "public_id": complaint.public_id, "status": complaint.status, "note": payload.note}
    )

    return format_complaint_response(complaint)

@router.post("/complaints/{complaint_id}/resolve", response_model=ComplaintDetailResponse)
async def resolve_complaint(
    complaint_id: str,
    resolution_note: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    after_photo: Optional[UploadFile] = File(None),
    auth_data: tuple[User, Optional[Officer]] = Depends(require_officer),
    db: Session = Depends(get_db)
):
    current_user, officer = auth_data
    if not officer:
        # If admin without officer record, grab or create default officer
        officer = db.query(Officer).first()
        if not officer:
            dept = db.query(Department).first()
            officer = Officer(user_id=current_user.id, department_id=dept.id if dept else 1, zone="Central", designation="Nodal Officer")
            db.add(officer)
            db.flush()

    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    verify_officer_department_access(complaint, current_user, officer)

    after_photo_url = None
    if after_photo and after_photo.filename:
        after_photo_url, _ = await save_evidence_photo(after_photo, bucket_name=settings.SUPABASE_STORAGE_BUCKET_RESOLUTIONS)

    await submit_officer_resolution(
        db=db,
        complaint=complaint,
        officer=officer,
        resolution_note=resolution_note,
        after_photo_url=after_photo_url,
        latitude=latitude,
        longitude=longitude
    )

    return format_complaint_detail(complaint)
