from fastapi import APIRouter, Request, Response, Depends, HTTPException
from app.services.whatsapp_service import whatsapp_service
from app.services.ai_service import ai_service
from app.db.mongodb import get_db
from app.api.auth import get_current_user
from datetime import datetime
from typing import List
from bson import ObjectId
import logging

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request):
    form_data = await request.form()
    incoming_msg = form_data.get('Body', '').strip()
    sender_phone = form_data.get('From', '').replace('whatsapp:', '')
    
    db = get_db()
    
    # 1. Store Incoming Message
    message_obj = {
        "phone": sender_phone,
        "content": incoming_msg,
        "direction": "inbound",
        "timestamp": datetime.utcnow(),
        "is_read": False
    }
    await db.messages.insert_one(message_obj)

    # 2. Hand off to Gemini Intent Router
    response_text = await ai_service.process_message(sender_phone, incoming_msg)
    
    # 3. Store Outgoing Message
    reply_obj = {
        "phone": sender_phone,
        "content": response_text,
        "direction": "outbound",
        "timestamp": datetime.utcnow(),
        "is_read": True
    }
    await db.messages.insert_one(reply_obj)

    # 4. Reply via WhatsApp
    await whatsapp_service.send_custom_message(sender_phone, response_text)
    
    return Response(content="OK", media_type="text/plain")

@router.get("/threads")
async def get_message_threads(db=Depends(get_db), current_user=Depends(get_current_user)):
    """Groups messages by phone number to create threads for the Inbox."""
    pipeline = [
        {"$sort": {"timestamp": -1}},
        {
            "$group": {
                "_id": "$phone",
                "last_message": {"$first": "$content"},
                "last_timestamp": {"$first": "$timestamp"},
                "unread_count": {
                    "$sum": {"$cond": [{"$eq": ["$is_read", False]}, 1, 0]}
                }
            }
        },
        {"$sort": {"last_timestamp": -1}}
    ]
    threads = await db.messages.aggregate(pipeline).to_list(length=100)
    
    # Enrich with patient names if possible
    for thread in threads:
        patient = await db.patients.find_one({"phone_number": thread["_id"]})
        thread["patient_name"] = patient["full_name"] if patient else "New Contact"
        
    return threads

@router.get("/{phone}")
async def get_thread_history(phone: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    """Returns the full conversation history for a specific phone number."""
    messages = await db.messages.find({"phone": phone}).sort("timestamp", 1).to_list(length=100)
    
    # Mark as read
    await db.messages.update_many({"phone": phone, "is_read": False}, {"$set": {"is_read": True}})
    
    # Helper: Convert BSON to JSON serializable
    for msg in messages:
        msg["_id"] = str(msg["_id"])
        
    return messages

@router.post("/send")
async def send_message(
    phone: str, 
    content: str, 
    db=Depends(get_db), 
    current_user=Depends(get_current_user)
):
    """Sends an outbound WhatsApp message from the dashboard."""
    # 1. Store Outgoing Message
    message_obj = {
        "phone": phone,
        "content": content,
        "direction": "outbound",
        "timestamp": datetime.utcnow(),
        "is_read": True
    }
    result = await db.messages.insert_one(message_obj)
    
    # 2. Send via Twilio
    await whatsapp_service.send_custom_message(phone, content)
    
    return {"status": "sent", "message_id": str(result.inserted_id)}
