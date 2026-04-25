import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.mongodb import connect_to_mongo, get_db

async def migrate_db():
    await connect_to_mongo()
    db = get_db()
    
    # 1. Patients: Rename 'phone' to 'phone_number'
    result = await db.patients.update_many(
        {"phone": {"$exists": True}},
        {"$rename": {"phone": "phone_number"}}
    )
    print(f"Migrated {result.modified_count} patients (phone -> phone_number)")
    
    # 2. Patients: Ensure 'patient_uuid' exists
    import uuid
    async for patient in db.patients.find({"patient_uuid": {"$exists": False}}):
        await db.patients.update_one(
            {"_id": patient["_id"]},
            {"$set": {"patient_uuid": str(uuid.uuid4())}}
        )
    print("Ensured all patients have UUIDs")

    # 3. Appointments: Rename 'type' (if any old fields exist)
    # No current issues seen but good to have
    
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate_db())
