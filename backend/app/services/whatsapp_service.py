from twilio.rest import Client
from app.config import get_settings
import logging

settings = get_settings()

class WhatsAppService:
    def __init__(self):
        self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        self.from_number = f"whatsapp:{settings.twilio_phone_number}"

    async def send_registration_confirmation(self, to_phone: str, patient_name: str, patient_uuid: str):
        if not settings.twilio_whatsapp_enabled:
            print("WhatsApp integration disabled, skipping notification.")
            return

        try:
            # Clean and Format E.164
            clean_phone = to_phone.strip().replace(" ", "").replace("-", "")
            if not clean_phone.startswith('+'):
                if len(clean_phone) == 10: clean_phone = f"+91{clean_phone}"
                else: clean_phone = f"+{clean_phone}"

            to_whatsapp = f"whatsapp:{clean_phone}"

            message = self.client.messages.create(
                body=f"✨ *NORMA AI: Clinical Registration Complete*\n\nHello {patient_name},\n\nYour clinical profile has been successfully ingested into our network.\n\n*Global ID:* {patient_uuid}\n\nOur AI Sentinel is now monitoring your healthcare journey. You can book or reschedule appointments directly through this chat.\n\n*Stay Healthy,* \nNORMA AI Team",
                from_=self.from_number,
                to=to_whatsapp
            )
            print(f"WhatsApp confirmation sent: {message.sid}")
            return message.sid
        except Exception as e:
            logging.error(f"WhatsApp Notification Failed: {e}")
            return None

    async def send_custom_message(self, to_phone: str, body: str):
        if not settings.twilio_whatsapp_enabled:
            print(f"WhatsApp Debug (Disabled): {body}")
            return

        try:
            if not to_phone.startswith('whatsapp:'):
                to_phone = f"whatsapp:{to_phone}"

            message = self.client.messages.create(
                body=body,
                from_=self.from_number,
                to=to_phone
            )
            return message.sid
        except Exception as e:
            logging.error(f"WhatsApp Custom Message Failed: {e}")
            return None

whatsapp_service = WhatsAppService()
