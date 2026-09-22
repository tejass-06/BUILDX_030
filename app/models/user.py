from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    CITIZEN = "CITIZEN"
    OFFICER = "OFFICER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    auth_user_id = Column(String(100), unique=True, index=True, nullable=True) # Supabase Auth UUID
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    password_hash = Column(String(255), nullable=True) # Nullable when using Supabase Auth
    role = Column(String(50), default=UserRole.CITIZEN.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    officer_profile = relationship("Officer", back_populates="user", uselist=False)
    complaints = relationship("Complaint", back_populates="citizen", foreign_keys="Complaint.citizen_id")
    reports = relationship("ComplaintReport", back_populates="citizen")
    notifications = relationship("Notification", back_populates="user")
