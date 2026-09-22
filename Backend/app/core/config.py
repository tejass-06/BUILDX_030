import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "NagarSaathi AI"
    TAGLINE: str = "AI-Powered Civic Complaint Management and Smart Governance Platform"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT
    SECRET_KEY: str = "nagar_saathi_super_secret_jwt_key_hackathon_2026_dev_only_change_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Supabase PostgreSQL / Local Database URL
    DATABASE_URL: str = "sqlite:///./nagar_saathi.db"
    
    # Supabase API & Auth Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # Supabase Storage Buckets
    SUPABASE_STORAGE_BUCKET_COMPLAINTS: str = "complaint-photos"
    SUPABASE_STORAGE_BUCKET_RESOLUTIONS: str = "resolution-photos"
    
    # Ollama AI Configuration (Local Open LLM)
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen3:8b"
    OLLAMA_TIMEOUT_SECONDS: float = 120.0
    
    # Local Storage fallback
    UPLOAD_DIR: str = "uploads"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "*",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]


    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()

# Ensure local upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
