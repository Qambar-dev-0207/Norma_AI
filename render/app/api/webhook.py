from fastapi import APIRouter, Form, Response, BackgroundTasks
from app.services.whatsapp_service import whatsapp_service
from app.services.ai_service import ai_service
from app.db.mongodb import get_db
from datetime import datetime
import traceback

router = APIRouter()

async def process_and_audit(phone: str, message: str):
    """Handles AI logic, replies to patient, and logs the entire exchange."""
    db = get_db()
    try:
        # 1. Log Inbound Message
        print(f"AUDIT [INBOUND]: {phone} -> '{message}'")
        if db is not None:
            await db.messages.insert_one({
                "phone": phone,
                "direction": "inbound",
                "text": message,
                "timestamp": datetime.utcnow()
            })

        # 2. Process with AI
        response_text = await ai_service.process_message(phone, message)
        
        # 3. Dispatch WhatsApp Reply
        await whatsapp_service.send_custom_message(phone, response_text)

        # 4. Log Outbound Response
        print(f"AUDIT [OUTBOUND]: '{response_text}' -> {phone}")
        if db is not None:
            await db.messages.insert_one({
                "phone": phone,
                "direction": "outbound",
                "text": response_text,
                "timestamp": datetime.utcnow()
            })

    except Exception as e:
        print(f"AUDIT CRITICAL ERROR: {e}")
        traceback.print_exc()

@router.post("/webhook")
async def whatsapp_webhook(
    background_tasks: BackgroundTasks,
    Body: str = Form(...),
    From: str = Form(...)
):
    """Gateway entry point. Responds to Twilio instantly and audits in background."""
    try:
        sender_phone = From.replace('whatsapp:', '').strip()
        
        # Dispatch to background audit stream
        background_tasks.add_task(process_and_audit, sender_phone, Body)
        
        # Return 200 OK instantly to Twilio
        return Response(content="OK", media_type="text/plain", status_code=200)
        
    except Exception as e:
        print(f"GATEWAY AUDIT ERROR: {e}")
        return Response(content="OK", status_code=200)
