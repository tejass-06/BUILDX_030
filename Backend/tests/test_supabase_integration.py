from unittest.mock import MagicMock, patch
from app.services.supabase_service import (
    is_supabase_configured,
    get_supabase_client,
    supabase_sign_up,
    supabase_sign_in,
    supabase_verify_token,
    supabase_upload_storage
)
from app.services.storage_service import save_evidence_photo
from fastapi import UploadFile
import io

def test_supabase_configuration_detection():
    # Without keys configured in test environment
    with patch("app.core.config.settings.SUPABASE_URL", None):
        assert is_supabase_configured() is False

    with patch("app.core.config.settings.SUPABASE_URL", "https://test.supabase.co"), \
         patch("app.core.config.settings.SUPABASE_ANON_KEY", "test-anon-key"):
        assert is_supabase_configured() is True

def test_supabase_auth_mock():
    mock_client = MagicMock()
    mock_res = MagicMock()
    mock_res.user.id = "mock-uuid-12345"
    mock_res.session.access_token = "mock-jwt-token"
    mock_client.auth.sign_up.return_value = mock_res
    mock_client.auth.sign_in_with_password.return_value = mock_res
    
    mock_user_resp = MagicMock()
    mock_user_resp.user.id = "mock-uuid-12345"
    mock_user_resp.user.email = "test@nagar.local"
    mock_user_resp.user.user_metadata = {"name": "Test User"}
    mock_client.auth.get_user.return_value = mock_user_resp

    with patch("app.services.supabase_service.get_supabase_client", return_value=mock_client):
        uid, token = supabase_sign_up("test@nagar.local", "Password@123")
        assert uid == "mock-uuid-12345"
        assert token == "mock-jwt-token"

        uid, token, meta = supabase_sign_in("test@nagar.local", "Password@123")
        assert uid == "mock-uuid-12345"
        assert token == "mock-jwt-token"

        verified = supabase_verify_token("mock-jwt-token")
        assert verified is not None
        assert verified["sub"] == "mock-uuid-12345"
        assert verified["email"] == "test@nagar.local"

def test_supabase_storage_mock():
    mock_client = MagicMock()
    mock_storage = MagicMock()
    mock_storage.get_public_url.return_value = "https://test.supabase.co/storage/v1/object/public/complaint-photos/sample.jpg"
    mock_client.storage.from_.return_value = mock_storage

    with patch("app.services.supabase_service.get_supabase_admin_client", return_value=mock_client), \
         patch("app.services.supabase_service.get_supabase_client", return_value=mock_client):
        url = supabase_upload_storage("complaint-photos", "sample.jpg", b"fake-image-bytes")
        assert url == "https://test.supabase.co/storage/v1/object/public/complaint-photos/sample.jpg"
