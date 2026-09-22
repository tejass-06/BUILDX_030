from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.user import UserRole

class UserRegister(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str
    role: Optional[UserRole] = UserRole.CITIZEN
    
    # Optional officer fields during registration
    department_code: Optional[str] = None
    zone: Optional[str] = "North Zone"
    designation: Optional[str] = "Junior Engineer"
    employee_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: Optional[bool] = True
    created_at: datetime
    department_code: Optional[str] = None
    officer_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class OfficerRequestResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    zone: Optional[str] = None
    designation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
