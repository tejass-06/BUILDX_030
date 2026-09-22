from typing import Optional, Dict, Any, Tuple
import os
import uuid
from supabase import create_client, Client
from app.core.config import settings

_supabase_client: Optional[Client] = None
_supabase_admin_client: Optional[Client] = None

def is_supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and (settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY))

def get_supabase_client() -> Optional[Client]:
    global _supabase_client
    if not is_supabase_configured():
        return None
    if _supabase_client is None:
        key = settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY
        _supabase_client = create_client(settings.SUPABASE_URL, key)
    return _supabase_client

def get_supabase_admin_client() -> Optional[Client]:
    global _supabase_admin_client
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return get_supabase_client()
    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_admin_client

def supabase_sign_up(email: str, password: str, metadata: Optional[Dict[str, Any]] = None) -> Tuple[Optional[str], Optional[str]]:
    """
    Registers a new user in Supabase Auth.
    Returns: (auth_user_id, access_token)
    """
    client = get_supabase_client()
    if not client:
        return None, None
    try:
        options = {"data": metadata} if metadata else None
        res = client.auth.sign_up({
            "email": email,
            "password": password,
            "options": options
        })
        if res.user:
            auth_user_id = str(res.user.id)
            access_token = res.session.access_token if res.session else None
            return auth_user_id, access_token
    except Exception as e:
        raise e
    return None, None

def supabase_sign_in(email: str, password: str) -> Tuple[Optional[str], Optional[str], Optional[Dict[str, Any]]]:
    """
    Authenticates user against Supabase Auth.
    Returns: (auth_user_id, access_token, user_metadata)
    """
    client = get_supabase_client()
    if not client:
        return None, None, None
    try:
        res = client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        if res.user and res.session:
            return str(res.user.id), res.session.access_token, res.user.user_metadata
    except Exception as e:
        raise e
    return None, None, None

def supabase_verify_token(access_token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies Supabase JWT access token using Supabase Auth client.
    Returns user payload dictionary or None.
    """
    client = get_supabase_client()
    if not client:
        return None
    try:
        user_resp = client.auth.get_user(access_token)
        if user_resp and user_resp.user:
            return {
                "sub": str(user_resp.user.id),
                "email": user_resp.user.email,
                "user_metadata": user_resp.user.user_metadata or {}
            }
    except Exception:
        return None
    return None

def supabase_upload_storage(
    bucket_name: str,
    filename: str,
    file_bytes: bytes,
    content_type: str = "image/jpeg"
) -> Optional[str]:
    """
    Uploads file to Supabase Storage bucket and returns public URL.
    """
    client = get_supabase_admin_client() or get_supabase_client()
    if not client:
        return None
    try:
        # Ensure bucket exists
        try:
            client.storage.get_bucket(bucket_name)
        except Exception:
            try:
                client.storage.create_bucket(bucket_name, options={"public": True})
            except Exception:
                pass

        # Upload file
        client.storage.from_(bucket_name).upload(
            path=filename,
            file=file_bytes,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        # Get public URL
        public_url = client.storage.from_(bucket_name).get_public_url(filename)
        return public_url
    except Exception:
        return None
