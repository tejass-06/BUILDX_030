from datetime import datetime
from typing import Optional
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

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    created_at: datetime
    department_code: Optional[str] = None
    officer_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
