from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=True, index=True)
    public_id = Column(String(50), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(255), nullable=True)
    role = Column(String(50), nullable=True) # CITIZEN, OFFICER, ADMIN, SYSTEM
    action = Column(String(100), nullable=False, index=True) # e.g. COMPLAINT_CREATED, ASSIGNED, STATUS_CHANGED, WORK_STARTED, RESOLVED, CITIZEN_VERIFIED, REOPENED
    previous_state = Column(String(100), nullable=True)
    new_state = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    complaint = relationship("Complaint", backref="audit_logs")
    user = relationship("User", backref="audit_logs")
