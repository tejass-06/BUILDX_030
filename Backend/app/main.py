import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.db.seed import init_db
from app.api import api_router
from app.websocket.manager import ws_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created & seeded
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title="NagarSaathi AI — Backend API",
    description=(
        "AI-Powered Civic Complaint Management and Smart Governance Platform. "
        "Engineered for municipal grievance redressal, multi-signal duplicate detection, "
        "dynamic SLA enforcement, photo EXIF geolocation, and automated department routing."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:[0-9]+)?.*$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

import httpx
from sqlalchemy import text
from app.services.supabase_service import is_supabase_configured

# Health Check (Root level with subsystem diagnostics)
@app.get("/health", tags=["Health"])
async def health_check():
    # 1. Check Database
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {type(e).__name__}"

    # 2. Check Ollama AI Server
    ollama_info = {"status": "unavailable", "model": settings.OLLAMA_MODEL}
    try:
        async with httpx.AsyncClient(timeout=1.0) as client:
            res = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if res.status_code == 200:
                ollama_info["status"] = "available"
    except Exception:
        ollama_info["status"] = "offline_deterministic_fallback_active"

    # 3. Check Storage Backend
    storage_provider = "supabase" if is_supabase_configured() else "local"

    overall_status = "ok" if db_status == "connected" else "degraded"

    return {
        "status": overall_status,
        "service": "nagar-saathi-backend",
        "database": db_status,
        "ollama": ollama_info,
        "storage": {
            "provider": storage_provider,
            "complaints_bucket": settings.SUPABASE_STORAGE_BUCKET_COMPLAINTS
        }
    }

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# WebSocket Endpoints
@app.websocket("/ws/global")
async def websocket_global_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket, "global")
    try:
        while True:
            await websocket.receive_text()
            await websocket.send_text('{"type": "ack", "channel": "global"}')
    except (WebSocketDisconnect, Exception):
        ws_manager.disconnect(websocket, "global")

@app.websocket("/ws/complaints/{complaint_id}")
async def websocket_complaint_endpoint(websocket: WebSocket, complaint_id: str):
    await ws_manager.connect(websocket, complaint_id)
    try:
        while True:
            await websocket.receive_text()
            await websocket.send_text(f'{{"type": "ack", "complaint_id": "{complaint_id}"}}')
    except (WebSocketDisconnect, Exception):
        ws_manager.disconnect(websocket, complaint_id)
