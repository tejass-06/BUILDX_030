import time
import pytest
import httpx
from unittest.mock import patch
from app.core.config import settings
from app.services.ai_service import analyze_complaint_ai, fallback_ai_analysis

def test_ollama_server_available():
    """Verifies that the real local Ollama server is reachable."""
    response = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=5.0)
    assert response.status_code == 200, "Local Ollama server is not responding on 127.0.0.1:11434"

def test_ollama_qwen3_model():
    """Verifies that qwen3:8b is installed and available in Ollama."""
    response = httpx.get(f"{settings.OLLAMA_BASE_URL}/api/tags", timeout=5.0)
    assert response.status_code == 200
    models = [m.get("name") for m in response.json().get("models", [])]
    # Check that qwen3:8b or qwen3:latest is in the list
    assert any("qwen3:8b" in m for m in models), f"qwen3:8b not found in installed models: {models}"

@pytest.mark.asyncio
async def test_real_ollama_ai_analysis():
    """
    Real Ollama Inference Test:
    Sends a real civic complaint in Marathi to qwen3:8b and verifies structured extraction.
    """
    marathi_complaint = "नागपूरमध्ये आमच्या परिसरात पाण्याची पाइपलाइन लीक झाली आहे आणि रस्त्यावर पाणी साचले आहे."
    
    t0 = time.time()
    result = await analyze_complaint_ai(
        title="पाण्याची पाइपलाइन गळती",
        description=marathi_complaint
    )
    latency = round(time.time() - t0, 2)
    print(f"\n[REAL OLLAMA TEST] OLLAMA LATENCY: {latency} seconds")
    print(f"[REAL OLLAMA TEST] Result: {result}")

    assert result is not None
    assert result["category"] == "WATER_LEAKAGE"
    assert result["responsible_department"] == "WATER"
    assert result["severity"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert result["priority"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert result["suggested_sla_hours"] in [12, 24, 48, 72]
    assert len(result["keywords"]) > 0
    assert result["ai_provider"] == "OLLAMA"
    assert result["model_used"] == "qwen3:8b"

def test_fastapi_ollama_e2e(client):
    """
    FastAPI End-to-End Test:
    Calls POST /api/v1/ai/analyze and verifies real Ollama response through HTTP pipeline.
    """
    payload = {
        "title": "Road damage",
        "description": "Large dangerous pothole and broken asphalt near school in Ashi Nagar."
    }
    
    t0 = time.time()
    response = client.post("/api/v1/ai/analyze", json=payload)
    latency = round(time.time() - t0, 2)
    print(f"\n[FASTAPI OLLAMA E2E] LATENCY: {latency} seconds")

    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "ROAD_POTHOLE"
    assert data["responsible_department"] == "ROAD"
    assert data["ai_provider"] == "OLLAMA"
    assert data["model_used"] == "qwen3:8b"
    assert "summary" in data
    assert "reason" in data

def test_ollama_fallback(client):
    """
    Fallback Test:
    Points to an unreachable Ollama URL and verifies the deterministic rule fallback works seamlessly.
    """
    with patch("app.core.config.settings.OLLAMA_BASE_URL", "http://127.0.0.1:59999"):
        payload = {
            "title": "Street light issue",
            "description": "Streetlight pole bulb is dark and sparking wire at night."
        }
        response = client.post("/api/v1/ai/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] in ["STREETLIGHT", "ELECTRICITY"]
        assert data["responsible_department"] in ["STREETLIGHT", "ELECTRICITY"]
        assert data["ai_provider"] == "DETERMINISTIC_FALLBACK"
        assert data["model_used"] is None
        assert data["suggested_sla_hours"] in [12, 24, 48, 72]
