import os
import uuid
from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, Any, List
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.complaint import Complaint, ComplaintReport, ComplaintStatus, LocationSource, CivicCategory, PriorityLevel, SeverityLevel
from app.models.department import Department
from app.models.officer import Officer
from app.models.user import User
from app.models.notification import NotificationChannel
from app.services.exif_service import extract_exif_gps, resolve_location
from app.services.ai_service import analyze_complaint_ai
from app.services.duplicate_service import check_duplicate_complaint
from app.services.sla_service import compute_sla_deadline, evaluate_sla_status
from app.services.notification_service import create_notification
from app.services.storage_service import save_evidence_photo
from app.services.officer_service import assign_officer_auto
from app.services.whatsapp_service import whatsapp_service
from app.services.audit_service import record_audit_log
from app.websocket.manager import ws_manager

async def save_uploaded_file(file: UploadFile) -> Tuple[str, bytes]:
    """Compatibility wrapper delegating to save_evidence_photo."""
    return await save_evidence_photo(file, bucket_name=settings.SUPABASE_STORAGE_BUCKET_COMPLAINTS)

def generate_public_id(db: Session) -> str:
    count = db.query(Complaint).count()
    return f"NS-{1001 + count}"

async def create_complaint_workflow(
    db: Session,
    title: str,
    description: str,
    citizen: Optional[User] = None,
    photo: Optional[UploadFile] = None,
    device_latitude: Optional[float] = None,
    device_longitude: Optional[float] = None,
    address: Optional[str] = None
) -> Tuple[Complaint, Dict[str, Any]]:
    """
    Executes the golden path complaint submission workflow.
    """
    image_url = None
    image_hash = None
    exif_lat, exif_lng, exif_source = None, None, None

    if photo and photo.filename:
        image_url, photo_bytes = await save_uploaded_file(photo)
        exif_info = extract_exif_gps(photo_bytes)
        exif_lat = exif_info.get("latitude")
        exif_lng = exif_info.get("longitude")
        exif_source = exif_info.get("source")
        image_hash = exif_info.get("image_hash")

    # 1. Location Resolution with strict priority: PHOTO_EXIF > DEVICE_GPS > MANUAL
    final_lat, final_lng, loc_source = resolve_location(
        exif_lat=exif_lat,
        exif_lng=exif_lng,
        device_lat=device_latitude,
        device_lng=device_longitude,
        address=address
    )

    # 2. AI Complaint Understanding
    ai_result = await analyze_complaint_ai(title, description)
    category = ai_result.get("category", CivicCategory.OTHER.value)
    severity = ai_result.get("severity", SeverityLevel.MEDIUM.value)
    priority = ai_result.get("priority", PriorityLevel.MEDIUM.value)
    dept_code = ai_result.get("responsible_department", "OTHER")
    sla_hours = ai_result.get("suggested_sla_hours", 48)
    language = ai_result.get("language", "en")

    # 3. Department Routing
    department = db.query(Department).filter(Department.code == dept_code).first()
    if not department:
        department = db.query(Department).filter(Department.code == "OTHER").first()
    dept_id = department.id if department else None

    # 4. Duplicate Detection Check
    dup_result = check_duplicate_complaint(
        db=db,
        title=title,
        description=description,
        latitude=final_lat,
        longitude=final_lng,
        image_hash=image_hash,
        category=category
    )

    # 5. SLA Calculation
    now = datetime.now(timezone.utc)
    sla_deadline = compute_sla_deadline(now, sla_hours)

    # 6. Officer Auto-Assignment (Smart zone & workload based)
    assigned_officer = None
    assignment_meta = {}
    status = ComplaintStatus.SUBMITTED.value
    if dept_id:
        assigned_officer, assignment_meta = assign_officer_auto(
            db=db,
            department_id=dept_id,
            latitude=final_lat,
            longitude=final_lng,
            address=address
        )
        if assigned_officer:
            status = ComplaintStatus.ASSIGNED.value

    public_id = generate_public_id(db)

    # 7. Create Master Complaint
    complaint = Complaint(
        public_id=public_id,
        citizen_id=citizen.id if citizen else None,
        title=title,
        description=description,
        language=language,
        category=category,
        severity=severity,
        priority=priority,
        latitude=final_lat,
        longitude=final_lng,
        address=address or ("Nagpur Municipal Corporation Area" if final_lat else "Manual Location"),
        location_source=loc_source,
        department_id=dept_id,
        officer_id=assigned_officer.id if assigned_officer else None,
        status=status,
        sla_hours=sla_hours,
        sla_deadline=sla_deadline,
        created_at=now,
        updated_at=now
    )
    db.add(complaint)
    db.flush()

    # 8. Create Complaint Report entry (allows multi-citizen reporting)
    report = ComplaintReport(
        complaint_id=complaint.id,
        citizen_id=citizen.id if citizen else None,
        description=description,
        image_url=image_url,
        image_hash=image_hash,
        latitude=final_lat,
        longitude=final_lng,
        created_at=now
    )
    db.add(report)
    db.commit()
    db.refresh(complaint)

    # 9. Record Immutable Audit Logs
    record_audit_log(
        db=db,
        action="COMPLAINT_CREATED",
        complaint_id=complaint.id,
        public_id=complaint.public_id,
        user_id=citizen.id if citizen else None,
        user_name=citizen.name if citizen else "Citizen",
        role=citizen.role if citizen else "CITIZEN",
        new_state=complaint.status,
        details=f"Complaint '{complaint.title}' registered and routed to {dept_code} department."
    )

    if assigned_officer:
        record_audit_log(
            db=db,
            action="ASSIGNED",
            complaint_id=complaint.id,
            public_id=complaint.public_id,
            user_id=assigned_officer.user_id,
            user_name=assigned_officer.user.name if (assigned_officer and assigned_officer.user) else "Officer",
            role="OFFICER",
            previous_state="SUBMITTED",
            new_state="ASSIGNED",
            details=assignment_meta.get("reason", f"Auto-assigned to officer {assigned_officer.id}")
        )

    # 10. Trigger Notifications (In-App, WebSockets, WhatsApp)
    officer_name = assigned_officer.user.name if (assigned_officer and assigned_officer.user) else "Assigned Field Officer"
    dept_name = department.name if department else "Municipal Department"

    # WhatsApp Notifications (Real API or 'WhatsApp Ready' deep link)
    wa_citizen_result = None
    if citizen and citizen.phone:
        wa_citizen_result = await whatsapp_service.send_citizen_complaint_confirmation(
            citizen_phone=citizen.phone,
            citizen_name=citizen.name,
            complaint_public_id=complaint.public_id,
            status=complaint.status,
            department_name=dept_name,
            officer_name=officer_name if assigned_officer else None,
            sla_hours=sla_hours
        )

    wa_officer_result = None
    if assigned_officer and assigned_officer.user and assigned_officer.user.phone:
        wa_officer_result = await whatsapp_service.send_officer_assignment(
            officer_phone=assigned_officer.user.phone,
            officer_name=officer_name,
            complaint_public_id=complaint.public_id,
            category=complaint.category,
            priority=complaint.priority,
            location=complaint.address or "Nagpur Municipal Area",
            sla_hours=sla_hours
        )

    # In-App Notifications
    if citizen:
        await create_notification(
            db=db,
            user_id=citizen.id,
            complaint_id=complaint.id,
            notification_type="complaint_created",
            title=f"Complaint #{complaint.public_id} Registered",
            body=f"Your complaint regarding '{complaint.title}' has been registered and routed to the {dept_name}. Estimated resolution in {sla_hours} hours.",
            channel=NotificationChannel.WEB,
            broadcast_ws=True,
            ws_complaint_public_id=complaint.public_id
        )

    if assigned_officer and assigned_officer.user_id:
        await create_notification(
            db=db,
            user_id=assigned_officer.user_id,
            complaint_id=complaint.id,
            notification_type="complaint_assigned",
            title=f"New Task Assigned: #{complaint.public_id}",
            body=f"A new {severity} priority issue '{complaint.title}' has been assigned to you ({assignment_meta.get('zone', 'Zone')}).",
            channel=NotificationChannel.WEB,
            broadcast_ws=True,
            ws_complaint_public_id=complaint.public_id
        )

    # 10. Broadcast WebSocket Events
    event_payload = {
        "id": complaint.id,
        "public_id": complaint.public_id,
        "title": complaint.title,
        "category": complaint.category,
        "severity": complaint.severity,
        "priority": complaint.priority,
        "status": complaint.status,
        "department": dept_code,
        "department_name": dept_name,
        "officer_id": assigned_officer.id if assigned_officer else None,
        "officer_name": officer_name if assigned_officer else None,
        "zone": assignment_meta.get("zone"),
        "address": complaint.address,
        "sla_hours": complaint.sla_hours,
        "created_at": complaint.created_at.isoformat()
    }
    await ws_manager.broadcast_global(
        event="complaint_created",
        data=event_payload
    )
    await ws_manager.broadcast_to_complaint(
        complaint_id=complaint.public_id,
        event="complaint_created",
        data=event_payload
    )

    return complaint, {
        "ai_analysis": ai_result,
        "duplicate_check": dup_result,
        "location_source": loc_source,
        "assignment": assignment_meta,
        "whatsapp_citizen": wa_citizen_result,
        "whatsapp_officer": wa_officer_result
    }
