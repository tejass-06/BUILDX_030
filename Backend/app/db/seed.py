from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.department import Department, DepartmentCode
from app.models.officer import Officer
from app.models.complaint import Complaint, ComplaintReport, ComplaintStatus, CivicCategory, PriorityLevel, SeverityLevel, LocationSource
from app.models.work import DepartmentWork

DEMO_PASSWORD = "Password@123"

def init_departments(db: Session):
    """Ensures standard municipal departments exist in database."""
    departments_data = [
        {"name": "Road Department", "code": DepartmentCode.ROAD.value, "default_sla_hours": 24},
        {"name": "Water Department", "code": DepartmentCode.WATER.value, "default_sla_hours": 24},
        {"name": "Garbage Department", "code": DepartmentCode.GARBAGE.value, "default_sla_hours": 12},
        {"name": "Drainage Department", "code": DepartmentCode.DRAINAGE.value, "default_sla_hours": 24},
        {"name": "Streetlight Department", "code": DepartmentCode.STREETLIGHT.value, "default_sla_hours": 24},
        {"name": "Electricity Department", "code": DepartmentCode.ELECTRICITY.value, "default_sla_hours": 12},
        {"name": "General Public Grievance", "code": DepartmentCode.OTHER.value, "default_sla_hours": 48}
    ]

    dept_map = {}
    for d in departments_data:
        existing = db.query(Department).filter(Department.code == d["code"]).first()
        if not existing:
            dept = Department(name=d["name"], code=d["code"], default_sla_hours=d["default_sla_hours"])
            db.add(dept)
            db.flush()
            dept_map[d["code"]] = dept
        else:
            dept_map[d["code"]] = existing
    db.commit()
    return dept_map

def run_auto_migrations(db: Session):
    """Ensures newly added columns exist in tables across database backends (SQLite / PostgreSQL)."""
    from sqlalchemy import text, inspect
    bind = db.get_bind()
    inspector = inspect(bind)
    table_names = inspector.get_table_names()

    # Check users table
    if "users" in table_names:
        cols = [c["name"] for c in inspector.get_columns("users")]
        if "profile_photo_url" not in cols:
            db.execute(text("ALTER TABLE users ADD COLUMN profile_photo_url VARCHAR(500)"))
        if "preferred_language" not in cols:
            db.execute(text("ALTER TABLE users ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'en'"))
        db.commit()

def init_db(db: Session):
    """Production startup: creates tables, runs migrations and ensures standard departments are present."""
    Base.metadata.create_all(bind=db.get_bind())
    run_auto_migrations(db)
    init_departments(db)

