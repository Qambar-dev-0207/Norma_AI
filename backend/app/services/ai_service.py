import google.generativeai as genai
from app.config import get_settings
from app.db.mongodb import get_db
from app.services.whatsapp_service import whatsapp_service
from datetime import datetime
import json
import uuid
from bson import ObjectId

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

# Define Clinical Tools for Gemini
def register_new_patient(full_name: str, phone_number: str, email: str = None, gender: str = "Other"):
    """
    Registers a new patient into the NORMA AI clinical registry.
    Args:
        full_name: Patient's complete legal name.
        phone_number: International format phone number.
        email: Optional email address.
        gender: Male, Female, Other.
    """
    return {"action": "register", "data": {"full_name": full_name, "phone_number": phone_number, "email": email, "gender": gender}}

def book_appointment(patient_phone: str, doctor_name: str, date_time_iso: str, encounter_type: str):
    """
    Books a clinical encounter for a patient with a specific doctor.
    Args:
        patient_phone: The phone number of the patient.
        doctor_name: Full name of the doctor.
        date_time_iso: ISO 8601 formatted date and time (e.g. 2026-04-25T14:30:00).
        encounter_type: Purpose of visit (e.g. Consultation, Follow-up).
    """
    return {"action": "book", "data": {"phone": patient_phone, "doctor": doctor_name, "time": date_time_iso, "type": encounter_type}}

class AIService:
    def __init__(self):
        # Tools registration
        self.tools = [register_new_patient, book_appointment]
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=self.tools
        )
        self.system_instruction = """
        You are the NORMA AI Clinical Sentinel. You have DIRECT access to the clinical database via tools.
        
        CRITICAL PROTOCOL:
        1. If a user is new, use 'register_new_patient' immediately once you have their name.
        2. If a patient wants to book, use 'book_appointment'. Ensure you confirm the doctor and time.
        3. Always respond in the user's language (AR/EN).
        4. Current Year is 2026.
        """

    async def process_message(self, phone: str, message: str) -> str:
        db = get_db()
        patient = await db.patients.find_one({"phone_number": phone})
        doctors = await db.doctors.find({"is_active": True}).to_list(length=10)
        doc_info = "\n".join([f"- {d['full_name']} ({d['specialty']})" for d in doctors])

        chat = self.model.start_chat(enable_automatic_function_calling=True)
        
        context_prompt = f"""
        {self.system_instruction}
        
        SESSION CONTEXT:
        - Sender Phone: {phone}
        - Known Patient: {patient['full_name'] if patient else "NO (New User)"}
        - Available Doctors: {doc_info}
        - Current Time: {datetime.utcnow().isoformat()}
        
        USER MESSAGE: "{message}"
        """

        response = chat.send_message(context_prompt)
        
        # Handle Function Calls in the background
        for part in response.candidates[0].content.parts:
            if fn := part.function_call:
                result = await self.execute_clinical_action(fn.name, fn.args)
                # We could send a follow-up to Gemini with the result, 
                # but for WhatsApp, we usually just return the final text response.
        
        return response.text

    async def execute_clinical_action(self, name: str, args: dict):
        db = get_db()
        print(f"SENTINEL ACTION: {name} with {args}")
        
        if name == "register_new_patient":
            existing = await db.patients.find_one({"phone_number": args['phone_number']})
            if not existing:
                new_patient = {
                    "patient_uuid": str(uuid.uuid4()),
                    "full_name": args['full_name'],
                    "phone_number": args['phone_number'],
                    "email": args.get('email'),
                    "gender": args.get('gender', 'Other'),
                    "is_active": True,
                    "created_at": datetime.utcnow()
                }
                await db.patients.insert_one(new_patient)
                return "Registration Successful"
        
        if name == "book_appointment":
            patient = await db.patients.find_one({"phone_number": args['patient_phone']})
            doctor = await db.doctors.find_one({"full_name": {"$regex": args['doctor_name'], "$options": "i"}})
            
            if patient and doctor:
                new_apt = {
                    "patient_id": patient["_id"],
                    "doctor_id": doctor["_id"],
                    "scheduled_at": datetime.fromisoformat(args['date_time_iso']),
                    "status": "booked",
                    "type": args['encounter_type'],
                    "source": "whatsapp",
                    "created_at": datetime.utcnow()
                }
                await db.appointments.insert_one(new_apt)
                return f"Appointment booked with {doctor['full_name']}"
        
        return "Action Failed"

ai_service = AIService()
