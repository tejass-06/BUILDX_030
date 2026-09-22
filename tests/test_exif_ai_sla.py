import io
from datetime import datetime, timedelta, timezone
from PIL import Image
from app.services.exif_service import extract_exif_gps, resolve_location, compute_image_hash
from app.services.ai_service import fallback_ai_analysis, calculate_geo_distance, verify_resolution_ai
from app.services.sla_service import evaluate_sla_status, compute_sla_deadline
from app.services.duplicate_service import compute_photo_similarity, compute_location_similarity, compute_text_similarity

def test_exif_gps_fallback():
    # 1. Create a dummy image in memory without EXIF
    img = Image.new("RGB", (100, 100), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    result = extract_exif_gps(img_bytes)
    assert result["latitude"] is None
    assert result["longitude"] is None
    assert result["source"] is None
    assert result["image_hash"] is not None

    # Test location priority resolution
    # Case A: Device GPS provided, no EXIF
    lat, lng, src = resolve_location(result["latitude"], result["longitude"], 21.1458, 79.0882, "Nagpur")
    assert lat == 21.1458
    assert lng == 79.0882
    assert src == "DEVICE_GPS"

    # Case B: EXIF provided (overrides device GPS)
    lat, lng, src = resolve_location(21.1738, 79.1165, 21.1458, 79.0882, "Nagpur")
    assert lat == 21.1738
    assert lng == 79.1165
    assert src == "PHOTO_EXIF"

    # Case C: No GPS at all
    lat, lng, src = resolve_location(None, None, None, None, "Manual Address")
    assert lat is None
    assert lng is None
    assert src == "MANUAL"

def test_ai_fallback_keywords():
    # Pothole test
    r1 = fallback_ai_analysis("Huge road pothole", "Deep khadda on main road near school crossing")
    assert r1["category"] == "ROAD_POTHOLE"
    assert r1["responsible_department"] == "ROAD"
    assert r1["severity"] in ["CRITICAL", "HIGH"]
    assert r1["suggested_sla_hours"] in [12, 24]

    # Water leakage test
    r2 = fallback_ai_analysis("Pipeline paani leak", "Drinking water is leaking heavily on street")
    assert r2["category"] == "WATER_LEAKAGE"
    assert r2["responsible_department"] == "WATER"

    # Streetlight test
    r3 = fallback_ai_analysis("Street light band", "The streetlight pole bulb is dark and not working")
    assert r3["category"] == "STREETLIGHT"
    assert r3["responsible_department"] == "STREETLIGHT"

    # Electricity test
    r4 = fallback_ai_analysis("Dangerous live wire spark", "Transformer wire broken and sparking")
    assert r4["category"] == "ELECTRICITY"
    assert r4["responsible_department"] == "ELECTRICITY"
    assert r4["severity"] == "CRITICAL"
    assert r4["suggested_sla_hours"] == 12

def test_sla_status_evaluator():
    now = datetime.now(timezone.utc)
    
    # 1. On Track (just created, 48 hours SLA)
    status_on_track = evaluate_sla_status(now, 48, now + timedelta(hours=40), "SUBMITTED")
    assert status_on_track == "ON_TRACK"

    # 2. Warning (only 2 hours remaining on a 24h SLA)
    status_warning = evaluate_sla_status(now - timedelta(hours=22), 24, now + timedelta(hours=2), "IN_PROGRESS")
    assert status_warning == "WARNING"

    # 3. Breached (past deadline)
    status_breached = evaluate_sla_status(now - timedelta(hours=30), 24, now - timedelta(hours=6), "IN_PROGRESS")
    assert status_breached == "BREACHED"

    # 4. Closed complaint (always on track)
    status_closed = evaluate_sla_status(now - timedelta(hours=50), 24, now - timedelta(hours=26), "CLOSED")
    assert status_closed == "ON_TRACK"

def test_similarity_signals():
    # Text similarity
    sim_high = compute_text_similarity("Deep pothole near school", "Dangerous pothole near the school")
    assert sim_high > 0.4

    sim_low = compute_text_similarity("Streetlight bulb not working", "Garbage dumpster overflowing")
    assert sim_low == 0.0

    # Location distance & similarity
    # Same point
    sim_loc_close = compute_location_similarity(21.1458, 79.0882, 21.1459, 79.0883)
    assert sim_loc_close >= 0.9

    # Far point (e.g., 20km away)
    sim_loc_far = compute_location_similarity(21.1458, 79.0882, 21.3458, 79.2882)
    assert sim_loc_far == 0.0

def test_resolution_verification():
    # Close coordinates
    ver_pass = verify_resolution_ai(
        before_photo_url="/uploads/before.jpg",
        after_photo_url="/uploads/after.jpg",
        comp_lat=21.1458,
        comp_lng=79.0882,
        res_lat=21.1459,
        res_lng=79.0883
    )
    assert ver_pass["location_match"] is True
    assert ver_pass["repair_detected"] is True
    assert ver_pass["confidence"] > 0.8
