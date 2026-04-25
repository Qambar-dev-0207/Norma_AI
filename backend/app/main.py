from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.config import get_settings
from app.api import auth, patients, uploads, dashboard, appointments, webhook, doctors

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(webhook.router, prefix="/api")

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Norma AI API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
