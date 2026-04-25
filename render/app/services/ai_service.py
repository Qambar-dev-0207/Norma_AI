import google.generativeai as genai
from app.config import get_settings
from app.db.mongodb import get_db
from datetime import datetime
import json
import traceback

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

class AIService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def process_message(self, phone: str, message: str) -> str:
        try:
            # STEP 1: DB CONNECTION
            db = get_db()
            if db is None: return "DEBUG: Database connection is NULL. 🏥"

            # STEP 2: PATIENT LOOKUP
            try:
                clean_phone = "".join(filter(str.isdigit, phone))[-10:]
                patient = await db.patients.find_one({"phone_number": {"$regex": clean_phone}})
            except Exception as e:
                return f"DEBUG: Database Query Failed: {str(e)}"

            # STEP 3: AI GENERATION
            try:
                patient_name = patient['full_name'] if patient else 'New'
                prompt = f"System: Clinical Sentinel. Context: User {phone}, Patient Name: {patient_name}. User Message: {message}. Respond professionally."
                response = await self.model.generate_content_async(prompt)
                return response.text
            except Exception as e:
                return f"DEBUG: Gemini AI Call Failed: {str(e)}"

        except Exception as e:
            print(traceback.format_exc())
            return f"DEBUG: Critical System Error: {str(e)}"

ai_service = AIService()
