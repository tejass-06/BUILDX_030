from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_optional_current_user
from app.models.user import User, UserRole
from app.models.officer import Officer
from app.models.complaint import Complaint, ComplaintReport, ComplaintStatus
from app.models.department import Department
from app.schemas.complaint import (
    ComplaintResponse,
    ComplaintDetailResponse,
    ComplaintReportResponse,
    ResolutionResponse,
    CitizenVerificationResponse,
    AuditLogResponse,
    WhatsAppDeeplinkResponse
)
from app.core.config import settings
from app.schemas.verification import CitizenVerifyRequest, ComplaintReopenRequest
from app.schemas.auth import UserResponse
from app.services.complaint_service import create_complaint_workflow
from app.services.storage_service import save_evidence_photo
from app.services.exif_service import extract_exif_gps
from app.services.sla_service import evaluate_sla_status
from app.services.verification_service import process_citizen_verification
from app.services.audit_service import record_audit_log, get_complaint_audit_logs
from app.services.whatsapp_service import whatsapp_service
from app.models.resolution import VerificationResult
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def format_complaint_response(comp: Complaint) -> ComplaintResponse:
    first_report = comp.reports[0] if comp.reports else None
    img_url = first_report.image_url if first_report else None
    sla_stat = evaluate_sla_status(comp.created_at, comp.sla_hours, comp.sla_deadline, comp.status)
    
    officer_name = None
    officer_phone = None
    officer_zone = None
    officer_designation = None
    if comp.officer:
        officer_zone = comp.officer.zone
        officer_designation = comp.officer.designation
        if comp.officer.user:
            officer_name = comp.officer.user.name
            officer_phone = comp.officer.user.phone

    return ComplaintResponse(
        id=comp.id,
        public_id=comp.public_id,
        citizen_id=comp.citizen_id,
        title=comp.title,
        description=comp.description,
        language=comp.language,
        category=comp.category,
        severity=comp.severity,
        priority=comp.priority,
        latitude=comp.latitude,
        longitude=comp.longitude,
        address=comp.address,
        location_source=comp.location_source,
        department_id=comp.department_id,
        department_code=comp.department.code if comp.department else None,
        department_name=comp.department.name if comp.department else None,
        officer_id=comp.officer_id,
        officer_name=officer_name,
        officer_phone=officer_phone,
        officer_zone=officer_zone,
        officer_designation=officer_designation,
        status=comp.status,
        sla_hours=comp.sla_hours,
        sla_deadline=comp.sla_deadline,
        sla_status=sla_stat,
        created_at=comp.created_at,
        updated_at=comp.updated_at,
        image_url=img_url,
        reports_count=len(comp.reports)
    )

