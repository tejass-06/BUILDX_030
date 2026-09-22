import os
import urllib.parse
import logging
from typing import Optional, Dict, Any
import httpx

from app.core.config import settings

logger = logging.getLogger("whatsapp_service")

class WhatsAppNotificationService:
    """
    WhatsApp notification service adhering to real civic communication protocols.
    - If Meta WhatsApp Cloud API credentials are configured, sends real API messages.
    - If unconfigured, returns NOT_CONFIGURED status with a pre-formatted deep-link (WhatsApp Ready).
    - NEVER falsely claims delivery without provider confirmation.
    """

    def __init__(self):
        self.provider = os.getenv("WHATSAPP_PROVIDER", "").strip()
        self.access_token = os.getenv("WHATSAPP_ACCESS_TOKEN", "").strip()
        self.phone_number_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "").strip()
        self.business_account_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", "").strip()
        self.api_url = f"https://graph.facebook.com/v18.0/{self.phone_number_id}/messages" if self.phone_number_id else None

    def is_configured(self) -> bool:
        return bool(self.access_token and self.phone_number_id)

    def clean_phone_number(self, phone: Optional[str]) -> str:
        if not phone:
            return "919876543210"
        cleaned = "".join(filter(str.isdigit, phone))
        if len(cleaned) == 10:
            cleaned = "91" + cleaned
        return cleaned

    def build_deeplink(self, phone: Optional[str], text: str) -> str:
        clean_phone = self.clean_phone_number(phone)
        encoded_text = urllib.parse.quote(text)
        return f"https://wa.me/{clean_phone}?text={encoded_text}"

    async def _send_meta_api_message(self, recipient_phone: str, text: str) -> Dict[str, Any]:
        """Attempts actual delivery via Meta Graph API if credentials are provided."""
        clean_phone = self.clean_phone_number(recipient_phone)
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "text",
            "text": {"preview_url": True, "body": text}
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(self.api_url, headers=headers, json=payload)
                if resp.status_code in [200, 201]:
                    data = resp.json()
                    msg_id = data.get("messages", [{}])[0].get("id", "WA-MSG-OK")
                    logger.info(f"WhatsApp message sent successfully: {msg_id}")
                    return {
                        "status": "DELIVERED",
                        "provider": "META_CLOUD_API",
                        "message_id": msg_id,
                        "label": "WhatsApp Sent",
                        "deeplink": self.build_deeplink(recipient_phone, text)
                    }
                else:
                    logger.warning(f"Meta WhatsApp API returned error {resp.status_code}: {resp.text}")
                    return {
                        "status": "FAILED",
                        "provider": "META_CLOUD_API",
                        "error": resp.text,
                        "label": "WhatsApp Failed",
                        "deeplink": self.build_deeplink(recipient_phone, text)
                    }
        except Exception as e:
            logger.error(f"WhatsApp API dispatch exception: {e}")
            return {
                "status": "FAILED",
                "error": str(e),
                "label": "WhatsApp Failed",
                "deeplink": self.build_deeplink(recipient_phone, text)
            }

    async def send_officer_assignment(
        self,
        officer_phone: Optional[str],
        officer_name: str,
        complaint_public_id: str,
        category: str,
        priority: str,
        location: str,
        sla_hours: int,
        track_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends assignment notification to designated civic field officer.
        """
        track_link = track_url or f"http://127.0.0.1:5500/#/complaint/{complaint_public_id}"
        message = (
            f"🏛️ *NagarSaathi AI — New Task Assigned*\n\n"
            f"Officer: *{officer_name}*\n"
            f"📋 *Complaint ID:* {complaint_public_id}\n"
            f"🏷️ *Category:* {category}\n"
            f"⚡ *Priority:* {priority}\n"
            f"📍 *Location:* {location}\n"
            f"⏱️ *SLA:* {sla_hours} hours\n\n"
            f"🔗 *Review & Dispatch:*\n{track_link}\n\n"
            f"_Nagpur Municipal Governance System_"
        )

        if self.is_configured():
            return await self._send_meta_api_message(officer_phone or "", message)

        return {
            "status": "NOT_CONFIGURED",
            "message": "WhatsApp provider not configured. Click to open WhatsApp directly with prefilled message.",
            "label": "WhatsApp Ready",
            "deeplink": self.build_deeplink(officer_phone, message),
            "formatted_message": message
        }

    async def send_citizen_complaint_confirmation(
        self,
        citizen_phone: Optional[str],
        citizen_name: str,
        complaint_public_id: str,
        status: str,
        department_name: str,
        officer_name: Optional[str],
        sla_hours: int,
        track_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends complaint registration receipt to citizen.
        """
        track_link = track_url or f"http://127.0.0.1:5500/#/complaint/{complaint_public_id}"
        assigned_text = officer_name if officer_name else "Assigned to Municipal Nodal Officer"
        message = (
            f"🏛️ *NagarSaathi AI — Grievance Registered*\n\n"
            f"Namaskar *{citizen_name}*,\n"
            f"Your civic grievance has been successfully logged.\n\n"
            f"📋 *Complaint ID:* {complaint_public_id}\n"
            f"🔄 *Status:* {status}\n"
            f"🏢 *Department:* {department_name}\n"
            f"👷 *Officer:* {assigned_text}\n"
            f"⏱️ *Resolution SLA:* {sla_hours} hours\n\n"
            f"📍 *Track Real-time Progress:*\n{track_link}\n\n"
            f"_Together for a cleaner & safer Nagpur._"
        )

        if self.is_configured():
            return await self._send_meta_api_message(citizen_phone or "", message)

        return {
            "status": "NOT_CONFIGURED",
            "message": "WhatsApp provider not configured. Click to open WhatsApp directly with prefilled message.",
            "label": "WhatsApp Ready",
            "deeplink": self.build_deeplink(citizen_phone, message),
            "formatted_message": message
        }

    async def send_status_update(
        self,
        citizen_phone: Optional[str],
        complaint_public_id: str,
        new_status: str,
        note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends live status progress notification to citizen.
        """
        message = (
            f"🏛️ *NagarSaathi AI — Status Update*\n\n"
            f"📋 *Complaint ID:* {complaint_public_id}\n"
            f"🔄 *New Status:* {new_status}\n"
            f"📝 *Update Note:* {note or 'Work has progressed.'}\n\n"
            f"Track: http://127.0.0.1:5500/#/complaint/{complaint_public_id}"
        )

        if self.is_configured():
            return await self._send_meta_api_message(citizen_phone or "", message)

        return {
            "status": "NOT_CONFIGURED",
            "label": "WhatsApp Ready",
            "deeplink": self.build_deeplink(citizen_phone, message),
            "formatted_message": message
        }

    async def send_resolution_notification(
        self,
        citizen_phone: Optional[str],
        complaint_public_id: str,
        officer_note: str,
        verification_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends resolution verification request to citizen.
        """
        verify_link = verification_url or f"http://127.0.0.1:5500/#/complaint/{complaint_public_id}"
        message = (
            f"🏛️ *NagarSaathi AI — Issue Marked Resolved!*\n\n"
            f"📋 *Complaint ID:* {complaint_public_id}\n"
            f"👷 *Officer Note:* {officer_note}\n\n"
            f"⚠️ *Citizen Verification Required:*\n"
            f"Please verify if the work is completed to your satisfaction:\n"
            f"{verify_link}\n\n"
            f"Tap [YES, ISSUE FIXED] or [NO, STILL NOT FIXED]."
        )

        if self.is_configured():
            return await self._send_meta_api_message(citizen_phone or "", message)

        return {
            "status": "NOT_CONFIGURED",
            "label": "WhatsApp Ready",
            "deeplink": self.build_deeplink(citizen_phone, message),
            "formatted_message": message
        }

    def generate_action_deeplink(
        self,
        complaint_public_id: str,
        status: str,
        category: Optional[str] = None,
        recipient_phone: Optional[str] = None,
        officer_name: Optional[str] = None,
        note: Optional[str] = None,
        track_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates a direct prefilled 'WhatsApp Ready' wa.me deep-link for instant manual communication.
        Never claims message delivery since opening wa.me is client-side.
        """
        track_link = track_url or f"http://127.0.0.1:5173/#/complaint/{complaint_public_id}"
        message = (
            f"🏛️ *NagarSaathi AI — Civic Grievance Update*\n\n"
            f"📋 *Complaint ID:* {complaint_public_id}\n"
            f"🔄 *Status:* {status}\n"
        )
        if category:
            message += f"🏷️ *Category:* {category}\n"
        if officer_name:
            message += f"👷 *Officer:* {officer_name}\n"
        if note:
            message += f"📝 *Note:* {note}\n"
        message += f"\n📍 *Live Tracker:* {track_link}\n\n_Nagpur Municipal Smart Governance_"

        clean_phone = self.clean_phone_number(recipient_phone)
        deeplink = self.build_deeplink(recipient_phone, message)

        return {
            "status": "WhatsApp Ready",
            "label": "Open WhatsApp",
            "recipient_phone": clean_phone,
            "complaint_public_id": complaint_public_id,
            "deeplink": deeplink,
            "message": message
        }

whatsapp_service = WhatsAppNotificationService()
