# Norma AI — Architecture & Build Plan

## 1) Product goal

Norma AI is a clinic workflow platform with two user surfaces:

- **Web dashboard** built with **Vite + React + TypeScript + Bootstrap 5 + GSAP**
- **WhatsApp chatbot** powered by **Twilio WhatsApp** + **Gemini 2.5 Flash**

It supports:

- doctor, staff, and admin authentication
- patient registration and identity by **WhatsApp phone number**
- booking, rescheduling, and canceling appointments
- doctor/receptionist operations through both dashboard and WhatsApp
- automatic confirmation and status updates over WhatsApp
- admin management of clinic data and doctor profiles
- bulk patient upload from Excel in both dashboard and WhatsApp
- Gemini analysis of uploaded files and function execution to insert/update MongoDB records

---

## 2) Core architecture

### Frontend
- **Vite React TypeScript**
- **Bootstrap 5** for layout and UI components
- **GSAP** for motion and transitions
- Pages:
  - `/login` for doctor/staff
  - `/dashboard` for doctor/staff operations
  - `/admin` for admin login
  - `/admin-dashboard` for clinic administration
  - `/patients`
  - `/appointments`
  - `/doctors`
  - `/bulk-upload`
  - `/whatsapp-inbox` or activity log view

### Backend
- **Python** API server
- **MongoDB** for persistence
- **Gemini API** for intent parsing, summarization, file analysis, and natural language replies
- **Twilio WhatsApp webhook** for inbound and outbound WhatsApp messages
- **Tools layer** for AI-triggered functions and integrations

### Suggested backend stack
- **FastAPI** for API and webhook handling
- **Pydantic** for schemas
- **PyMongo** or **Motor** for MongoDB access
- **python-dotenv** for environment config
- **openpyxl** or **pandas + openpyxl** for Excel parsing
- **python-multipart** for uploads
- **Twilio Python SDK**
- **Google Gemini SDK / official client**

---

## 3) High-level data flow

### Web dashboard flow
1. Doctor, staff, or admin logs in.
2. JWT is issued after role verification.
3. UI loads role-specific routes and permissions.
4. User performs CRUD actions on appointments, patients, doctors, clinic info, and audit logs.
5. Backend stores data in MongoDB and returns status updates.
6. Optional automation sends WhatsApp notifications using Twilio.

### WhatsApp flow
1. User sends a message to the clinic’s WhatsApp number.
2. Twilio webhook forwards the message to the backend.
3. Backend identifies the sender by **phone number** and loads profile context.
4. Gemini classifies the intent:
   - book appointment
   - reschedule appointment
   - cancel appointment
   - register patient
   - ask doctor/receptionist to act
   - upload bulk Excel file
   - ask status or clinic details
5. Backend either:
   - executes the mapped function immediately, or
   - asks Gemini for the next missing detail, then continues the conversation
6. Backend writes all updates to MongoDB.
7. Twilio sends confirmation/status messages back on WhatsApp.

### Identity model
- The **primary WhatsApp identity key** is the sender phone number in E.164 format.
- Each number maps to one of:
  - patient
  - doctor
  - receptionist/staff
  - admin
- A single phone number should never be reused across roles without explicit admin approval.

---

## 4) Main roles and permissions

### Patient
- register / update own profile
- book appointment
- reschedule own appointment
- cancel own appointment
- receive confirmations and reminders

### Doctor
- view own appointments
- approve/reject updates if needed
- manage patient notes
- upload bulk patients via Excel
- request schedule changes through dashboard or WhatsApp

### Receptionist / Staff
- manage appointments for assigned clinic(s)
- create, reschedule, and cancel bookings
- register patients
- handle WhatsApp requests from patients

### Admin
- manage clinic info
- CRUD doctors, staff, service categories, time slots, and system settings
- review audit logs and message history
- manage permissions and user access

---

## 5) MongoDB collections

### `users`
Stores authentication and role mapping.

Fields:
- `_id`
- `name`
- `phone`
- `email`
- `role` (`patient | doctor | staff | admin`)
- `status`
- `clinicIds`
- `passwordHash` for dashboard logins
- `createdAt`
- `updatedAt`

### `patients`
Fields:
- `_id`
- `userId`
- `fullName`
- `gender`
- `dob`
- `address`
- `medicalNotes`
- `emergencyContact`
- `phone`
- `clinicId`
- `createdAt`
- `updatedAt`

### `doctors`
Fields:
- `_id`
- `userId`
- `fullName`
- `specialization`
- `licenseNumber`
- `clinicId`
- `availability`
- `consultationFee`
- `status`

### `appointments`
Fields:
- `_id`
- `patientId`
- `doctorId`
- `clinicId`
- `scheduledAt`
- `status` (`booked | rescheduled | canceled | completed`)
- `reason`
- `source` (`dashboard | whatsapp | admin | staff`)
- `notes`
- `createdBy`
- `createdAt`
- `updatedAt`

