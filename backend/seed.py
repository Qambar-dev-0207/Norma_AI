import asyncio
import motor.motor_asyncio
from app.core.security import get_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
from bson import ObjectId
import uuid

load_dotenv()

async def seed_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    db = client["norma_ai"]
    
    # 1. Clear Collections
    await db.users.delete_many({})
    await db.doctors.delete_many({})
    await db.operating_hours.delete_many({})
    await db.patients.delete_many({})
    await db.appointments.delete_many({})
    print("Cleared clinical database.")

    # 2. Seed Admin & Staff Users
    admin_id = ObjectId()
    admin_user = {
        "_id": admin_id,
        "phone_number": "norma_admin",
        "name": "Norma System Admin",
        "email": "admin@norma.ai",
        "role": "admin",
        "status": "active",
        "password_hash": get_password_hash("norma2026"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(admin_user)

    # 3. Seed Doctors
    doc1_id = ObjectId()
    doc1 = {
        "_id": doc1_id,
        "doctor_uuid": str(uuid.uuid4()),
        "full_name": "Dr. Sarah Connor",
        "full_name_ar": "د. سارة كونور",
        "specialty": "Cardiology",
        "license_number": "LC-2026-9901",
        "whatsapp_number": "+971501234567",
        "email": "sarah@norma.ai",
        "phone": "+971501234567",
        "consultation_fee": 500.00,
        "bio": "Expert in cardiovascular systems and AI diagnostics.",
        "bio_ar": "خبيرة في أنظمة القلب والأوعية الدموية والتشخيص بالذكاء الاصطناعي.",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    doc2_id = ObjectId()
    doc2 = {
        "_id": doc2_id,
        "doctor_uuid": str(uuid.uuid4()),
        "full_name": "Dr. Gregory House",
        "full_name_ar": "د. غريغوري هاوس",
        "specialty": "Diagnostic Medicine",
        "license_number": "LC-2026-8802",
        "whatsapp_number": "+971509876543",
        "email": "house@norma.ai",
        "phone": "+971509876543",
        "consultation_fee": 750.00,
        "bio": "Specialist in resolving complex clinical anomalies.",
        "bio_ar": "متخصص في حل الحالات السريرية المعقدة.",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.doctors.insert_many([doc1, doc2])
    print("Seeded 2 Clinical Nodes (Doctors).")

    # 4. Seed Operating Hours (Simple Mon-Fri 9-5 for both)
    hours = []
    for doc_id in [doc1_id, doc2_id]:
        for day in range(1, 6): # Mon-Fri
            hours.append({
                "doctor_id": doc_id,
                "day_of_week": day,
                "is_open": True,
                "open_time": "09:00",
                "close_time": "17:00",
                "break_start_time": "13:00",
                "break_end_time": "14:00",
                "effective_from": datetime.utcnow(),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
    await db.operating_hours.insert_many(hours)
    print("Orchestrated clinical operating hours.")

    # 5. Seed Patients
    p1_id = ObjectId()
    p1 = {
        "_id": p1_id,
        "patient_uuid": "a463aece-f9ce-4bbf-85da-6f417966981f",
        "full_name": "Abdul Rahman",
        "phone_number": "+91 95555708358",
        "email": "123@gmail.com",
        "date_of_birth": datetime.fromisoformat("2003-08-08T00:00:00.000Z".replace('Z', '')),
        "gender": "Male",
        "address": "",
        "emergency_contact_name": "Zahira Khatoon ",
        "emergency_contact_phone": "80005450826",
        "preferred_language": "en",
        "first_visit_date": None,
        "last_visit_date": None,
        "total_visits": 0,
        "medical_alerts": ["lucknow"],
        "insurance_provider": "AXA",
        "insurance_id": "12130893456",
        "notes": "",
        "created_by": admin_id,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    p2_id = ObjectId()
    p2 = {
        "_id": p2_id,
        "patient_uuid": str(uuid.uuid4()),
        "full_name": "John Smith",
        "phone_number": "+971550001111",
        "email": "john@example.com",
        "gender": "Male",
        "preferred_language": "ar",
        "is_active": True,
        "created_by": admin_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.patients.insert_many([p1, p2])
    print("Seeded global patient identifiers.")

    # 6. Seed Appointments
    apts = [
        {
            "patient_id": p1_id,
            "doctor_id": doc1_id,
            "scheduled_at": datetime.utcnow(),
            "status": "booked",
            "type": "General Checkup",
            "created_at": datetime.utcnow()
        },
        {
            "patient_id": p2_id,
            "doctor_id": doc2_id,
            "scheduled_at": datetime.utcnow(),
            "status": "booked",
            "type": "Anomalous Diagnostic",
            "created_at": datetime.utcnow()
        }
    ]
    await db.appointments.insert_many(apts)
    print("Syncing initial encounters.")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_db())
