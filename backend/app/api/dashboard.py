from fastapi import APIRouter, Depends
from app.db.mongodb import get_db
from app.api.auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    total_patients = await db.patients.count_documents({})
    
    # Appointments for today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    today_appointments = await db.appointments.count_documents({
        "scheduled_at": {"$gte": today_start, "$lt": today_end}
    })
    
    # AI Activity count (simulated from upload jobs for now)
    ai_activity = await db.upload_jobs.count_documents({})
    
    return {
        "total_patients": total_patients,
        "today_appointments": today_appointments,
        "ai_interactions": ai_activity,
        "efficiency": "94%" # Static placeholder for now
    }
