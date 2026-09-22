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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Health Check (Root level as specified)
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "nagar-saathi-backend"
    }

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# WebSocket Endpoint
@app.websocket("/ws/complaints/{complaint_id}")
async def websocket_complaint_endpoint(websocket: WebSocket, complaint_id: str):
    await ws_manager.connect(websocket, complaint_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or heartbeat if client sends ping
            await websocket.send_text(f'{{"type": "ack", "complaint_id": "{complaint_id}"}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, complaint_id)
    except Exception:
        ws_manager.disconnect(websocket, complaint_id)
