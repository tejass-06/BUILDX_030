def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "nagar-saathi-backend"

def test_user_registration_and_login(client):
    # Register new citizen
    reg_payload = {
        "name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "phone": "+919123456780",
        "password": "SecurePassword@123",
        "role": "CITIZEN"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "priya.sharma@example.com"
    assert reg_data["user"]["role"] == "CITIZEN"

    # Login with credentials
    login_payload = {
        "email": "priya.sharma@example.com",
        "password": "SecurePassword@123"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    token = login_data["access_token"]
    assert token is not None

    # Get /me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "priya.sharma@example.com"
    assert me_data["name"] == "Priya Sharma"

def test_demo_user_logins(client):
    # Test citizen demo login
    res = client.post("/api/v1/auth/login", json={"email": "citizen@nagar.local", "password": "Password@123"})
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "CITIZEN"

    # Test officer demo login
    res = client.post("/api/v1/auth/login", json={"email": "officer@nagar.local", "password": "Password@123"})
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "OFFICER"

    # Test admin demo login
    res = client.post("/api/v1/auth/login", json={"email": "admin@nagar.local", "password": "Password@123"})
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "ADMIN"
