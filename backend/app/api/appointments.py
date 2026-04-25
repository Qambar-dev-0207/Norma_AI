from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_db
from app.api.auth import get_current_user
from app.schemas.models import Appointment
from typing import List
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.get("/", response_model=List[dict])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    db = get_db()
    pipeline = [
        {
            "$lookup": {
                "from": "patients",
                "localField": "patient_id",
                "foreignField": "_id",
                "as": "patient"
            }
        },
        {"$unwind": "$patient"},
        {
            "$project": {
                "_id": 1,
                "patient_id": 1,
                "patient_name": "$patient.full_name",
                "patient_phone": "$patient.phone_number",
                "scheduled_at": 1,
                "status": 1,
                "type": 1
            }
        },
        {"$sort": {"scheduled_at": 1}}
    ]
    appointments = await db.appointments.aggregate(pipeline).to_list(length=100)
    for apt in appointments:
        apt["_id"] = str(apt["_id"])
        apt["patient_id"] = str(apt["patient_id"])
        apt["scheduled_at"] = apt["scheduled_at"].isoformat()
    return appointments

@router.post("/")
async def create_appointment(appointment: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    appointment["patient_id"] = ObjectId(appointment["patient_id"])
    if "doctor_id" in appointment:
        appointment["doctor_id"] = ObjectId(appointment["doctor_id"])
    else:
        appointment["doctor_id"] = current_user["_id"]
    
    appointment["scheduled_at"] = datetime.fromisoformat(appointment["scheduled_at"].replace('Z', ''))
    appointment["created_at"] = datetime.utcnow()
    appointment["status"] = appointment.get("status", "upcoming")
    
    result = await db.appointments.insert_one(appointment)
    return {"message": "Appointment created", "id": str(result.inserted_id)}

@router.patch("/{appointment_id}")
async def update_appointment(appointment_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    if "scheduled_at" in update_data:
        update_data["scheduled_at"] = datetime.fromisoformat(update_data["scheduled_at"].replace('Z', ''))
    
    # Don't allow updating ID fields via patch for now or handle them carefully
    if "patient_id" in update_data:
        update_data["patient_id"] = ObjectId(update_data["patient_id"])
    
    result = await db.appointments.find_one_and_update(
        {"_id": ObjectId(appointment_id)},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment updated"}

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.appointments.delete_one({"_id": ObjectId(appointment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"message": "Appointment deleted"}