def format_complaint_detail(comp: Complaint) -> ComplaintDetailResponse:
    base = format_complaint_response(comp)
    
    reports_resp = []
    for r in comp.reports:
        reports_resp.append(ComplaintReportResponse(
            id=r.id,
            complaint_id=r.complaint_id,
            citizen_id=r.citizen_id,
            description=r.description,
            image_url=r.image_url,
            image_hash=r.image_hash,
            latitude=r.latitude,
            longitude=r.longitude,
            created_at=r.created_at,
            citizen_name=r.citizen.name if r.citizen else "Anonymous Citizen"
        ))

    resolutions_resp = []
    for res in comp.resolutions:
        resolutions_resp.append(ResolutionResponse(
            id=res.id,
            complaint_id=res.complaint_id,
            officer_id=res.officer_id,
            resolution_note=res.resolution_note,
            after_photo_url=res.after_photo_url,
            latitude=res.latitude,
            longitude=res.longitude,
            location_match=res.location_match,
            scene_similarity=res.scene_similarity,
            repair_detected=res.repair_detected,
            ai_confidence=res.ai_confidence,
            ai_verified=res.ai_verified,
            created_at=res.created_at,
            officer_name=res.officer.user.name if res.officer and res.officer.user else "Officer"
        ))

    verifications_resp = []
    for v in comp.verifications:
        verifications_resp.append(CitizenVerificationResponse(
            id=v.id,
            complaint_id=v.complaint_id,
            citizen_id=v.citizen_id,
            result=v.result,
            rating=v.rating,
            feedback=v.feedback,
            reopen_reason=v.reopen_reason,
            created_at=v.created_at,
            citizen_name=v.citizen.name if v.citizen else "Citizen"
        ))

    audit_logs_resp = []
    if hasattr(comp, "audit_logs") and comp.audit_logs:
        for al in comp.audit_logs:
            audit_logs_resp.append(AuditLogResponse(
                id=al.id,
                complaint_id=al.complaint_id,
                public_id=al.public_id or comp.public_id,
                user_id=al.user_id,
                user_name=al.user_name,
                role=al.role,
                action=al.action,
                previous_state=al.previous_state,
                new_state=al.new_state,
                details=al.details,
                created_at=al.created_at
            ))

    citizen_resp = None
    if comp.citizen:
        citizen_resp = UserResponse(
            id=comp.citizen.id,
            name=comp.citizen.name,
            email=comp.citizen.email,
            phone=comp.citizen.phone,
            role=comp.citizen.role,
            created_at=comp.citizen.created_at
        )

    return ComplaintDetailResponse(
        **base.model_dump(),
        reports=reports_resp,
        resolutions=resolutions_resp,
        verifications=verifications_resp,
        audit_logs=audit_logs_resp,
        citizen=citizen_resp
    )

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    complaint, metadata = await create_complaint_workflow(
        db=db,
        title=title,
        description=description,
        citizen=current_user,
        photo=photo,
        device_latitude=latitude,
        device_longitude=longitude,
        address=address
    )
    return format_complaint_response(complaint)

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    department_code: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)

    # 1. Strict Department & Role-Based Isolation
    if current_user:
        if current_user.role == UserRole.OFFICER.value:
            officer = db.query(Officer).filter(Officer.user_id == current_user.id).first()
            if officer and officer.department_id:
                query = query.filter(Complaint.department_id == officer.department_id)
            else:
                return []
        elif current_user.role == UserRole.CITIZEN.value:
            query = query.filter(Complaint.citizen_id == current_user.id)
        elif current_user.role in [UserRole.ADMIN.value, "COMMAND_CENTER"]:
            if department_code:
                dept = db.query(Department).filter(Department.code == department_code).first()
                if dept:
                    query = query.filter(Complaint.department_id == dept.id)
    else:
        if department_code:
            dept = db.query(Department).filter(Department.code == department_code).first()
            if dept:
                query = query.filter(Complaint.department_id == dept.id)

    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if category:
        query = query.filter(Complaint.category == category)
        
    complaints = query.order_by(Complaint.created_at.desc()).offset(offset).limit(limit).all()
    return [format_complaint_response(c) for c in complaints]

