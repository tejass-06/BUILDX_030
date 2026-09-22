from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session

from app.models.complaint import Complaint, ComplaintStatus
from app.models.resolution import Resolution, CitizenVerification, VerificationResult
from app.models.officer import Officer
from app.models.user import User
from app.models.notification import NotificationChannel
from app.services.ai_service import verify_resolution_ai
from app.services.notification_service import create_notification
from app.services.audit_service import record_audit_log
from app.websocket.manager import ws_manager

async def submit_officer_resolution(
    db: Session,
    complaint: Complaint,
    officer: Officer,
    resolution_note: str,
    after_photo_url: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> Resolution:
    """
    Submits officer resolution evidence, runs AI/rule verification,
    and transitions complaint to CITIZEN_VERIFICATION status.
    """
    # 1. AI/Rule-based Resolution Verification
    first_report = complaint.reports[0] if complaint.reports else None
    before_url = first_report.image_url if first_report else None
    
    ai_verify = verify_resolution_ai(
        before_photo_url=before_url,
        after_photo_url=after_photo_url,
        comp_lat=complaint.latitude,
        comp_lng=complaint.longitude,
        res_lat=latitude or complaint.latitude,
        res_lng=longitude or complaint.longitude
    )

    # 2. Record Resolution
    resolution = Resolution(
        complaint_id=complaint.id,
        officer_id=officer.id,
        resolution_note=resolution_note,
        after_photo_url=after_photo_url,
        latitude=latitude or complaint.latitude,
        longitude=longitude or complaint.longitude,
        location_match=ai_verify["location_match"],
        scene_similarity=ai_verify["scene_similarity"],
        repair_detected=ai_verify["repair_detected"],
        ai_confidence=ai_verify["confidence"],
        ai_verified=True,
        created_at=datetime.now(timezone.utc)
    )
    db.add(resolution)

    # 3. Transition Complaint Status to CITIZEN_VERIFICATION
    prev_status = complaint.status
    complaint.status = ComplaintStatus.CITIZEN_VERIFICATION.value
    complaint.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(resolution)
    db.refresh(complaint)

    # Record Audit Log
    record_audit_log(
        db=db,
        action="RESOLVED",
        complaint_id=complaint.id,
        public_id=complaint.public_id,
        user_id=officer.user_id,
        user_name=officer.user.name if (officer and officer.user) else "Officer",
        role="OFFICER",
        previous_state=prev_status,
        new_state="CITIZEN_VERIFICATION",
        details=f"Resolution note: {resolution_note}"
    )

    # 4. Notify Citizen
    if complaint.citizen_id:
        await create_notification(
            db=db,
            user_id=complaint.citizen_id,
            complaint_id=complaint.id,
            notification_type="verification_required",
            title=f"Action Required: Verify Resolution for #{complaint.public_id}",
            body=f"Officer has submitted resolution proof for '{complaint.title}'. Please review and confirm if work is satisfactory.",
            channel=NotificationChannel.WEB,
            broadcast_ws=True,
            ws_complaint_public_id=complaint.public_id
        )

    # 5. Broadcast WebSocket Event
    await ws_manager.broadcast_to_complaint(
        complaint_id=complaint.public_id,
        event="resolution_submitted",
        data={
            "complaint_id": complaint.id,
            "public_id": complaint.public_id,
            "status": complaint.status,
            "resolution_note": resolution_note,
            "after_photo_url": after_photo_url,
            "ai_verification": ai_verify
        }
    )

    return resolution

async def process_citizen_verification(
    db: Session,
    complaint: Complaint,
    citizen: User,
    result: VerificationResult,
    rating: Optional[int] = None,
    feedback: Optional[str] = None,
    reopen_reason: Optional[str] = None
) -> CitizenVerification:
    """
    Processes citizen feedback:
    - If FIXED: transitions complaint to CLOSED.
    - If NOT_FIXED: transitions complaint to REOPENED.
    """
    verification = CitizenVerification(
        complaint_id=complaint.id,
        citizen_id=citizen.id,
        result=result.value,
        rating=rating,
        feedback=feedback,
        reopen_reason=reopen_reason,
        created_at=datetime.now(timezone.utc)
    )
    db.add(verification)

    prev_stat = complaint.status
    new_status = ComplaintStatus.CLOSED.value if result == VerificationResult.FIXED else ComplaintStatus.REOPENED.value
    complaint.status = new_status
    complaint.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(verification)
    db.refresh(complaint)

    # Record Audit Log
    act_name = "CITIZEN_VERIFIED" if result == VerificationResult.FIXED else "REOPENED"
    record_audit_log(
        db=db,
        action=act_name,
        complaint_id=complaint.id,
        public_id=complaint.public_id,
        user_id=citizen.id,
        user_name=citizen.name,
        role=citizen.role,
        previous_state=prev_stat,
        new_state=new_status,
        details=reopen_reason or feedback or f"Verification result: {result.value}"
    )

    event_name = "complaint_closed" if result == VerificationResult.FIXED else "complaint_reopened"
    title_text = f"Complaint #{complaint.public_id} Closed" if result == VerificationResult.FIXED else f"Complaint #{complaint.public_id} Reopened"
    body_text = f"Citizen verified resolution. Thank you!" if result == VerificationResult.FIXED else f"Citizen marked issue as NOT FIXED: {reopen_reason or feedback or 'Issue persists'}"

    # Notify Officer
    if complaint.officer and complaint.officer.user_id:
        await create_notification(
            db=db,
            user_id=complaint.officer.user_id,
            complaint_id=complaint.id,
            notification_type=event_name,
            title=title_text,
            body=body_text,
            channel=NotificationChannel.WEB,
            broadcast_ws=True,
            ws_complaint_public_id=complaint.public_id
        )

    # Notify Citizen
    await create_notification(
        db=db,
        user_id=citizen.id,
        complaint_id=complaint.id,
        notification_type=event_name,
        title=title_text,
        body=f"Your verification has been recorded ({result.value}).",
        channel=NotificationChannel.WEB,
        broadcast_ws=True,
        ws_complaint_public_id=complaint.public_id
    )

    # Broadcast WebSocket
    await ws_manager.broadcast_to_complaint(
        complaint_id=complaint.public_id,
        event=event_name,
        data={
            "complaint_id": complaint.id,
            "public_id": complaint.public_id,
            "status": complaint.status,
            "result": result.value,
            "rating": rating,
            "feedback": feedback
        }
    )

    return verification
