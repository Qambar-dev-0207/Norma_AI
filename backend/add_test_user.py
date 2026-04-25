import asyncio
import os
import sys
import uuid
from datetime import datetime

# Add backend to path to import app modules
backend_path = os.path.join(os.getcwd(), "backend")
sys.path.append(backend_path)

from app.db.mongodb import connect_to_mongo, get_db
from app.services.whatsapp_service import whatsapp_service

async def add_current_user():
    await connect_to_mongo()
    db = get_db()
    
    phone = "9555708358"
    name = "Abdulrahman"
    
    # Check if patient already exists
    existing = await db.patients.find_one({"phone_number": phone})
    if existing:
        print(f"Patient with number {phone} already exists in NORMA AI.")
        return

    # Prepare clinical record
    patient_uuid = str(uuid.uuid4())
    new_patient = {
        "patient_uuid": patient_uuid,
        "full_name": name,
        "phone_number": phone,
        "email": "abdul@norma.ai",
        "gender": "Male",
        "preferred_language": "ar",
        "is_active": True,
        "total_visits": 0,
        "medical_alerts": ["Initial System Test"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.patients.insert_one(new_patient)
    print(f"Successfully ingested clinical record. ID: {result.inserted_id}")
    
    # Trigger WhatsApp Confirmation
    print(f"Dispatching WhatsApp confirmation to {phone}...")
    await whatsapp_service.send_registration_confirmation(
        to_phone=phone,
        patient_name=name,
        patient_uuid=patient_uuid
    )

if __name__ == "__main__":
    asyncio.run(add_current_user())
