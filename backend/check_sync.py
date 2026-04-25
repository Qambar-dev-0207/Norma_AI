import asyncio
import os
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def check_sync():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client['norma_ai']
    
    # Check for WhatsApp bookings
    wa_apts = await db.appointments.count_documents({'source': 'whatsapp_render'})
    # Check for new patient registrations
    total_patients = await db.patients.count_documents({})
    # Get latest patient
    latest = await db.patients.find_one(sort=[("created_at", -1)])
    
    print(f"--- SYNC STATUS ---")
    print(f"WhatsApp (Render) Bookings: {wa_apts}")
    print(f"Total Patients in Registry: {total_patients}")
    if latest:
        print(f"Latest Registration: {latest['full_name']} ({latest['phone_number']})")
    print(f"-------------------")

if __name__ == "__main__":
    asyncio.run(check_sync())
