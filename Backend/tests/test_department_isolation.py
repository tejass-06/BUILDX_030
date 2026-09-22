import pytest
from fastapi.testclient import TestClient
from app.models.department import DepartmentCode

def test_department_auto_routing_and_isolation(client: TestClient):
    # 1. Login with demo citizen
    cit_res = client.post("/api/v1/auth/login", json={"email": "citizen@nagar.local", "password": "Password@123"})
    assert cit_res.status_code == 200
    cit_token = cit_res.json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}

    # 2. Citizen creates Water Complaint
    water_res = client.post(
        "/api/v1/complaints",
        headers=cit_headers,
        data={
            "title": "Severe main pipeline leak near Dharampeth",
            "description": "Clean drinking water leaking continuously on road near Dharampeth Square",
            "address": "Dharampeth, Nagpur",
            "latitude": "21.1458",
            "longitude": "79.0882"
        }
    )
    assert water_res.status_code in [200, 201]
    water_comp = water_res.json()
    assert water_comp["department_code"] == DepartmentCode.WATER.value
    water_comp_id = water_comp["public_id"]

    # 3. Citizen creates Road Complaint
    road_res = client.post(
        "/api/v1/complaints",
        headers=cit_headers,
        data={
            "title": "Deep asphalt pothole causing traffic jam",
            "description": "Massive pothole and broken tarmac near Ashi Nagar Square",
            "address": "Ashi Nagar, Nagpur",
            "latitude": "21.1758",
            "longitude": "79.1182"
        }
    )
    assert road_res.status_code in [200, 201]
    road_comp = road_res.json()
    assert road_comp["department_code"] == DepartmentCode.ROAD.value
    road_comp_id = road_comp["public_id"]

    # 4. Citizen creates Sanitation Complaint
    san_res = client.post(
        "/api/v1/complaints",
        headers=cit_headers,
        data={
            "title": "Overflowing waste dumpster and smell",
            "description": "Garbage dump not cleared for 5 days near Gandhibagh Market",
            "address": "Gandhibagh, Nagpur",
            "latitude": "21.1558",
            "longitude": "79.0982"
        }
    )
    assert san_res.status_code in [200, 201]
    san_comp = san_res.json()
    assert san_comp["department_code"] == DepartmentCode.GARBAGE.value
    san_comp_id = san_comp["public_id"]

    # =========================================================================
    # OFFICER DEPARTMENT ISOLATION TESTS
    # =========================================================================

    # 5. Login as Water Works Officer
    water_off_res = client.post("/api/v1/auth/login", json={"email": "water.officer@nagar.local", "password": "Password@123"})
    assert water_off_res.status_code == 200
    water_off_data = water_off_res.json()
    assert water_off_data["user"]["department_code"] == DepartmentCode.WATER.value
    water_off_headers = {"Authorization": f"Bearer {water_off_data['access_token']}"}

    # Water Officer lists complaints -> ONLY Water complaints must be returned
    water_list_res = client.get("/api/v1/complaints", headers=water_off_headers)
    assert water_list_res.status_code == 200
    water_items = water_list_res.json()
    for item in water_items:
        assert item["department_code"] == DepartmentCode.WATER.value

    # Water Officer can view their own department's complaint
    water_view_res = client.get(f"/api/v1/complaints/{water_comp_id}", headers=water_off_headers)
    assert water_view_res.status_code == 200
    assert water_view_res.json()["public_id"] == water_comp_id

    # Water Officer CANNOT view Road complaint (Strict 403 Forbidden)
    cross_dept_view = client.get(f"/api/v1/complaints/{road_comp_id}", headers=water_off_headers)
    assert cross_dept_view.status_code == 403

    # Water Officer CANNOT modify Road complaint status (Strict 403 Forbidden)
    cross_dept_status = client.patch(
        f"/api/v1/officer/complaints/{road_comp_id}/status",
        headers=water_off_headers,
        json={"status": "IN_PROGRESS", "note": "Attempting unauthorized cross-department update"}
    )
    assert cross_dept_status.status_code == 403

    # 6. Login as Road Officer
    road_off_res = client.post("/api/v1/auth/login", json={"email": "officer@nagar.local", "password": "Password@123"})
    assert road_off_res.status_code == 200
    road_off_data = road_off_res.json()
    assert road_off_data["user"]["department_code"] == DepartmentCode.ROAD.value
    road_off_headers = {"Authorization": f"Bearer {road_off_data['access_token']}"}

    # Road Officer lists complaints -> ONLY Road complaints
    road_list_res = client.get("/api/v1/complaints", headers=road_off_headers)
    assert road_list_res.status_code == 200
    road_items = road_list_res.json()
    for item in road_items:
        assert item["department_code"] == DepartmentCode.ROAD.value

    # Road Officer CANNOT view Sanitation complaint (Strict 403 Forbidden)
    cross_road_to_san = client.get(f"/api/v1/complaints/{san_comp_id}", headers=road_off_headers)
    assert cross_road_to_san.status_code == 403

    # 7. Login as Command Center / Admin (City-wide visibility)
    admin_res = client.post("/api/v1/auth/login", json={"email": "admin@nagar.local", "password": "Password@123"})
    assert admin_res.status_code == 200
    admin_headers = {"Authorization": f"Bearer {admin_res.json()['access_token']}"}

    admin_all_res = client.get("/api/v1/complaints", headers=admin_headers)
    assert admin_all_res.status_code == 200
    admin_items = admin_all_res.json()
    dept_codes = {item["department_code"] for item in admin_items}
    # Admin sees complaints across multiple departments
    assert DepartmentCode.WATER.value in dept_codes or DepartmentCode.ROAD.value in dept_codes

    # Admin can access any complaint
    assert client.get(f"/api/v1/complaints/{water_comp_id}", headers=admin_headers).status_code == 200
    assert client.get(f"/api/v1/complaints/{road_comp_id}", headers=admin_headers).status_code == 200
    assert client.get(f"/api/v1/complaints/{san_comp_id}", headers=admin_headers).status_code == 200
