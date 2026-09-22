from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def record_audit_log(
    db: Session,
    action: str,
    complaint_id: Optional[int] = None,
    public_id: Optional[str] = None,
    user_id: Optional[int] = None,
    user_name: Optional[str] = None,
    role: Optional[str] = None,
    previous_state: Optional[str] = None,
    new_state: Optional[str] = None,
    details: Optional[str] = None
) -> AuditLog:
    """
    Creates an immutable audit log entry for civic transparency and tracking.
    """
    audit = AuditLog(
        complaint_id=complaint_id,
        public_id=public_id,
        user_id=user_id,
        user_name=user_name,
        role=role,
        action=action,
        previous_state=previous_state,
        new_state=new_state,
        details=details,
        created_at=datetime.now(timezone.utc)
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit

def get_complaint_audit_logs(db: Session, complaint_id: int) -> List[AuditLog]:
    """Retrieves all chronological audit logs for a complaint."""
    return db.query(AuditLog).filter(AuditLog.complaint_id == complaint_id).order_by(AuditLog.created_at.asc()).all()
