from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class MessageCreate(BaseModel):
    message: str
    attachment_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    complaint_id: int
    sender_id: Optional[int] = None
    sender_name: Optional[str] = None
    sender_role: str
    message: str
    attachment_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
