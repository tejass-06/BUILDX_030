from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationChannel
from app.websocket.manager import ws_manager

class BaseNotificationAdapter:
    async def send(self, recipient: str, title: str, body: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        raise NotImplementedError

class WhatsAppNotificationAdapter(BaseNotificationAdapter):
    """
    Extensible WhatsApp adapter interface for future production integration.
    Generates standardized WhatsApp notification payloads.
    """
    def format_message(self, complaint_public_id: str, status: str, base_url: str = "http://localhost:3000") -> str:
        return (
            f"🏛️ *NagarSaathi AI — Civic Update*\n\n"
            f"📋 *Complaint ID:* {complaint_public_id}\n"
            f"🔄 *Status:* {status}\n\n"
            f"📍 *Track your complaint here:*\n"
            f"{base_url}/track/{complaint_public_id}\n\n"
            f"_Thank you for helping keep our city clean and safe!_"
        )

    async def send(self, recipient: str, title: str, body: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        # Stubbed for hackathon: formatted for future Twilio/Gupshup/WhatsApp Cloud API
        return True

whatsapp_adapter = WhatsAppNotificationAdapter()

async def create_notification(
    db: Session,
    user_id: int,
    complaint_id: Optional[int],
    notification_type: str,
    title: str,
    body: str,
    channel: NotificationChannel = NotificationChannel.WEB,
    broadcast_ws: bool = True,
    ws_complaint_public_id: Optional[str] = None
) -> Notification:
    """
    Creates persistent notification in database and triggers real-time WebSocket alerts.
    """
    notification = Notification(
        user_id=user_id,
        complaint_id=complaint_id,
        channel=channel.value,
        type=notification_type,
        title=title,
        body=body,
        status="UNREAD",
        created_at=datetime.now(timezone.utc)
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    if broadcast_ws and ws_complaint_public_id:
        await ws_manager.broadcast_to_complaint(
            complaint_id=ws_complaint_public_id,
            event=notification_type,
            data={
                "id": notification.id,
                "title": title,
                "body": body,
                "type": notification_type,
                "created_at": notification.created_at.isoformat()
            }
        )

    return notification
