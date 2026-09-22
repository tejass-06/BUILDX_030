from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.ai import (
    AIAnalyzeRequest,
    AIAnalyzeResponse,
    AIDuplicateCheckRequest,
    AIDuplicateCheckResponse,
    AIVerifyResolutionRequest,
    AIVerifyResolutionResponse
)
from app.services.ai_service import analyze_complaint_ai, verify_resolution_ai
from app.services.duplicate_service import check_duplicate_complaint

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/analyze", response_model=AIAnalyzeResponse)
async def analyze_complaint(payload: AIAnalyzeRequest):
    result = await analyze_complaint_ai(payload.title, payload.description)
    return AIAnalyzeResponse(**result)

@router.post("/duplicate-check", response_model=AIDuplicateCheckResponse)
def duplicate_check(payload: AIDuplicateCheckRequest, db: Session = Depends(get_db)):
    result = check_duplicate_complaint(
        db=db,
        title=payload.title,
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
        image_hash=payload.image_hash,
        category=payload.category
    )
    return AIDuplicateCheckResponse(**result)

@router.post("/verify-resolution", response_model=AIVerifyResolutionResponse)
def verify_resolution(payload: AIVerifyResolutionRequest):
    result = verify_resolution_ai(
        before_photo_url=payload.before_photo_url,
        after_photo_url=payload.after_photo_url,
        comp_lat=payload.complaint_latitude,
        comp_lng=payload.complaint_longitude,
        res_lat=payload.resolution_latitude,
        res_lng=payload.resolution_longitude
    )
    return AIVerifyResolutionResponse(**result)
