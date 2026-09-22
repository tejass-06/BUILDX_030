from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from app.models.complaint import Complaint, ComplaintStatus

# Hackathon SLA configuration defaults (hours)
DEFAULT_SLA_CONFIG = {
    "CRITICAL": 12,
    "HIGH": 24,
    "MEDIUM": 48,
    "LOW": 72
}

def get_sla_hours_for_priority(priority: str) -> int:
    return DEFAULT_SLA_CONFIG.get(priority.upper(), 48)

def compute_sla_deadline(created_at: datetime, sla_hours: int) -> datetime:
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return created_at + timedelta(hours=sla_hours)

def evaluate_sla_status(
    created_at: datetime,
    sla_hours: int,
    sla_deadline: Optional[datetime] = None,
    current_status: Optional[str] = None
) -> str:
    """
    Evaluates current SLA compliance state:
    Returns one of: ON_TRACK, WARNING, BREACHED
    """
    if current_status in [ComplaintStatus.CLOSED.value, ComplaintStatus.RESOLVED.value]:
        return "ON_TRACK"

    now = datetime.now(timezone.utc)
    
    if sla_deadline is None:
        sla_deadline = compute_sla_deadline(created_at, sla_hours)
    
    if sla_deadline.tzinfo is None:
        sla_deadline = sla_deadline.replace(tzinfo=timezone.utc)

    if now > sla_deadline:
        return "BREACHED"

    total_duration_sec = sla_hours * 3600
    remaining_sec = (sla_deadline - now).total_seconds()

    # If less than 25% time remains or under 4 hours remaining
    if remaining_sec <= (0.25 * total_duration_sec) or remaining_sec <= 14400:
        return "WARNING"

    return "ON_TRACK"
