from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class DepartmentCode(str, enum.Enum):
    ROAD = "ROAD"
    WATER = "WATER"
    GARBAGE = "GARBAGE"
    DRAINAGE = "DRAINAGE"
    STREETLIGHT = "STREETLIGHT"
    ELECTRICITY = "ELECTRICITY"
    OTHER = "OTHER"

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    default_sla_hours = Column(Integer, default=48, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    officers = relationship("Officer", back_populates="department")
    complaints = relationship("Complaint", back_populates="department")
    works = relationship("DepartmentWork", back_populates="department")
