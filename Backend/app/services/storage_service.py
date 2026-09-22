import os
import uuid
from typing import Tuple
from fastapi import UploadFile
from app.core.config import settings
from app.services.supabase_service import is_supabase_configured, supabase_upload_storage

async def save_evidence_photo(
    file: UploadFile,
    bucket_name: str = "complaint-photos"
) -> Tuple[str, bytes]:
    """
    Saves an uploaded evidence photo:
    1. Reads raw bytes (for EXIF extraction and hashing before upload)
    2. Uploads to Supabase Storage if configured
    3. Falls back to local disk storage if Supabase is not active
    Returns: (image_url, raw_bytes)
    """
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if not ext:
        ext = ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    
    contents = await file.read()

    # Try Supabase Storage first if configured
    if is_supabase_configured():
        content_type = file.content_type or ("image/png" if ext.lower() == ".png" else "image/jpeg")
        supabase_url = supabase_upload_storage(
            bucket_name=bucket_name,
            filename=filename,
            file_bytes=contents,
            content_type=content_type
        )
        if supabase_url:
            return supabase_url, contents

    # Local fallback
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(contents)
    
    image_url = f"/uploads/{filename}"
    return image_url, contents
