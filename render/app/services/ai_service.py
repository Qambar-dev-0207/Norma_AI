import google.generativeai as genai
from app.config import get_settings
from app.db.mongodb import get_db
from datetime import datetime, timedelta
import uuid
import traceback
import json
from bson import ObjectId

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

class AIService:
    def __init__(self):
        # We use flash for speed and reliability in JSON mode
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.system_instruction = """
        You are NORMA AI Clinical Sentinel.
        You MUST behave as a stateful assistant using database context. You DO NOT rely on memory alone.
        
        INPUT CONTEXT:
        - patient: {{patient_json_or_null}}
        - appointments: {{appointments_array}}
        - recent_messages: {{last_6_messages}}
        
        RULES:
        1. IDENTITY: If patient exists → DO NOT ask for registration.
        2. APPOINTMENT LOGIC: Always verify from appointments[] before responding. 
        3. BOOKING: Require doctor, date, time. Return action: BOOK_APPOINTMENT.
        4. RESCHEDULE: Return action: RESCHEDULE_APPOINTMENT.
        5. CANCEL: Return action: CANCEL_APPOINTMENT.
        6. FETCH: If asked about appointments, return action: GET_APPOINTMENTS.
        
        OUTPUT FORMAT (JSON ONLY):
        {
          "message": "human readable reply",
          "action": "...",
          "data": {...}
        }
        """

    async def process_message(self, phone: str, message: str) -> str:
        try:
            db = get_db()
            
            # 1. Fetch Real-Time Context
            clean_phone = "".join(filter(str.isdigit, phone))[-10:]
            patient = await db.patients.find_one({"phone_number": {"$regex": clean_phone}})
            
            appointments = []
            if patient:
                apts_cursor = db.appointments.find({"patient_id": patient["_id"]}).sort("scheduled_at", -1).limit(5)
                raw_apts = await apts_cursor.to_list(length=5)
                for a in raw_apts:
                    doc = await db.doctors.find_one({"_id": a["doctor_id"]})
                    appointments.append({
                        "id": str(a["_id"]),
                        "doctor": doc["full_name"] if doc else "Unknown",
                        "time": a["scheduled_at"].isoformat(),
                        "status": a["status"],
                        "type": a["type"]
                    })

            history_cursor = db.conversations.find({"phone": phone}).sort("timestamp", -1).limit(6)
            history_list = await history_cursor.to_list(length=6)
            recent_msgs = [{"role": h['role'], "text": h['text']} for h in reversed(history_list)]

            # 2. Build Prompt with Strict JSON variables
            full_prompt = f"""
            {self.system_instruction}

            STATE DATA:
            - patient: {json.dumps(patient, default=str) if patient else "null"}
            - appointments: {json.dumps(appointments)}
            - recent_messages: {json.dumps(recent_msgs)}

            USER INPUT: "{message}"
            """
            
            response = await self.model.generate_content_async(
                full_prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            res_json = json.loads(response.text)
            
            # 3. Execute Actions based on AI JSON
            if res_json.get("action") != "NONE":
                await self.execute_clinical_protocol(res_json["action"], res_json.get("data", {}), phone, patient)

            # 4. Save Conversation
            await db.conversations.insert_one({"phone": phone, "role": "user", "text": message, "timestamp": datetime.utcnow()})
            await db.conversations.insert_one({"phone": phone, "role": "ai", "text": res_json["message"], "timestamp": datetime.utcnow()})

            return res_json["message"]

        except Exception as e:
            print(f"SENTINEL CRITICAL: {traceback.format_exc()}")
            return "The Sentinel is recalibrating its clinical link. Please retry. 🏥"

    async def execute_clinical_protocol(self, action: str, data: dict, phone: str, patient: dict):
        db = get_db()
        try:
            if action == "BOOK_APPOINTMENT" and patient:
                doctor = await db.doctors.find_one({"full_name": {"$regex": data.get('doctorName', ''), "$options": "i"}})
                if doctor:
                    await db.appointments.insert_one({
                        "patient_id": patient["_id"],
                        "doctor_id": doctor["_id"],
                        "scheduled_at": datetime.fromisoformat(data['date'] + "T" + data['time']),
                        "status": "booked",
                        "type": "General Checkup",
                        "source": "whatsapp_orchestrator",
                        "created_at": datetime.utcnow()
                    })
            
            elif action == "CANCEL_APPOINTMENT":
                apt_id = data.get("appointmentId")
                if apt_id:
                    await db.appointments.update_one({"_id": ObjectId(apt_id)}, {"$set": {"status": "canceled"}})

        except Exception as e:
            print(f"PROTOCOL ERROR: {e}")

ai_service = AIService()
