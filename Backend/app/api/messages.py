from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.complaint import Complaint
from app.models.message import ComplaintMessage
from app.schemas.message import MessageResponse, MessageCreate
from app.services.complaint_service import save_uploaded_file
from app.services.audit_service import record_audit_log
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/complaints", tags=["Complaint Messaging"])

@router.get("/{complaint_id}/messages", response_model=List[MessageResponse])
def get_complaint_messages(
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

    messages = db.query(ComplaintMessage).filter(ComplaintMessage.complaint_id == complaint.id).order_by(ComplaintMessage.created_at.asc()).all()
    
    return [
        MessageResponse(
            id=m.id,
            complaint_id=m.complaint_id,
            sender_id=m.sender_id,
            sender_name=m.sender.name if m.sender else "System",
            sender_role=m.sender_role,
            message=m.message,
            attachment_url=m.attachment_url,
            created_at=m.created_at
        )
        for m in messages
    ]

@router.post("/{complaint_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint_message(
    complaint_id: str,
    payload: MessageCreate,
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

    msg = ComplaintMessage(
        complaint_id=complaint.id,
        sender_id=current_user.id,
        sender_role=current_user.role,
        message=payload.message,
        attachment_url=payload.attachment_url,
        created_at=datetime.now(timezone.utc)
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    # Record Audit Log
    record_audit_log(
        db=db,
        action="COMMENT_ADDED",
        complaint_id=complaint.id,
        public_id=complaint.public_id,
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        details=f"Message: {payload.message[:100]}"
    )

    # Broadcast WebSocket
    await ws_manager.broadcast_to_complaint(
        complaint_id=complaint.public_id,
        event="message_created",
        data={
            "id": msg.id,
            "complaint_id": msg.complaint_id,
            "sender_name": current_user.name,
            "sender_role": current_user.role,
            "message": msg.message,
            "attachment_url": msg.attachment_url,
            "created_at": msg.created_at.isoformat()
        }
    )

    return MessageResponse(
        id=msg.id,
        complaint_id=msg.complaint_id,
        sender_id=msg.sender_id,
        sender_name=current_user.name,
        sender_role=msg.sender_role,
        message=msg.message,
        attachment_url=msg.attachment_url,
        created_at=msg.created_at
    )
