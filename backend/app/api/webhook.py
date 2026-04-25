from fastapi import APIRouter, Request, Response, Depends
from app.services.whatsapp_service import whatsapp_service
from app.services.ai_service import ai_service
from app.db.mongodb import get_db
import logging

router = APIRouter(prefix="/webhook", tags=["webhook"])

@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    form_data = await request.form()
    incoming_msg = form_data.get('Body', '').strip()
    sender_phone = form_data.get('From', '').replace('whatsapp:', '')
    
    logging.info(f"Incoming WhatsApp from {sender_phone}: {incoming_msg}")

    # 1. Hand off to Gemini Intent Router
    response_text = await ai_service.process_message(sender_phone, incoming_msg)
    
    # 2. Reply via WhatsApp
    await whatsapp_service.send_custom_message(sender_phone, response_text)
    
    return Response(content="OK", media_type="text/plain")
