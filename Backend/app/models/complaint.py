from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class CivicCategory(str, enum.Enum):
    ROAD_POTHOLE = "ROAD_POTHOLE"
    WATER_LEAKAGE = "WATER_LEAKAGE"
    GARBAGE = "GARBAGE"
    DRAINAGE = "DRAINAGE"
    STREETLIGHT = "STREETLIGHT"
    ELECTRICITY = "ELECTRICITY"
    OTHER = "OTHER"

class PriorityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ComplaintStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CITIZEN_VERIFICATION = "CITIZEN_VERIFICATION"
    CLOSED = "CLOSED"
    REOPENED = "REOPENED"

class LocationSource(str, enum.Enum):
    PHOTO_EXIF = "PHOTO_EXIF"
    DEVICE_GPS = "DEVICE_GPS"
    MANUAL = "MANUAL"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    public_id = Column(String(50), unique=True, index=True, nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    language = Column(String(50), default="en", nullable=False)
    
    category = Column(String(50), default=CivicCategory.OTHER.value, nullable=False)
    severity = Column(String(50), default=SeverityLevel.MEDIUM.value, nullable=False)
    priority = Column(String(50), default=PriorityLevel.MEDIUM.value, nullable=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(500), nullable=True)
    location_source = Column(String(50), default=LocationSource.MANUAL.value, nullable=False)

    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)

    status = Column(String(50), default=ComplaintStatus.SUBMITTED.value, nullable=False)

    sla_hours = Column(Integer, default=48, nullable=False)
    sla_deadline = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    citizen = relationship("User", back_populates="complaints", foreign_keys=[citizen_id])
    department = relationship("Department", back_populates="complaints")
    officer = relationship("Officer", back_populates="assigned_complaints", foreign_keys=[officer_id])
    
    reports = relationship("ComplaintReport", back_populates="complaint", cascade="all, delete-orphan")
    resolutions = relationship("Resolution", back_populates="complaint", cascade="all, delete-orphan")
    verifications = relationship("CitizenVerification", back_populates="complaint", cascade="all, delete-orphan")
    messages = relationship("ComplaintMessage", back_populates="complaint", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="complaint", cascade="all, delete-orphan")

class ComplaintReport(Base):
    __tablename__ = "complaint_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    image_hash = Column(String(100), nullable=True)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    complaint = relationship("Complaint", back_populates="reports")
    citizen = relationship("User", back_populates="reports")
