from datetime import datetime, timezone
import re
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from app.models.complaint import Complaint, ComplaintReport, ComplaintStatus
from app.services.ai_service import calculate_geo_distance

# Heuristic weights for hackathon demo
WEIGHT_PHOTO = 0.35
WEIGHT_LOCATION = 0.30
WEIGHT_TEXT = 0.25
WEIGHT_TIME = 0.10
DUPLICATE_THRESHOLD = 0.65

def hamming_distance(s1: str, s2: str) -> int:
    """Computes hex hamming distance."""
    if not s1 or not s2:
        return 64
    try:
        val1 = int(s1, 16)
        val2 = int(s2, 16)
        xor_val = val1 ^ val2
        return bin(xor_val).count("1")
    except Exception:
        return 64

def compute_photo_similarity(hash1: Optional[str], hash2: Optional[str]) -> float:
    if not hash1 or not hash2:
        return 0.0
    if hash1 == hash2:
        return 1.0
    dist = hamming_distance(hash1, hash2)
    # Maximum difference for 64-bit hash is 64
    sim = max(0.0, 1.0 - (dist / 32.0))
    return round(sim, 2)

def compute_location_similarity(lat1: Optional[float], lon1: Optional[float], lat2: Optional[float], lon2: Optional[float]) -> float:
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    dist = calculate_geo_distance(lat1, lon1, lat2, lon2)
    if dist is None:
        return 0.0
    
    if dist <= 30.0:
        return 1.0
    elif dist <= 100.0:
        return 0.90
    elif dist <= 250.0:
        return 0.70
    elif dist <= 500.0:
        return 0.40
    elif dist <= 1000.0:
        return 0.15
    return 0.0

def tokenize(text: str) -> set[str]:
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    words = [w.strip() for w in cleaned.split() if len(w.strip()) > 2]
    # Filter common stop words
    stopwords = {"the", "and", "is", "in", "at", "of", "to", "a", "an", "this", "that", "near", "area"}
    return {w for w in words if w not in stopwords}

def compute_text_similarity(t1: str, t2: str) -> float:
    tokens1 = tokenize(t1)
    tokens2 = tokenize(t2)
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return round(len(intersection) / len(union), 2)

def compute_time_similarity(dt1: datetime, dt2: datetime) -> float:
    if not dt1 or not dt2:
        return 0.5
    diff_hours = abs((dt1 - dt2).total_seconds()) / 3600.0
    if diff_hours <= 24:
        return 1.0
    elif diff_hours <= 72:
        return 0.85
    elif diff_hours <= 168: # 7 days
        return 0.60
    elif diff_hours <= 720: # 30 days
        return 0.30
    return 0.10

def check_duplicate_complaint(
    db: Session,
    title: str,
    description: str,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    image_hash: Optional[str] = None,
    category: Optional[str] = None
) -> Dict[str, Any]:
    """
    Checks database for potential duplicate civic complaints using 4 multi-modal signals.
    """
    query = db.query(Complaint).filter(Complaint.status.notin_([ComplaintStatus.CLOSED.value]))
    if category:
        query = query.filter(Complaint.category == category)
    
    existing_complaints = query.order_by(Complaint.created_at.desc()).limit(50).all()
    
    if not existing_complaints:
        return {
            "is_duplicate": False,
            "duplicate_score": 0.0,
            "matched_complaint_id": None,
            "signals": None
        }

    best_match = None
    max_score = 0.0
    best_signals = None

    now = datetime.now(timezone.utc)
    new_text = f"{title} {description}"

    for comp in existing_complaints:
        # Retrieve primary report image hash if available
        first_report = comp.reports[0] if comp.reports else None
        comp_hash = first_report.image_hash if first_report else None
        
        s_photo = compute_photo_similarity(image_hash, comp_hash)
        s_loc = compute_location_similarity(latitude, longitude, comp.latitude, comp.longitude)
        s_text = compute_text_similarity(new_text, f"{comp.title} {comp.description}")
        
        # Ensure timezone-aware comparison
        comp_created = comp.created_at
        if comp_created.tzinfo is None:
            comp_created = comp_created.replace(tzinfo=timezone.utc)
        s_time = compute_time_similarity(now, comp_created)

        # Dynamic weight adjustment if photo or location is missing
        w_photo, w_loc, w_text, w_time = WEIGHT_PHOTO, WEIGHT_LOCATION, WEIGHT_TEXT, WEIGHT_TIME
        if not image_hash or not comp_hash:
            # Shift photo weight towards location and text
            w_loc += 0.20
            w_text += 0.15
            w_photo = 0.0
        
        if latitude is None or comp.latitude is None:
            w_text += 0.20
            w_loc = 0.0

        total_weight = w_photo + w_loc + w_text + w_time
        if total_weight > 0:
            score = (s_photo * w_photo + s_loc * w_loc + s_text * w_text + s_time * w_time) / total_weight
        else:
            score = 0.0

        score = round(score, 2)

        if score > max_score:
            max_score = score
            best_match = comp
            best_signals = {
                "photo": s_photo,
                "location": s_loc,
                "text": s_text,
                "time": s_time
            }

    is_dup = max_score >= DUPLICATE_THRESHOLD and best_match is not None

    return {
        "is_duplicate": is_dup,
        "duplicate_score": max_score,
        "matched_complaint_id": best_match.public_id if (best_match and is_dup) else (best_match.public_id if best_match and max_score > 0.4 else None),
        "signals": best_signals
    }
