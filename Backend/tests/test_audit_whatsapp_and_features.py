import io
from PIL import Image
from app.models.complaint import ComplaintStatus

def test_audit_logs_lifecycle(client):
    # 1. Citizen registers and submits complaint
    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Ananya Sen",
        "email": "ananya.sen@example.com",
        "phone": "+919811223344",
        "password": "Password@123",
        "role": "CITIZEN"
    })
    assert reg_res.status_code == 201
    citizen_token = reg_res.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    create_res = client.post(
        "/api/v1/complaints",
        data={
            "title": "Broken street lamp sparking near school",
            "description": "Streetlight pole wiring short circuit sparking at night",
            "latitude": 21.1458,
            "longitude": 79.0882,
            "address": "Dharampeth Square, Nagpur"
        },
        headers=citizen_headers
    )
    assert create_res.status_code == 201
    public_id = create_res.json()["public_id"]

    # 2. Check audit logs on creation
    audits_res = client.get(f"/api/v1/complaints/{public_id}/audit-logs")
    assert audits_res.status_code == 200
    audits = audits_res.json()
    actions = [a["action"] for a in audits]
    assert "COMPLAINT_CREATED" in actions

    # 3. Officer login and updates status
    officer_res = client.post("/api/v1/auth/login", json={
        "email": "officer@nagar.local",
        "password": "Password@123"
    })
    assert officer_res.status_code == 200
    officer_token = officer_res.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}

    status_res = client.patch(
        f"/api/v1/officer/complaints/{public_id}/status",
        json={"status": "IN_PROGRESS", "note": "Technician team on site with bucket truck"},
        headers=officer_headers
    )
    assert status_res.status_code == 200

    # 4. Check audit log has WORK_STARTED
    audits_res = client.get(f"/api/v1/complaints/{public_id}/audit-logs")
    audits = audits_res.json()
    actions = [a["action"] for a in audits]
    assert "WORK_STARTED" in actions

    # 5. Officer resolves
    resolve_res = client.post(
        f"/api/v1/officer/complaints/{public_id}/resolve",
        data={"resolution_note": "Replaced burned fuse and insulated streetlight wiring."},
        headers=officer_headers
    )
    assert resolve_res.status_code == 200

    # 6. Citizen verifies FIXED -> CLOSED
    verify_res = client.post(
        f"/api/v1/complaints/{public_id}/verify",
        json={"result": "FIXED", "rating": 5, "feedback": "Well resolved!"},
        headers=citizen_headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "CLOSED"

    # 7. Final Audit Log verification
    final_audits = client.get(f"/api/v1/complaints/{public_id}/audit-logs").json()
    all_actions = [a["action"] for a in final_audits]
    assert "COMPLAINT_CREATED" in all_actions
    assert "WORK_STARTED" in all_actions
    assert "RESOLVED" in all_actions
    assert "CITIZEN_VERIFIED" in all_actions

def test_whatsapp_deeplink_generation(client):
    # Test free WhatsApp deeplink generation
    res = client.get("/api/v1/complaints/NS-1001/whatsapp-link?phone=919876543210&note=Technician+dispatched")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "WhatsApp Ready"
    assert data["label"] == "Open WhatsApp"
    assert "wa.me/919876543210" in data["deeplink"]
    assert "NS-1001" in data["message"]
    assert data["complaint_public_id"] == "NS-1001"

def test_enhanced_duplicate_detection(client):
    # Test duplicate check API returns similar complaints and signals
    payload = {
        "title": "Severe pothole near Ashi Nagar Square",
        "description": "Deep dangerous pothole on the main road",
        "latitude": 21.1738,
        "longitude": 79.1165,
        "category": "ROAD_POTHOLE"
    }
    res = client.post("/api/v1/ai/duplicate-check", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "is_duplicate" in data
    assert "duplicate_score" in data
    assert "signals" in data
    assert "similar_complaints" in data
    assert isinstance(data["similar_complaints"], list)

def test_health_detailed_diagnostics(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["ok", "healthy", "degraded"]
    assert data["database"] == "connected"
    assert "ollama" in data
    assert "storage" in data
    assert data["storage"]["provider"] in ["supabase", "local"]