@router.get("/my", response_model=List[ComplaintResponse])
def get_my_complaints(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    complaints = db.query(Complaint).filter(Complaint.citizen_id == current_user.id).order_by(Complaint.created_at.desc()).all()
    return [format_complaint_response(c) for c in complaints]

@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
def get_complaint_detail(
    complaint_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    # Strict Department isolation check for officers
    if current_user and current_user.role == UserRole.OFFICER.value:
        officer = db.query(Officer).filter(Officer.user_id == current_user.id).first()
        if not officer or (complaint.department_id and officer.department_id != complaint.department_id and complaint.officer_id != officer.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: This grievance belongs to a different municipal department."
            )

    return format_complaint_detail(complaint)

@router.post("/{complaint_id}/join", response_model=ComplaintDetailResponse)
async def join_complaint(
    complaint_id: str,
    description: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    photo: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    image_url, image_hash = None, None
    if photo and photo.filename:
        image_url, photo_bytes = await save_evidence_photo(photo, bucket_name=settings.SUPABASE_STORAGE_BUCKET_COMPLAINTS)
        exif_info = extract_exif_gps(photo_bytes)
        image_hash = exif_info.get("image_hash")
        if exif_info.get("latitude") and not latitude:
            latitude = exif_info.get("latitude")
            longitude = exif_info.get("longitude")

    report = ComplaintReport(
        complaint_id=complaint.id,
        citizen_id=current_user.id,
        description=description or "Joined master complaint",
        image_url=image_url,
        image_hash=image_hash,
        latitude=latitude or complaint.latitude,
        longitude=longitude or complaint.longitude
    )
    db.add(report)
    db.commit()
    db.refresh(complaint)

    # Record Audit Log
    record_audit_log(
        db=db,
        action="CITIZEN_JOINED",
        complaint_id=complaint.id,
        public_id=complaint.public_id,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        details=f"Citizen joined complaint issue cluster (total reports: {len(complaint.reports)})"
    )

    # Broadcast event
    await ws_manager.broadcast_to_complaint(
        complaint_id=complaint.public_id,
        event="citizen_joined",
        data={"complaint_id": complaint.id, "citizen_name": current_user.name, "reports_count": len(complaint.reports)}
    )

    return format_complaint_detail(complaint)

@router.post("/{complaint_id}/verify", response_model=ComplaintDetailResponse)
async def verify_complaint(
    complaint_id: str,
    payload: CitizenVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    await process_citizen_verification(
        db=db,
        complaint=complaint,
        citizen=current_user,
        result=payload.result,
        rating=payload.rating,
        feedback=payload.feedback,
        reopen_reason=payload.reopen_reason
    )

    return format_complaint_detail(complaint)

@router.post("/{complaint_id}/reopen", response_model=ComplaintDetailResponse)
async def reopen_complaint(
    complaint_id: str,
    payload: ComplaintReopenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    await process_citizen_verification(
        db=db,
        complaint=complaint,
        citizen=current_user,
        result=VerificationResult.NOT_FIXED,
        feedback=payload.feedback,
        reopen_reason=payload.reason
    )

    return format_complaint_detail(complaint)

@router.get("/{complaint_id}/audit-logs", response_model=List[AuditLogResponse])
def get_complaint_audits(
    complaint_id: str,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    audits = get_complaint_audit_logs(db, complaint.id)
    return [
        AuditLogResponse(
            id=al.id,
            complaint_id=al.complaint_id,
            public_id=al.public_id or complaint.public_id,
            user_id=al.user_id,
            user_name=al.user_name,
            role=al.role,
            action=al.action,
            previous_state=al.previous_state,
            new_state=al.new_state,
            details=al.details,
            created_at=al.created_at
        )
        for al in audits
    ]

@router.get("/{complaint_id}/whatsapp-link", response_model=WhatsAppDeeplinkResponse)
def get_whatsapp_deeplink(
    complaint_id: str,
    action: Optional[str] = "STATUS_UPDATE",
    phone: Optional[str] = None,
    note: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if complaint_id.isdigit():
        complaint = query.filter((Complaint.id == int(complaint_id)) | (Complaint.public_id == complaint_id)).first()
    else:
        complaint = query.filter(Complaint.public_id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    officer_name = complaint.officer.user.name if (complaint.officer and complaint.officer.user) else None
    target_phone = phone or (complaint.citizen.phone if complaint.citizen else (complaint.officer.user.phone if complaint.officer and complaint.officer.user else None))

    link_data = whatsapp_service.generate_action_deeplink(
        complaint_public_id=complaint.public_id,
        status=complaint.status,
        category=complaint.category,
        recipient_phone=target_phone,
        officer_name=officer_name,
        note=note
    )

    return WhatsAppDeeplinkResponse(**link_data)
