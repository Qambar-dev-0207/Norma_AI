from twilio.rest import Client
from app.config import get_settings
import logging

settings = get_settings()

class WhatsAppService:
    def __init__(self):
        self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        self.from_number = f"whatsapp:{settings.twilio_phone_number}"

    async def send_custom_message(self, to_phone: str, body: str):
        try:
            # 1. Truncate to prevent Twilio Error 21617 (Message too long)
            safe_body = body[:1500] if len(body) > 1500 else body

            # 2. Clean number (remove spaces, dashes)
            clean_phone = to_phone.strip().replace(" ", "").replace("-", "")
            
            # 2. Enforce E.164 (ensure it starts with +)
            # Note: If no country code is present, we might need a default, 
            # but for now we'll just ensure the '+' is there for the API.
            if not clean_phone.startswith('+'):
                # Heuristic: if it's 10 digits and starts with 9/8/7 (India), add +91
                if len(clean_phone) == 10:
                    clean_phone = f"+91{clean_phone}"
                else:
                    clean_phone = f"+{clean_phone}"

            to_whatsapp = f"whatsapp:{clean_phone}"
            print(f"TWILIO DISPATCH: Sending to {to_whatsapp}")
            
            message = self.client.messages.create(
                body=safe_body, 
                from_=self.from_number, 
                to=to_whatsapp
            )
            return message.sid
        except Exception as e:
            print(f"NORMA AI ERROR (WhatsApp Service): {e}")
            return None

whatsapp_service = WhatsAppService()
