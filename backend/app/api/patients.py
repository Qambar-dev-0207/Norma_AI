from fastapi import APIRouter, Depends, HTTPException, Body
from app.db.mongodb import get_db
from app.schemas.models import Patient, PatientBase
from app.api.auth import get_current_user
from typing import List
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/", response_model=List[dict])
async def get_patients(current_user: dict = Depends(get_current_user)):
    db = get_db()
    # If doctor, maybe filter by clinic. For now, get all.
    patients_cursor = db.patients.find()
    patients = await patients_cursor.to_list(length=100)
    for p in patients:
        p["_id"] = str(p["_id"])
        if "created_by" in p:
            p["created_by"] = str(p["created_by"])
    return patients

from app.services.whatsapp_service import whatsapp_service

@router.post("/", response_model=Patient)
async def create_patient(patient: PatientBase, current_user: dict = Depends(get_current_user)):
    db = get_db()
    patient_dict = patient.dict()
    patient_dict["created_by"] = current_user["_id"]
    patient_dict["created_at"] = patient_dict["updated_at"] = datetime.utcnow()
    
    result = await db.patients.insert_one(patient_dict)
    patient_dict["_id"] = result.inserted_id
    
    # Trigger WhatsApp Notification
    await whatsapp_service.send_registration_confirmation(
        to_phone=patient.phone_number,
        patient_name=patient.full_name,
        patient_uuid=patient.patient_uuid
    )
    
    return patient_dict

@router.get("/{patient_id}", response_model=Patient)
async def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.patch("/{patient_id}", response_model=Patient)
async def update_patient(patient_id: str, patient_update: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    patient_update["updated_at"] = datetime.utcnow()
    result = await db.patients.find_one_and_update(
        {"_id": ObjectId(patient_id)},
        {"$set": patient_update},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return result

@router.delete("/{patient_id}")
async def delete_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.patients.delete_one({"_id": ObjectId(patient_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted successfully"}
