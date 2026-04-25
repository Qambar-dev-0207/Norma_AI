from fastapi import APIRouter, Request, Response, BackgroundTasks
from app.services.whatsapp_service import whatsapp_service
from app.services.ai_service import ai_service
from app.db.mongodb import get_db
import traceback

router = APIRouter()

async def process_and_reply(sender_phone: str, incoming_msg: str):
    try:
        print(f"NORMA AI: Processing background task for {sender_phone}")
        response_text = await ai_service.process_message(sender_phone, incoming_msg)
        await whatsapp_service.send_custom_message(sender_phone, response_text)
    except Exception as e:
        print(f"NORMA AI BACKGROUND ERROR: {e}")
        traceback.print_exc()

@router.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        form_data = await request.form()
        incoming_msg = form_data.get('Body', '').strip()
        sender_phone = form_data.get('From', '').replace('whatsapp:', '')
        
        # Immediate 200 OK to Twilio
        background_tasks.add_task(process_and_reply, sender_phone, incoming_msg)
        
        twiml = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
        return Response(content=twiml, media_type="text/xml")
        
    except Exception as e:
        print(f"NORMA AI GATEWAY CRITICAL ERROR: {e}")
        return Response(content='<Response></Response>', media_type="text/xml")

@router.get("/test-db")
async def test_db_connection():
    """Directly test if Render can see your patients in MongoDB."""
    try:
        db = get_db()
        if db is None:
            return {"status": "ERROR", "message": "Database object is None"}
        
        count = await db.patients.count_documents({})
        latest = await db.patients.find_one({}, sort=[("created_at", -1)])
        
        return {
            "status": "SUCCESS",
            "patient_count": count,
            "latest_patient": latest.get("full_name") if latest else "None"
        }
    except Exception as e:
        return {
            "status": "CONNECTION_FAILED",
            "error": str(e),
            "traceback": traceback.format_exc()
        }
