import google.generativeai as genai
from app.config import get_settings
from app.db.mongodb import get_db
from datetime import datetime, timedelta
import uuid
import traceback
from bson import ObjectId

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

# --- CLINICAL TOOLS ---
def register_new_patient(full_name: str, phone_number: str):
    """Registers a new patient. Use this only if the system does not recognize the user."""
    return {"action": "register", "name": full_name, "phone": phone_number}

def book_appointment(patient_phone: str, doctor_name: str, date_time_iso: str, encounter_type: str = "General Checkup"):
    """Books a clinical appointment. date_time_iso format: YYYY-MM-DDTHH:MM:SS."""
    return {"action": "book", "phone": patient_phone, "doctor": doctor_name, "time": date_time_iso, "type": encounter_type}

def get_patient_appointments(patient_phone: str):
    """Retrieves all scheduled appointments for a patient using their phone number."""
    return {"action": "lookup", "phone": patient_phone}

class AIService:
    def __init__(self):
        self.tools = [register_new_patient, book_appointment, get_patient_appointments]
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=self.tools
        )
        self.system_instruction = """
        You are the NORMA AI Clinical Sentinel. 
        Current Date: 2026-04-25. 

        CORE PROTOCOLS:
        1. IDENTITY: If 'KNOWN_PATIENT' has a name, address them by it. 
        2. LOOKUP: If a user asks about their appointments, ALWAYS call 'get_patient_appointments' first.
        3. ACCURACY: Do not tell a user they have no appointments until you have called the lookup tool.
        """

    async def process_message(self, phone: str, message: str) -> str:
        try:
            db = get_db()
            
            # 1. Flexible Identity Match
            clean_phone = "".join(filter(str.isdigit, phone))
            search_digits = clean_phone[-10:]
            patient = await db.patients.find_one({"phone_number": {"$regex": search_digits}})
            
            doctors = await db.doctors.find({"is_active": True}).to_list(length=10)
            doc_info = "\n".join([f"- {d['full_name']} ({d['specialty']})" for d in doctors])

            # 2. History
            history_cursor = db.conversations.find({"phone": phone}).sort("timestamp", -1).limit(10)
            raw_history = await history_cursor.to_list(length=10)
            chat_history = [{"role": "user" if h['role']=="user" else "model", "parts": [h['text']]} for h in reversed(raw_history)]

            # 3. Chat Session
            chat = self.model.start_chat(history=chat_history)
            
            context = f"""
            {self.system_instruction}
            SENDER_PHONE: {phone}
            KNOWN_PATIENT: {patient['full_name'] if patient else "UNKNOWN"}
            SPECIALISTS: {doc_info}
            TIME: {datetime.utcnow().isoformat()}

            USER_MESSAGE: "{message}"
            """
            
            response = await chat.send_message_async(context)
            
            # 4. Save User Message
            await db.conversations.insert_one({"phone": phone, "role": "user", "text": message, "timestamp": datetime.utcnow()})

            # 5. Handle Tools (Now including Lookup)
            final_reply = response.text
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if fn := part.function_call:
                        print(f"SENTINEL EXECUTE: {fn.name}")
                        tool_result = await self.execute_clinical_action(fn.name, fn.args, phone)
                        
                        # Feed tool result back to AI for a final smart answer
                        second_response = await chat.send_message_async(f"TOOL_RESULT for {fn.name}: {tool_result}")
                        final_reply = second_response.text

            # 6. Save AI Reply
            await db.conversations.insert_one({"phone": phone, "role": "ai", "text": final_reply, "timestamp": datetime.utcnow()})

            return final_reply

        except Exception as e:
            print(f"SENTINEL ERROR: {traceback.format_exc()}")
            return "Sentinel calibration error. 🏥"

    async def execute_clinical_action(self, name: str, args: dict, sender_phone: str):
        try:
            db = get_db()
            if name == "get_patient_appointments":
                p_search = "".join(filter(str.isdigit, sender_phone))[-10:]
                patient = await db.patients.find_one({"phone_number": {"$regex": p_search}})
                if not patient: return "No patient record found."
                
                apts = await db.appointments.find({"patient_id": patient["_id"]}).to_list(length=5)
                if not apts: return "No appointments found in database."
                
                res = []
                for a in apts:
                    doc = await db.doctors.find_one({"_id": a["doctor_id"]})
                    res.append(f"- {a['type']} with {doc['full_name']} at {a['scheduled_at']}")
                return "\n".join(res)

            elif name == "book_appointment":
                p_search = "".join(filter(str.isdigit, sender_phone))[-10:]
                patient = await db.patients.find_one({"phone_number": {"$regex": p_search}})
                doctor = await db.doctors.find_one({"full_name": {"$regex": args.get('doctor_name', ''), "$options": "i"}})
                
                if patient and doctor:
                    await db.appointments.insert_one({
                        "patient_id": patient["_id"], "doctor_id": doctor["_id"], 
                        "scheduled_at": datetime.fromisoformat(args['date_time_iso'].replace('Z', '')),
                        "status": "booked", "type": args.get('encounter_type', 'General Checkup'), 
                        "source": "whatsapp_render", "created_at": datetime.utcnow()
                    })
                    return "Success: Appointment booked."
            
            return "Action not supported or failed."
        except Exception as e:
            return f"Error executing tool: {str(e)}"

ai_service = AIService()