### `messages`
Stores WhatsApp conversation history.

Fields:
- `_id`
- `phone`
- `role`
- `channel` (`whatsapp`)
- `direction` (`inbound | outbound`)
- `text`
- `mediaUrl`
- `intent`
- `relatedEntityId`
- `status`
- `createdAt`

### `clinics`
Fields:
- `_id`
- `name`
- `address`
- `timezone`
- `contactPhone`
- `workingHours`
- `branding`
- `settings`

### `audit_logs`
Fields:
- `_id`
- `actorId`
- `actorRole`
- `action`
- `entityType`
- `entityId`
- `before`
- `after`
- `source`
- `createdAt`

### `upload_jobs`
Fields:
- `_id`
- `uploadedBy`
- `phone`
- `source`
- `filename`
- `mimeType`
- `status`
- `aiSummary`
- `rowCount`
- `successCount`
- `errorCount`
- `createdAt`

---

## 6) Backend folder structure

```text
backend/
  app/
    main.py
    config.py
    api/
      auth.py
      admin.py
      doctors.py
      patients.py
      appointments.py
      whatsapp.py
      uploads.py
      clinics.py
    core/
      security.py
      jwt.py
      permissions.py
      logging.py
    db/
      mongodb.py
      indexes.py
    models/
      user.py
      patient.py
      doctor.py
      appointment.py
      clinic.py
      message.py
      upload_job.py
      audit_log.py
    schemas/
      auth.py
      patient.py
      doctor.py
      appointment.py
      clinic.py
      message.py
      upload.py
    services/
      auth_service.py
      patient_service.py
      doctor_service.py
      appointment_service.py
      clinic_service.py
      notification_service.py
      message_service.py
      upload_service.py
    tools/
      twilio/
        client.py
        whatsapp_sender.py
        webhook_parser.py
      gemini/
        client.py
        intent_router.py
        file_analyzer.py
        response_builder.py
      excel/
        parser.py
        validator.py
        bulk_importer.py
    utils/
      constants.py
      helpers.py
      date_utils.py
      phone_utils.py
    jobs/
      reminders.py
      sync.py
```

### Purpose of `tools/`
The `tools` directory is the integration layer:
- `tools/twilio`: send and receive WhatsApp messages
- `tools/gemini`: interpret prompts, summarize uploads, generate replies
- `tools/excel`: parse and validate Excel files before import

---

## 7) WhatsApp bot behavior

### Core behaviors
- identify sender by phone number
- maintain short conversation state per number
- ask follow-up questions when required
- support natural language booking
- support doctor/staff/admin commands with role-based permissions
- send structured confirmations after every action

### Example intents
- “Book me with Dr. Khan tomorrow at 4 pm”
- “Reschedule my appointment to next Monday”
- “Cancel my booking”
- “Upload this patient list”
- “Show tomorrow’s appointments”
- “Add this doctor profile”
- “Update clinic hours”

### Conversation memory
Store:
- phone number
- role
- last intent
- last entity touched
- pending fields
- conversation state

Use that state to continue incomplete requests without forcing the user to repeat themselves.

---

## 8) Appointment workflow

### Booking
1. User asks to book.
2. Gemini extracts:
   - patient identity
   - preferred doctor or specialization
   - date/time preference
   - clinic
   - reason
3. Backend validates availability.
4. Appointment is created.
5. Confirmation is sent through WhatsApp and dashboard updates in real time.

### Rescheduling
1. User asks to reschedule.
2. Backend finds the current appointment.
3. Gemini collects the new date/time.
4. Appointment is updated.
5. Status message is sent to the user and doctor/staff.

### Cancellation
1. User asks to cancel.
2. Backend checks ownership and policy.
3. Appointment is canceled.
4. WhatsApp confirmation is sent.
5. Audit log is written.

---

## 9) Bulk upload via Excel

### Trigger paths
- Dashboard upload form
- WhatsApp upload request with media attachment

### Flow
1. User uploads `.xlsx` or `.xls`.
2. Backend stores file temporarily.
3. Gemini analyzes the sheet structure and identifies columns.
4. A validation pass checks:
   - required fields
   - duplicates
   - invalid phone numbers
   - invalid dates
   - clinic/doctor references
5. A function call executes bulk insert/update into MongoDB.
6. Results are returned:
   - success count
   - error count
   - row-level validation summary
7. WhatsApp and dashboard both receive the final report.

### Recommended behavior
- do not import automatically if required columns are ambiguous
- show a preview and allow confirm before commit
- save upload job status for traceability

---

## 10) API design

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

