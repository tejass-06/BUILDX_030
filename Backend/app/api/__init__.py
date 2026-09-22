from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.complaints import router as complaints_router
from app.api.ai import router as ai_router
from app.api.officer import router as officer_router
from app.api.messages import router as messages_router
from app.api.notifications import router as notifications_router
from app.api.analytics import router as analytics_router
from app.api.works import router as works_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(complaints_router)
api_router.include_router(ai_router)
api_router.include_router(officer_router)
api_router.include_router(messages_router)
api_router.include_router(notifications_router)
api_router.include_router(analytics_router)
api_router.include_router(works_router)
