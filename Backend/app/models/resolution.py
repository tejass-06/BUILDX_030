from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class VerificationResult(str, enum.Enum):
    FIXED = "FIXED"
    NOT_FIXED = "NOT_FIXED"

class Resolution(Base):
    __tablename__ = "resolutions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    officer_id = Column(Integer, ForeignKey("officers.id"), nullable=False)

    resolution_note = Column(Text, nullable=False)
    after_photo_url = Column(String(500), nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    location_match = Column(Boolean, default=True, nullable=False)
    scene_similarity = Column(Float, default=0.90, nullable=False)
    repair_detected = Column(Boolean, default=True, nullable=False)
    ai_confidence = Column(Float, default=0.88, nullable=False)
    ai_verified = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    complaint = relationship("Complaint", back_populates="resolutions")
    officer = relationship("Officer", back_populates="resolutions")

class CitizenVerification(Base):
    __tablename__ = "citizen_verifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    result = Column(String(50), nullable=False)  # FIXED or NOT_FIXED
    rating = Column(Integer, nullable=True)      # 1 to 5
    feedback = Column(Text, nullable=True)
    reopen_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    complaint = relationship("Complaint", back_populates="verifications")
    citizen = relationship("User")
