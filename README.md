# NORMA AI — Clinical Workflow Platform

NORMA AI is a high-fidelity clinic management system featuring a real-time medical dashboard and an autonomous WhatsApp AI Receptionist powered by Gemini 1.5 Flash.

## 🚀 System Architecture

### 1. Web Dashboard (Frontend)
- **Stack:** Vite + React + TypeScript + Tailwind CSS v4.
- **Aesthetic:** "Clinical Luminary" Dark Theme.
- **Key Surfaces:**
  - `/dashboard`: Real-time telemetry and clinical oversight.
  - `/admin-dashboard`: Infrastructure monitoring and security audits.
  - `/patients`: Global patient registry (22-field clinical schema).
  - `/appointments`: Schedule orchestration.
  - `/bulk-upload`: AI-driven patient list ingestion.

### 2. Primary Backend (API)
- **Stack:** Python + FastAPI + Motor (MongoDB).
- **Core Engine:** Handles JWT authentication, CRUD operations, and dashboard stats.

### 3. WhatsApp Microservice (Render)
- **Stack:** Lightweight FastAPI + Twilio SDK + Gemini 1.5 Flash.
- **Role:** An autonomous **Clinical Sentinel** that handles:
  - Natural Language Booking.
  - Patient Self-Registration.
  - Appointment Lookups via database integration.
  - Multi-turn conversational memory.

## 🛠️ Local Setup

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python run.py` (Starts on port 5000)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### Seed Data
To populate the database with clinical specialists and test records:
`python backend/seed.py`

## 📱 WhatsApp Bot Testing
1. Ensure the **Render Microservice** is live.
2. Point your **Twilio Sandbox Webhook** to `https://your-app.onrender.com/webhook`.
3. Send **"join [keyword]"** to your Twilio number.
4. Test Identity: *"Hi, who am I?"*
5. Test Booking: *"Book an appointment with Dr. Sarah for tomorrow at 2 PM."*

## 🔒 Security
- Master Admin ID: `norma_admin`
- Default Password: `norma2026`
- **DO NOT** commit the `.env` file.

---
*Stay Healthy, Norma AI Team.*
