import asyncio
import os
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv('backend/.env')

async def fix_patient_number():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client['norma_ai']
    
    # Correcting the typo: 95555... -> 9555...
    result = await db.patients.update_one(
        {"full_name": "Abdul Rahman"},
        {"$set": {"phone_number": "+919555708358"}}
    )
    print(f"NORMA AI: Fixed {result.modified_count} clinical record.")

if __name__ == "__main__":
    asyncio.run(fix_patient_number())
