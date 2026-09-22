def test_analytics_endpoints(client):
    # Overview
    res = client.get("/api/v1/analytics/overview")
    assert res.status_code == 200
    data = res.json()
    assert "total_complaints" in data
    assert "active_complaints" in data
    assert "resolved_complaints" in data
    assert "sla_breached" in data
    assert data["total_complaints"] >= 5

    # Hotspots
    res_hotspots = client.get("/api/v1/analytics/hotspots")
    assert res_hotspots.status_code == 200
    hotspots = res_hotspots.json()
    assert isinstance(hotspots, list)
    assert len(hotspots) > 0

    # Departments
    res_depts = client.get("/api/v1/analytics/departments")
    assert res_depts.status_code == 200
    depts = res_depts.json()
    assert isinstance(depts, list)
    assert len(depts) >= 6

def test_department_works_and_conflicts(client):
    # List works
    res_works = client.get("/api/v1/works")
    assert res_works.status_code == 200
    works = res_works.json()
    assert len(works) >= 2

    # Check detected conflicts
    res_conflicts = client.get("/api/v1/works/conflicts")
    assert res_conflicts.status_code == 200
    conflicts = res_conflicts.json()
    assert "conflict_count" in conflicts
    assert conflicts["conflict_count"] >= 1
    assert "work_1" in conflicts["conflicts"][0]
    assert "work_2" in conflicts["conflicts"][0]
