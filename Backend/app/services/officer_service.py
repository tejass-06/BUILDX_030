import math
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.officer import Officer
from app.models.user import User
from app.models.complaint import Complaint, ComplaintStatus

# Nagpur Municipal Corporation (NMC) Administrative Zones & Centroids
NAGPUR_ZONES = [
    {
        "name": "Dharampeth Zone",
        "zone_no": 2,
        "lat": 21.1458,
        "lng": 79.0680,
        "keywords": ["dharampeth", "gokulpeth", "ram nagar", "shivaji nagar", "ravinagar", "ramdaspeth", "civil lines", "sadar", "mount road"]
    },
    {
        "name": "Laxmi Nagar Zone",
        "zone_no": 1,
        "lat": 21.1180,
        "lng": 79.0650,
        "keywords": ["laxmi nagar", "bajaj nagar", "pratap nagar", "khamla", "somwarpet", "trimurti nagar", "deonagar", "jaitala"]
    },
    {
        "name": "Hanuman Nagar Zone",
        "zone_no": 3,
        "lat": 21.1220,
        "lng": 79.1050,
        "keywords": ["hanuman nagar", "medical square", "rameshwari", "tukdoji putla", "chandan nagar", "bhagwan nagar", "manewada"]
    },
    {
        "name": "Dhantoli Zone",
        "zone_no": 4,
        "lat": 21.1350,
        "lng": 79.0880,
        "keywords": ["dhantoli", "congress nagar", "rahate colony", "wardha road", "sitabuldi", "mehadia", "lokmat square"]
    },
    {
        "name": "Nehru Nagar Zone",
        "zone_no": 5,
        "lat": 21.1340,
        "lng": 79.1320,
        "keywords": ["nehru nagar", "nandanvan", "sakkardara", "dighori", "bada tajbagh", "kharbi", "wathoda"]
    },
    {
        "name": "Gandhibagh Zone",
        "zone_no": 6,
        "lat": 21.1520,
        "lng": 79.1080,
        "keywords": ["gandhibagh", "itwari", "mahal", "badkas chowk", "resimbagh", "cotton market", "maskasath"]
    },
    {
        "name": "Satranjipura Zone",
        "zone_no": 7,
        "lat": 21.1710,
        "lng": 79.1180,
        "keywords": ["satranjipura", "shanti nagar", "marartoli", "kalamna", "bhandewadi", "mudliar layout"]
    },
    {
        "name": "Lakadganj Zone",
        "zone_no": 8,
        "lat": 21.1550,
        "lng": 79.1480,
        "keywords": ["lakadganj", "pardi", "garoba maidan", "surya nagar", "chhapru nagar", "old bhandara road"]
    },
    {
        "name": "Ashi Nagar Zone",
        "zone_no": 9,
        "lat": 21.1820,
        "lng": 79.1220,
        "keywords": ["ashi nagar", "kamal chowk", "teka naka", "vaishali nagar", "yashodhara nagar", "nari road", "jaripatka"]
    },
    {
        "name": "Mangalwari Zone",
        "zone_no": 10,
        "lat": 21.1780,
        "lng": 79.0720,
        "keywords": ["mangalwari", "koradi road", "mankapur", "godhani", "zingabai takli", "chhaoni", "borgaon", "katol road"]
    }
]

def determine_zone_from_location(
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    address: Optional[str] = None
) -> Dict[str, Any]:
    """
    Identifies the Nagpur Municipal Zone based on coordinates or address keywords.
    """
    # 1. Geographic centroid nearest match if coordinates provided
    if latitude is not None and longitude is not None:
        best_zone = None
        min_dist_sq = float("inf")
        for zone in NAGPUR_ZONES:
            dist_sq = (latitude - zone["lat"]) ** 2 + (longitude - zone["lng"]) ** 2
            if dist_sq < min_dist_sq:
                min_dist_sq = dist_sq
                best_zone = zone
        if best_zone:
            return {
                "name": best_zone["name"],
                "zone_no": best_zone["zone_no"],
                "source": "GEO_COORDINATES",
                "lat": best_zone["lat"],
                "lng": best_zone["lng"]
            }

    # 2. Textual landmark keyword match in address
    if address:
        addr_lower = address.lower()
        for zone in NAGPUR_ZONES:
            for kw in zone["keywords"]:
                if kw in addr_lower:
                    return {
                        "name": zone["name"],
                        "zone_no": zone["zone_no"],
                        "source": "ADDRESS_KEYWORD",
                        "matched_keyword": kw,
                        "lat": zone["lat"],
                        "lng": zone["lng"]
                    }

    # 3. Default fallback zone
    return {
        "name": "Dharampeth Zone",
        "zone_no": 2,
        "source": "DEFAULT_CENTRAL",
        "lat": 21.1458,
        "lng": 79.0680
    }

def get_officer_workload(db: Session, officer_id: int) -> int:
    """Returns number of active/in-progress complaints assigned to an officer."""
    return db.query(Complaint).filter(
        Complaint.officer_id == officer_id,
        Complaint.status.in_([ComplaintStatus.ASSIGNED.value, ComplaintStatus.IN_PROGRESS.value])
    ).count()

def assign_officer_auto(
    db: Session,
    department_id: int,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    address: Optional[str] = None
) -> Tuple[Optional[Officer], Dict[str, Any]]:
    """
    Smart auto officer assignment considering:
    1. Responsible Department
    2. Active Officer Status
    3. Location/Zone matching
    4. Workload balancing (least loaded officer)
    """
    zone_info = determine_zone_from_location(latitude, longitude, address)
    target_zone = zone_info["name"]

    # 1. Fetch active officers in this department
    all_dept_officers = db.query(Officer).join(User).filter(
        Officer.department_id == department_id,
        User.is_active == True
    ).all()

    if not all_dept_officers:
        # Fallback to any active officer if department has no specific assigned officers
        all_dept_officers = db.query(Officer).join(User).filter(User.is_active == True).all()

    if not all_dept_officers:
        return None, {
            "zone": target_zone,
            "assignment_source": "UNASSIGNED",
            "reason": "No active officers found in database."
        }

    # 2. Prefer officers in the target municipal zone
    zone_officers = [o for o in all_dept_officers if o.zone and (target_zone.lower() in o.zone.lower() or o.zone.lower() in target_zone.lower())]

    candidate_pool = zone_officers if zone_officers else all_dept_officers

    # 3. Select candidate with lowest active workload
    best_officer = None
    min_workload = float("inf")

    for off in candidate_pool:
        workload = get_officer_workload(db, off.id)
        if workload < min_workload:
            min_workload = workload
            best_officer = off

    if not best_officer:
        best_officer = candidate_pool[0]
        min_workload = get_officer_workload(db, best_officer.id)

    reason = (
        f"Assigned to {best_officer.user.name if best_officer.user else 'Officer'} ({best_officer.designation}) "
        f"for {target_zone} with current active workload of {min_workload} tasks."
    )

    return best_officer, {
        "zone": target_zone,
        "officer_id": best_officer.id,
        "officer_name": best_officer.user.name if best_officer.user else "Officer",
        "officer_phone": best_officer.user.phone if best_officer.user else None,
        "designation": best_officer.designation,
        "workload": min_workload,
        "assignment_source": "AUTO_ASSIGNMENT",
        "reason": reason
    }
