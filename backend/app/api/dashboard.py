from fastapi import APIRouter, Depends
from app.db.mongodb import get_db
from app.api.auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    total_patients = await db.patients.count_documents({})
    total_doctors = await db.doctors.count_documents({"is_active": True})
    
    # Appointments for today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    today_appointments = await db.appointments.count_documents({
        "scheduled_at": {"$gte": today_start, "$lt": today_end}
    })
    
    # AI Activity count (simulated from messages + upload jobs)
    messages_count = await db.messages.count_documents({})
    upload_jobs_count = await db.upload_jobs.count_documents({})
    ai_activity = messages_count + upload_jobs_count
    
    # Calculate Efficiency (Completed vs Canceled/Upcoming)
    total_apts = await db.appointments.count_documents({})
    completed_apts = await db.appointments.count_documents({"status": "completed"})
    
    efficiency = "100%"
    if total_apts > 0:
        efficiency_val = (completed_apts / total_apts) * 100
        # If no completions yet, let's show a "readiness" score or base it on non-canceled
        active_apts = await db.appointments.count_documents({"status": {"$ne": "canceled"}})
        efficiency_val = (active_apts / total_apts) * 100 if total_apts > 0 else 100
        efficiency = f"{int(efficiency_val)}%"

    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "today_appointments": today_appointments,
        "ai_interactions": ai_activity,
        "efficiency": efficiency
    }

