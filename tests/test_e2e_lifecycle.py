import io
from PIL import Image

def test_full_complaint_golden_path_e2e(client):
    # =========================================================================
    # Step 1 & 2: Citizen Register & Login
    # =========================================================================
    citizen_email = "e2e_citizen@nagar.local"
    citizen_password = "Password@123"

    reg_res = client.post("/api/v1/auth/register", json={
        "name": "Manish Deshmukh",
        "email": citizen_email,
        "phone": "+919988776655",
        "password": citizen_password,
        "role": "CITIZEN"
    })
    assert reg_res.status_code == 201
    citizen_token = reg_res.json()["access_token"]
    citizen_headers = {"Authorization": f"Bearer {citizen_token}"}

    # =========================================================================
    # Step 3, 4, 5, 6, 7, 8: Citizen Creates Complaint with Photo Upload
    # =========================================================================
    # Create test image in memory
    img = Image.new("RGB", (120, 120), color="red")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()

    complaint_data = {
        "title": "Severe pothole near Ring Road Square",
        "description": "Large dangerous khadda in the middle lane causing accidents and traffic slowdown near the hospital",
        "latitude": 21.145800,
        "longitude": 79.088200,
        "address": "Ring Road Square, Nagpur"
    }

    files = {
        "photo": ("pothole_evidence.jpg", img_bytes, "image/jpeg")
    }

    create_res = client.post(
        "/api/v1/complaints",
        data=complaint_data,
        files=files,
        headers=citizen_headers
    )
    assert create_res.status_code == 201
    complaint = create_res.json()

    complaint_id = complaint["id"]
    public_id = complaint["public_id"]
    assert public_id.startswith("NS-")
    assert complaint["category"] == "ROAD_POTHOLE"
    assert complaint["department_code"] == "ROAD"
    assert complaint["location_source"] in ["DEVICE_GPS", "PHOTO_EXIF"]
    assert complaint["sla_hours"] in [12, 24]
    assert complaint["sla_deadline"] is not None
    assert complaint["sla_status"] == "ON_TRACK"
    assert complaint["status"] in ["SUBMITTED", "ASSIGNED"]

    # =========================================================================
    # Step 9: Officer Login & Fetch Complaint
    # =========================================================================
    officer_res = client.post("/api/v1/auth/login", json={
        "email": "officer@nagar.local",
        "password": "Password@123"
    })
    assert officer_res.status_code == 200
    officer_token = officer_res.json()["access_token"]
    officer_headers = {"Authorization": f"Bearer {officer_token}"}

    # Officer retrieves complaint detail
    detail_res = client.get(f"/api/v1/officer/complaints/{public_id}", headers=officer_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["public_id"] == public_id

    # =========================================================================
    # Step 10: Officer Sets Status to IN_PROGRESS
    # =========================================================================
    status_res = client.patch(
        f"/api/v1/officer/complaints/{public_id}/status",
        json={"status": "IN_PROGRESS", "note": "Road repair team dispatched with asphalt machinery."},
        headers=officer_headers
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "IN_PROGRESS"

    # =========================================================================
    # Step 11 & 12: Officer Submits Resolution with Evidence
    # =========================================================================
    after_img = Image.new("RGB", (120, 120), color="green")
    after_buf = io.BytesIO()
    after_img.save(after_buf, format="JPEG")
    after_bytes = after_buf.getvalue()

    resolve_res = client.post(
        f"/api/v1/officer/complaints/{public_id}/resolve",
        data={
            "resolution_note": "Pothole filled with cold asphalt mix, roller compacted and leveled.",
            "latitude": 21.145810,
            "longitude": 79.088210
        },
        files={"after_photo": ("resolved_pothole.jpg", after_bytes, "image/jpeg")},
        headers=officer_headers
    )
    assert resolve_res.status_code == 200
    res_data = resolve_res.json()
    assert res_data["status"] == "CITIZEN_VERIFICATION"
    assert len(res_data["resolutions"]) >= 1
    assert res_data["resolutions"][0]["location_match"] is True
    assert res_data["resolutions"][0]["repair_detected"] is True

    # =========================================================================
    # Step 13 & 14: Citizen Verifies Resolution as FIXED -> Becomes CLOSED
    # =========================================================================
    verify_res = client.post(
        f"/api/v1/complaints/{public_id}/verify",
        json={
            "result": "FIXED",
            "rating": 5,
            "feedback": "Excellent quick repair. Road is completely smooth now."
        },
        headers=citizen_headers
    )
    assert verify_res.status_code == 200
    closed_data = verify_res.json()
    assert closed_data["status"] == "CLOSED"
    assert len(closed_data["verifications"]) >= 1
    assert closed_data["verifications"][0]["result"] == "FIXED"

    # =========================================================================
    # Step 15: Notifications Created & Verified
    # =========================================================================
    notif_res = client.get("/api/v1/notifications", headers=citizen_headers)
    assert notif_res.status_code == 200
    notifications = notif_res.json()
    assert len(notifications) >= 2  # complaint_created, verification_required, closed

    # Step 15b: Messaging on complaint
    msg_res = client.post(
        f"/api/v1/complaints/{public_id}/messages",
        json={"message": "Road work looks solid, thank you!"},
        headers=citizen_headers
    )
    assert msg_res.status_code == 201

    get_msgs = client.get(f"/api/v1/complaints/{public_id}/messages")
    assert get_msgs.status_code == 200
    assert len(get_msgs.json()) >= 1
    assert get_msgs.json()[0]["message"] == "Road work looks solid, thank you!"

def test_reopen_workflow(client):
    # Citizen reopens complaint scenario
    # 1. Create complaint
    create_res = client.post(
        "/api/v1/complaints",
        data={
            "title": "Water leakage in colony",
            "description": "Drinking water pipeline leak",
            "latitude": 21.1500,
            "longitude": 79.0800
        }
    )
    assert create_res.status_code == 201
    public_id = create_res.json()["public_id"]

    # Login officer
    officer_res = client.post("/api/v1/auth/login", json={"email": "officer@nagar.local", "password": "Password@123"})
    officer_headers = {"Authorization": f"Bearer {officer_res.json()['access_token']}"}

    # Officer resolves
    client.post(
        f"/api/v1/officer/complaints/{public_id}/resolve",
        data={"resolution_note": "Replaced valve"},
        headers=officer_headers
    )

    # Citizen logs in and verifies NOT_FIXED (reopen)
    citizen_res = client.post("/api/v1/auth/login", json={"email": "citizen@nagar.local", "password": "Password@123"})
    citizen_headers = {"Authorization": f"Bearer {citizen_res.json()['access_token']}"}

    reopen_res = client.post(
        f"/api/v1/complaints/{public_id}/verify",
        json={"result": "NOT_FIXED", "reopen_reason": "Pipe is still dripping water underneath the cover."},
        headers=citizen_headers
    )
    assert reopen_res.status_code == 200
    assert reopen_res.json()["status"] == "REOPENED"

def test_websocket_connection(client):
    with client.websocket_connect("/ws/complaints/NS-1001") as websocket:
        websocket.send_text("ping")
        data = websocket.receive_text()
        assert "NS-1001" in data
