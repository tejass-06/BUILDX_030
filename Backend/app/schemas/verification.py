from typing import Optional
from pydantic import BaseModel, Field
from app.models.resolution import VerificationResult

class CitizenVerifyRequest(BaseModel):
    result: VerificationResult
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None
    reopen_reason: Optional[str] = None

class ComplaintReopenRequest(BaseModel):
    reason: str
    feedback: Optional[str] = None
