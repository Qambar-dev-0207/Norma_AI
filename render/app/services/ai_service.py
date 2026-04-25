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
def register_new_patient(full_name: str, dob_yyyy_mm_dd: str, gender: str):
    """Registers a new patient. Use ONLY if KNOWN_PATIENT is None."""
    return {"action": "register", "name": full_name, "dob": dob_yyyy_mm_dd, "gender": gender}

def book_appointment(doctor_name: str, date_yyyy_mm_dd: str, time_hh_mm: str, encounter_type: str = "General Checkup"):
    """Schedules a new appointment."""
    return {"action": "book", "doctor": doctor_name, "date": date_yyyy_mm_dd, "time": time_hh_mm, "type": encounter_type}

def get_patient_appointments():
    """Checks the database for existing appointments."""
    return {"action": "lookup"}

class AIService:
    def __init__(self):
        self.tools = [register_new_patient, book_appointment, get_patient_appointments]
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=self.tools
        )
        self.system_instruction = "You are the NORMA AI Clinical Sentinel. Professionally assist with registration and booking. Current Date: 2026-04-25."

    async def process_message(self, phone: str, message: str) -> str:
        try:
            db = get_db()
            if db is None: return "Clinical database offline. 🏥"

            # 1. Identity Context
            clean_phone = "".join(filter(str.isdigit, phone))[-10:]
            patient = await db.patients.find_one({"phone_number": {"$regex": clean_phone}})
            patient_context = "None"
            if patient:
                age = "N/A"
                if patient.get('date_of_birth'):
                    dob = patient['date_of_birth']
                    if hasattr(dob, 'year'): age = datetime.utcnow().year - dob.year
                patient_context = {"name": patient['full_name'], "age": age, "dob": str(dob) if patient.get('date_of_birth') else "N/A"}

            # 2. History with role-alternation check
            raw_history = await db.conversations.find({"phone": phone}).sort("timestamp", -1).limit(6).to_list(length=6)
            chat_history = []
            for h in reversed(raw_history):
                role = "user" if h['role'] == "user" else "model"
                if not chat_history or chat_history[-1]["role"] != role:
                    chat_history.append({"role": role, "parts": [h['text']]})

            # 3. Secure Chat Session
            chat = self.model.start_chat(history=chat_history)
            doctors = await db.doctors.find({"is_active": True}).to_list(length=10)
            doc_info = "\n".join([f"- {d['full_name']} ({d['specialty']})" for d in doctors])

            prompt = f"SENTINEL PROTOCOL. SENDER: {phone}, KNOWN: {patient_context}, DOCS: {doc_info}, TIME: {datetime.utcnow().isoformat()}. MESSAGE: {message}"
            
            response = await chat.send_message_async(prompt)
            
            # 4. Defensive Part Processing (Process tools before text)
            final_reply = "I am processing your clinical request. 🏥"
            
            if response.candidates and response.candidates[0].content.parts:
                # Check for Tool Calls First
                for part in response.candidates[0].content.parts:
                    if fn := part.function_call:
                        print(f"SENTINEL: Calling tool {fn.name}")
                        result = await self.execute_action(fn.name, fn.args, phone, patient)
                        # Feed the DB result back into the chat
                        follow_up = await chat.send_message_async(f"DATABASE_RESULT: {result}")
                        if follow_up.text: final_reply = follow_up.text
                        return final_reply # Exit early with tool result response

                # If no tool calls, just use the generated text
                if response.text:
                    final_reply = response.text

            return final_reply

        except Exception as e:
            print(f"SENTINEL ERROR: {traceback.format_exc()}")
            return "Sentinel under clinical recalibration. Please retry. 🏥"

    async def execute_action(self, name, args, phone, patient):
        db = get_db()
        try:
            if name == "get_patient_appointments":
                if not patient: return "No patient record found."
                apts = await db.appointments.find({"patient_id": patient["_id"]}).to_list(length=5)
                if not apts: return "No active appointments found."
                res = []
                for a in apts:
                    doc = await db.doctors.find_one({"_id": a["doctor_id"]})
                    res.append(f"- {a['type']} with {doc['full_name']} at {a['scheduled_at']}")
                return "\n".join(res)
            
            elif name == "book_appointment" and patient:
                doc = await db.doctors.find_one({"full_name": {"$regex": args.get('doctor_name', ''), "$options": "i"}})
                if not doc: return "Specialist not found."
                await db.appointments.insert_one({
                    "patient_id": patient["_id"], "doctor_id": doc["_id"],
                    "scheduled_at": datetime.fromisoformat(f"{args['date_yyyy_mm_dd']}T{args['time_hh_mm']}"),
                    "status": "booked", "type": args.get('encounter_type', 'Checkup'), "source": "whatsapp_render", "created_at": datetime.utcnow()
                })
                return "Success: Appointment Booked."
            return "Action failed."
        except Exception as e:
            return f"Error: {str(e)}"

ai_service = AIService()
