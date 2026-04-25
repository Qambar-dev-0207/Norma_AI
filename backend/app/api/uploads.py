from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.api.auth import get_current_user
from app.tools.excel.parser import parse_excel_with_ai
from app.db.mongodb import get_db
from datetime import datetime
import os
import shutil

router = APIRouter(prefix="/uploads", tags=["uploads"])

@router.post("/excel")
async def upload_excel(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an Excel file.")
    
    # Save file temporarily
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Parse with AI
        result = await parse_excel_with_ai(file_path)
        
        db = get_db()
        inserted_count = 0
        skipped_count = 0
        
        # Bulk insert/update patients
        for record in result["data"]:
            # Map phone to phone_number
            phone_val = str(record.get("phone") or record.get("phone_number"))
            
            # Check for existing patient by phone
            existing = await db.patients.find_one({"phone_number": phone_val})
            if existing:
                skipped_count += 1
                continue
            
            # Prepare new record with all defaults
            import uuid
            new_patient = {
                "patient_uuid": str(uuid.uuid4()),
                "full_name": record.get("full_name"),
                "phone_number": phone_val,
                "email": record.get("email"),
                "gender": record.get("gender", "Other"),
                "address": record.get("address"),
                "medical_alerts": record.get("medical_alerts", []),
                "notes": record.get("notes") or record.get("medical_notes"),
                "preferred_language": "ar",
                "total_visits": 0,
                "is_active": True,
                "created_by": current_user["_id"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await db.patients.insert_one(new_patient)
            inserted_count += 1
            
        # Log the upload job
        job = {
            "uploaded_by": current_user["_id"],
            "filename": file.filename,
            "status": "completed",
            "total_rows": result["total"],
            "inserted": inserted_count,
            "skipped": skipped_count,
            "errors": result["errors"],
            "created_at": datetime.utcnow()
        }
        await db.upload_jobs.insert_one(job)
        
        return {
            "message": "Upload processed successfully",
            "summary": {
                "total": result["total"],
                "inserted": inserted_count,
                "skipped": skipped_count,
                "errors": result["errors"]
            }
        }
    
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)
