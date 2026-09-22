from typing import Optional
from pydantic import BaseModel, Field
from app.models.resolution import VerificationResult

class CitizenVerifyRequest(BaseModel):
    result: Optional[VerificationResult] = None
    satisfied: Optional[bool] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback: Optional[str] = None
    reopen_reason: Optional[str] = None

class ComplaintReopenRequest(BaseModel):
    reason: Optional[str] = "Citizen marked issue as not fixed"
    feedback: Optional[str] = None
