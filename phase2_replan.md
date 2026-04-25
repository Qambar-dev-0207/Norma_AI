# Phase 2 Replan: Clinical Sentinel Hardening & Autonomous Execution

Based on the recent WhatsApp integration tests, the Clinical Sentinel requires a structural overhaul to transition from a "stateless chatbot" to a **Stateful, Autonomous Clinical Orchestrator**. 

## Identified Issues & Vulnerabilities

1.  **Identity Mismatches (The "Who am I?" Bug):** Phone numbers from Twilio include country codes (e.g., `+91`), while database entries might have spaces or lack the prefix. This causes the AI to treat returning patients as new users.
2.  **Conversational Amnesia (The Loop Bug):** The AI currently treats every message as an isolated event. It cannot remember context from a previous message (e.g., "Actually, make that 3 PM instead").
3.  **Action Hallucination (The "Fake Booking" Bug):** The AI generates conversational text confirming an appointment (e.g., "You are booked!"), but lacks the underlying programmatic tools to actually write that booking into the MongoDB `appointments` collection.
4.  **Twilio 11200 Timeouts:** Gemini 1.5 Flash can occasionally take longer than 15 seconds to generate a response, causing the synchronous Twilio webhook to timeout and log an Internal Server Error.

---

## The Execution Plan

### Step 1: The "Instant Acknowledge" Webhook Architecture
To completely eliminate Twilio timeouts (Error 11200), we must decouple the incoming webhook from the AI processing time.
*   **Action:** Refactor `render/app/api/webhook.py` to use FastAPI `BackgroundTasks`.
*   **Flow:** Receive message -> Spawn background AI task -> Immediately return empty TwiML (`200 OK`) to Twilio.

### Step 2: Hardened Identity Engine
Implement a robust, format-agnostic lookup system.
*   **Action:** Sanitize all incoming phone numbers by stripping spaces, dashes, and the `+` symbol.
*   **Query:** Use a MongoDB regex query to match the **last 10 digits** of the incoming number against the database.

### Step 3: Persistent Clinical Memory
Give the AI the ability to remember the context of the conversation.
*   **Action:** Create a `conversations` collection in MongoDB.
*   **Flow:** 
    1. Fetch the last 10 messages for the sender's phone number.
    2. Format these messages into a `history` array.
    3. Initialize the Gemini chat session using `model.start_chat(history=...)`.
    4. Save the new user message and the subsequent AI reply to the database.

### Step 4: Autonomous Function Calling (Tools)
Provide the AI with programmatic access to the database so it can execute real clinical actions instead of just talking about them.
*   **Define Python Functions:**
    *   `register_new_patient(full_name, dob, gender)`
    *   `get_available_specialists()`
    *   `lookup_patient_appointments(patient_id)`
    *   `book_clinical_encounter(patient_id, doctor_id, datetime_iso, type)`
    *   `cancel_clinical_encounter(appointment_id)`
*   **Integration:** Pass these functions to the `GenerativeModel(tools=[...])` configuration. When the AI decides an action is needed, execute the corresponding MongoDB query and return the result to the AI.

### Step 5: The "Old vs. New" System Prompt
Update the core instructions to enforce strict workflows.
*   **Old Users:** Greet them by name, state their calculated age, and ask how to assist (Lookup, Book, Cancel).
*   **New Users:** Refuse any booking requests until the `register_new_patient` tool has been successfully executed with Name, DOB, and Gender.

---

## Verification Strategy
Once implemented, we will test:
1.  **Memory:** "Hi, I am John." followed by "What is my name?"
2.  **Action:** "Book Dr. Sarah for tomorrow." -> Verify the document appears in the MongoDB `appointments` collection.
3.  **Lookup:** "When is my appointment?" -> AI must query the DB and respond accurately.