### Admin
- `GET /api/admin/clinics`
- `POST /api/admin/clinics`
- `PATCH /api/admin/clinics/:id`
- `DELETE /api/admin/clinics/:id`
- `GET /api/admin/users`
- `POST /api/admin/users`

### Doctors / staff
- `GET /api/doctors`
- `POST /api/doctors`
- `PATCH /api/doctors/:id`
- `DELETE /api/doctors/:id`

### Patients
- `GET /api/patients`
- `POST /api/patients`
- `PATCH /api/patients/:id`
- `DELETE /api/patients/:id`

### Appointments
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id`
- `DELETE /api/appointments/:id`

### WhatsApp
- `POST /api/webhooks/twilio/whatsapp`
- `POST /api/webhooks/twilio/status`

### Uploads
- `POST /api/uploads/excel`
- `GET /api/uploads/jobs/:id`

---

## 11) Security and operational notes

- Put all secrets in `.env`, never in source control.
- Rotate any credentials that were exposed in chat.
- Use JWT with refresh tokens for dashboard sessions.
- Verify Twilio webhook signatures.
- Use RBAC for doctor, staff, and admin permissions.
- Log every write operation to `audit_logs`.
- Rate-limit WhatsApp webhook processing.
- Validate every incoming message before passing it to Gemini.
- Sanitize Excel uploads before importing.

---

## 12) UI structure for the dashboard

### `/login`
- role selection or role-detected login
- phone/email + password
- branded Norma AI login screen

### `/dashboard`
- overview cards
- today’s appointments
- quick actions
- patient search
- appointment table
- WhatsApp activity feed
- bulk upload panel

### `/admin`
- admin sign-in only

### `/admin-dashboard`
- clinic CRUD
- doctor/staff CRUD
- permissions
- audit logs
- system settings
- message history
- upload review queue

### UI style direction
- clean medical dashboard
- responsive layouts
- Bootstrap 5 grid
- GSAP transitions for page enter, modal open, and cards
- fast searchable tables
- status chips and role badges
- timeline view for appointment updates

---

## 13) Suggested implementation phases

### Phase 1
- auth, roles, MongoDB, clinic setup
- dashboard shell
- basic CRUD for doctors, patients, appointments

### Phase 2
- Twilio WhatsApp webhook
- Gemini intent routing
- natural language booking, rescheduling, cancellation

### Phase 3
- bulk Excel upload and validation
- upload job tracking
- WhatsApp notification engine

### Phase 4
- admin controls
- audit logs
- reminders and follow-up automation
- analytics and reporting

---

## 14) Gemini CLI prompt for Norma AI

Use this as a compact prompt for another AI agent or Gemini CLI.

```text
You are designing "Norma AI", a clinic appointment platform with a web dashboard and a WhatsApp chatbot.

Goal:
Build a full-stack architecture using:
- Backend: Python, MongoDB
- AI: Gemini 2.5 Flash
- Messaging: Twilio WhatsApp
- Frontend: Vite + React + TypeScript + Bootstrap 5 + GSAP

Requirements:
1) Patients and doctors can book, reschedule, and cancel appointments from both dashboard and WhatsApp.
2) WhatsApp users are identified by their phone number and conversation context must persist per number.
3) After every successful register/book/reschedule/cancel action, send a WhatsApp update generated with Gemini 2.5 Flash.
4) Doctors and receptionists must be able to manage appointments through the dashboard and by WhatsApp prompts.
5) Admin must have a separate login and dashboard to CRUD clinic info, doctor info, staff, and settings.
6) Doctor/staff dashboard route should be /login -> /dashboard.
7) Admin route should be /admin -> /admin-dashboard.
8) Add a backend tools folder with separate integrations for twilio and gemini.
9) Support bulk patient upload from Excel in both dashboard and WhatsApp.
10) Gemini should analyze the uploaded Excel structure, validate rows, and then trigger a function to insert/update bulk patient data in MongoDB.
11) Every change must be logged in audit logs.
12) Use RBAC, JWT auth, webhook verification, and secure environment variables.

Deliverables:
- plain-language architecture
- backend folder structure
- MongoDB collections and key fields
- API routes
- WhatsApp conversation flow
- bulk upload flow
- dashboard page map
- implementation phases
- production-ready security notes

Constraints:
- Keep the design practical and modular.
- Do not hardcode secrets.
- Use clear function boundaries for tool calls.
- Prefer stateless APIs plus a small conversation-state store.
- Return a concise but complete technical plan.
```

---

## 15) Recommended next build order

1. Backend auth + MongoDB models
2. Twilio webhook + inbound message parser
3. Gemini intent router + booking flow
4. Dashboard shell with role-based routing
5. Appointment CRUD
6. Excel bulk upload pipeline
7. Notifications and audit logs
8. Admin panel and reporting
