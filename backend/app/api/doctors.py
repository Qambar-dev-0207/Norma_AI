from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime
import traceback

from app.db.mongodb import get_db
from app.schemas.models import Doctor, DoctorBase
from app.api.auth import get_current_user

router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.get("", response_model=List[dict])
async def get_doctors(db=Depends(get_db), current_user=Depends(get_current_user)):
    """Get all doctors"""
    try:
        doctors = await db.doctors.find({"is_active": True}).to_list(length=100)
        # Convert ObjectId to string for JSON serialization
        for doctor in doctors:
            doctor["_id"] = str(doctor["_id"])
        return doctors
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("", response_model=dict)
async def create_doctor(doctor_in: DoctorBase, db=Depends(get_db), current_user=Depends(get_current_user)):
    """Create a new doctor"""
    try:
        doctor_dict = doctor_in.model_dump(exclude_unset=True)
        doctor_dict["created_at"] = datetime.utcnow()
        doctor_dict["updated_at"] = datetime.utcnow()
        
        result = await db.doctors.insert_one(doctor_dict)
        return {"id": str(result.inserted_id), "status": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{doctor_id}", response_model=dict)
async def update_doctor(doctor_id: str, doctor_update: dict, db=Depends(get_db), current_user=Depends(get_current_user)):
    """Update a doctor"""
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(status_code=400, detail="Invalid doctor ID")
            
        doctor_update["updated_at"] = datetime.utcnow()
        
        # Remove _id if it's in the update payload
        doctor_update.pop("_id", None)
        
        result = await db.doctors.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": doctor_update}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found or no changes made")
            
        return {"status": "success", "message": "Doctor updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{doctor_id}", response_model=dict)
async def delete_doctor(doctor_id: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    """Soft delete a doctor"""
    try:
        if not ObjectId.is_valid(doctor_id):
            raise HTTPException(status_code=400, detail="Invalid doctor ID")
            
        result = await db.doctors.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Doctor not found")
            
        return {"status": "success", "message": "Doctor archived successfully"}
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")