def seed_demo_data(db: Session):
    """Seeds demo users, officers, complaints, and works for development/test environments."""
    dept_map = init_departments(db)
    # Citizen
    citizen = db.query(User).filter(User.email == "citizen@nagar.local").first()
    if not citizen:
        citizen = User(
            auth_user_id="00000000-0000-0000-0000-000000000001",
            name="Aarav Sharma",
            email="citizen@nagar.local",
            phone="+919876543210",
            password_hash=hash_password(DEMO_PASSWORD),
            role=UserRole.CITIZEN.value
        )
        db.add(citizen)
        db.flush()

    # Officers for all Departments & Zones
    officers_seed = [
        {
            "name": "Rajesh Patil",
            "email": "officer@nagar.local",
            "phone": "+919876543211",
            "dept_code": DepartmentCode.ROAD.value,
            "zone": "Ashi Nagar Zone",
            "designation": "Senior Road Infrastructure Engineer"
        },
        {
            "name": "Sunil Deshmukh",
            "email": "water.officer@nagar.local",
            "phone": "+919876543213",
            "dept_code": DepartmentCode.WATER.value,
            "zone": "Dharampeth Zone",
            "designation": "Executive Water Works Engineer"
        },
        {
            "name": "Vijay Kulkarni",
            "email": "sanitation.officer@nagar.local",
            "phone": "+919876543214",
            "dept_code": DepartmentCode.GARBAGE.value,
            "zone": "Gandhibagh Zone",
            "designation": "Sanitation & Waste Supervisor"
        },
        {
            "name": "Sanjay Raut",
            "email": "drainage.officer@nagar.local",
            "phone": "+919876543215",
            "dept_code": DepartmentCode.DRAINAGE.value,
            "zone": "Hanuman Nagar Zone",
            "designation": "Drainage Operations Specialist"
        },
        {
            "name": "Anand Shinde",
            "email": "electrical.officer@nagar.local",
            "phone": "+919876543216",
            "dept_code": DepartmentCode.STREETLIGHT.value,
            "zone": "Mangalwari Zone",
            "designation": "Streetlight Grid Engineer"
        },
        {
            "name": "Mahesh Gaikwad",
            "email": "power.officer@nagar.local",
            "phone": "+919876543217",
            "dept_code": DepartmentCode.ELECTRICITY.value,
            "zone": "Dhantoli Zone",
            "designation": "Power Distribution Inspector"
        }
    ]

    officer_profile = None
    for idx, off_data in enumerate(officers_seed):
        user = db.query(User).filter(User.email == off_data["email"]).first()
        if not user:
            user = User(
                auth_user_id=f"00000000-0000-0000-0002-00000000000{idx+1}",
                name=off_data["name"],
                email=off_data["email"],
                phone=off_data["phone"],
                password_hash=hash_password(DEMO_PASSWORD),
                role=UserRole.OFFICER.value
            )
            db.add(user)
            db.flush()

        prof = db.query(Officer).filter(Officer.user_id == user.id).first()
        if not prof:
            prof = Officer(
                user_id=user.id,
                department_id=dept_map[off_data["dept_code"]].id,
                zone=off_data["zone"],
                designation=off_data["designation"]
            )
            db.add(prof)
            db.flush()
        if off_data["email"] == "officer@nagar.local":
            officer_profile = prof

    # Admin
    admin_user = db.query(User).filter(User.email == "admin@nagar.local").first()
    if not admin_user:
        admin_user = User(
            auth_user_id="00000000-0000-0000-0003-000000000001",
            name="Commissioner Verma",
            email="admin@nagar.local",
            phone="+919876543212",
            password_hash=hash_password(DEMO_PASSWORD),
            role=UserRole.ADMIN.value
        )
        db.add(admin_user)
        db.flush()

    # 3. Seed Demo Complaints in Nagpur
    now = datetime.now(timezone.utc)
    demo_complaints = [
        {
            "public_id": "NS-1001",
            "citizen_id": citizen.id,
            "title": "Massive pothole near Ashi Nagar Square",
            "description": "Deep dangerous pothole on the main road right near the public school crossing causing severe traffic hazards.",
            "language": "english",
            "category": CivicCategory.ROAD_POTHOLE.value,
            "severity": SeverityLevel.HIGH.value,
            "priority": PriorityLevel.HIGH.value,
            "latitude": 21.1738,
            "longitude": 79.1165,
            "address": "Ashi Nagar Square, North Nagpur",
            "location_source": LocationSource.PHOTO_EXIF.value,
            "department_id": dept_map[DepartmentCode.ROAD.value].id,
            "officer_id": officer_profile.id,
            "status": ComplaintStatus.IN_PROGRESS.value,
            "sla_hours": 24,
            "sla_deadline": now + timedelta(hours=18),
        },
        {
            "public_id": "NS-1002",
            "citizen_id": citizen.id,
            "title": "Major clean water leakage from underground pipeline",
            "description": "Continuous freshwater leakage flooded the street near Mount Road junction since yesterday morning.",
            "language": "english",
            "category": CivicCategory.WATER_LEAKAGE.value,
            "severity": SeverityLevel.HIGH.value,
            "priority": PriorityLevel.HIGH.value,
            "latitude": 21.1592,
            "longitude": 79.0822,
            "address": "Mount Road Junction, Sadar, Nagpur",
            "location_source": LocationSource.DEVICE_GPS.value,
            "department_id": dept_map[DepartmentCode.WATER.value].id,
            "officer_id": None,
            "status": ComplaintStatus.SUBMITTED.value,
            "sla_hours": 24,
            "sla_deadline": now + timedelta(hours=22),
        },
        {
            "public_id": "NS-1003",
            "citizen_id": citizen.id,
            "title": "Overflowing waste dumpster attracting stray cattle",
            "description": "Kachra box is overflowing onto the footpath near the weekly market, foul smell spreading.",
            "language": "mixed_marathi_english",
            "category": CivicCategory.GARBAGE.value,
            "severity": SeverityLevel.MEDIUM.value,
            "priority": PriorityLevel.MEDIUM.value,
            "latitude": 21.1550,
            "longitude": 79.1120,
            "address": "Itwari Market Road, Nagpur",
            "location_source": LocationSource.MANUAL.value,
            "department_id": dept_map[DepartmentCode.GARBAGE.value].id,
            "officer_id": None,
            "status": ComplaintStatus.SUBMITTED.value,
            "sla_hours": 12,
            "sla_deadline": now + timedelta(hours=8),
        },
        {
            "public_id": "NS-1004",
            "citizen_id": citizen.id,
            "title": "Open sewage drain nala without safety slab",
            "description": "Urgent attention needed: Open gutter chamber near bus stop poses critical falling hazard for pedestrians at night.",
            "language": "english",
            "category": CivicCategory.DRAINAGE.value,
            "severity": SeverityLevel.CRITICAL.value,
            "priority": PriorityLevel.CRITICAL.value,
            "latitude": 21.1680,
            "longitude": 79.1020,
            "address": "Kamal Chowk, Ashi Nagar, Nagpur",
            "location_source": LocationSource.DEVICE_GPS.value,
            "department_id": dept_map[DepartmentCode.DRAINAGE.value].id,
            "officer_id": None,
            "status": ComplaintStatus.ASSIGNED.value,
            "sla_hours": 12,
            "sla_deadline": now + timedelta(hours=10),
        },
        {
            "public_id": "NS-1005",
            "citizen_id": citizen.id,
            "title": "Streetlight pole wiring spark and flickering",
            "description": "Streetlight pole #34 flickering and live wire sparking during evening rainfall.",
            "language": "english",
            "category": CivicCategory.STREETLIGHT.value,
            "severity": SeverityLevel.CRITICAL.value,
            "priority": PriorityLevel.CRITICAL.value,
            "latitude": 21.1200,
            "longitude": 79.0600,
            "address": "Wardha Road, Nagpur",
            "location_source": LocationSource.PHOTO_EXIF.value,
            "department_id": dept_map[DepartmentCode.STREETLIGHT.value].id,
            "officer_id": None,
            "status": ComplaintStatus.CLOSED.value,
            "sla_hours": 12,
            "sla_deadline": now - timedelta(hours=2),
        }
    ]

    for c in demo_complaints:
        existing = db.query(Complaint).filter(Complaint.public_id == c["public_id"]).first()
        if not existing:
            comp = Complaint(
                public_id=c["public_id"],
                citizen_id=c["citizen_id"],
                title=c["title"],
                description=c["description"],
                language=c["language"],
                category=c["category"],
                severity=c["severity"],
                priority=c["priority"],
                latitude=c["latitude"],
                longitude=c["longitude"],
                address=c["address"],
                location_source=c["location_source"],
                department_id=c["department_id"],
                officer_id=c["officer_id"],
                status=c["status"],
                sla_hours=c["sla_hours"],
                sla_deadline=c["sla_deadline"],
                created_at=now,
                updated_at=now
            )
            db.add(comp)
            db.flush()

            report = ComplaintReport(
                complaint_id=comp.id,
                citizen_id=c["citizen_id"],
                description=c["description"],
                latitude=c["latitude"],
                longitude=c["longitude"],
                created_at=now
            )
            db.add(report)

    # 4. Seed Department Works for Conflict Detection
    works_data = [
        {
            "department_id": dept_map[DepartmentCode.ROAD.value].id,
            "title": "Asphalt Road Resurfacing & Bitumen Laying",
            "work_type": "Road Construction",
            "latitude": 21.1735,
            "longitude": 79.1160,
            "start_date": now,
            "end_date": now + timedelta(days=7),
            "status": "IN_PROGRESS"
        },
        {
            "department_id": dept_map[DepartmentCode.WATER.value].id,
            "title": "Main Water Supply Pipeline Trench Excavation",
            "work_type": "Pipeline Trenching",
            "latitude": 21.1737,
            "longitude": 79.1162,
            "start_date": now + timedelta(days=1),
            "end_date": now + timedelta(days=8),
            "status": "SCHEDULED"
        },
        {
            "department_id": dept_map[DepartmentCode.ELECTRICITY.value].id,
            "title": "Underground Power Cable Duct Laying",
            "work_type": "Cable Installation",
            "latitude": 21.1205,
            "longitude": 79.0605,
            "start_date": now + timedelta(days=10),
            "end_date": now + timedelta(days=15),
            "status": "SCHEDULED"
        }
    ]

    for w in works_data:
        existing = db.query(DepartmentWork).filter(
            DepartmentWork.department_id == w["department_id"],
            DepartmentWork.title == w["title"]
        ).first()
        if not existing:
            work = DepartmentWork(
                department_id=w["department_id"],
                title=w["title"],
                work_type=w["work_type"],
                latitude=w["latitude"],
                longitude=w["longitude"],
                start_date=w["start_date"],
                end_date=w["end_date"],
                status=w["status"],
                created_at=now
            )
            db.add(work)

    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    try:
        init_db(db)
        print("Database initialized and seeded successfully with demo data.")
    finally:
        db.close()
