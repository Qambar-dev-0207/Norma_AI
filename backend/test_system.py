import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000/api"
TEST_PHONE = "+1234567890"
TEST_PASSWORD = "testpassword123"

def test_flow():
    token = None
    role = None
    
    print("\n--- Phase 1: Authentication ---")
    # 1. Register
    reg_data = {
        "phone_number": TEST_PHONE,
        "name": "Test Admin",
        "email": "admin@test.com",
        "role": "admin",
        "password": TEST_PASSWORD
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    if res.status_code == 200 or res.status_code == 400: # 400 if already exists
        print("✅ Registration check passed")
    else:
        print(f"❌ Registration failed: {res.text}")
        return

    # 2. Login
    login_data = {
        "username": TEST_PHONE,
        "password": TEST_PASSWORD
    }
    res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if res.status_code == 200:
        token = res.json()["access_token"]
        role = res.json()["role"]
        print(f"✅ Login successful (Role: {role})")
    else:
        print(f"❌ Login failed: {res.text}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- Phase 2: Provider Management (Doctors) ---")
    doctor_data = {
        "full_name": "Dr. Test Specialist",
        "specialty": "Testing",
        "whatsapp_number": "+1112223333",
        "consultation_fee": 150.0
    }
    res = requests.post(f"{BASE_URL}/doctors", json=doctor_data, headers=headers)
    if res.status_code == 200:
        doc_id = res.json()["id"]
        print(f"✅ Doctor created (ID: {doc_id})")
    else:
        print(f"❌ Doctor creation failed: {res.text}")
        return

    print("\n--- Phase 3: Patient Management ---")
    patient_data = {
        "full_name": "John Doe Test",
        "phone_number": "+9998887777",
        "email": "john@test.com",
        "gender": "Male"
    }
    res = requests.post(f"{BASE_URL}/patients", json=patient_data, headers=headers)
    if res.status_code == 200:
        patient_id = res.json()["_id"]
        print(f"✅ Patient created (ID: {patient_id})")
    else:
        print(f"❌ Patient creation failed: {res.text}")
        return

    print("\n--- Phase 4: Appointment Lifecycle ---")
    apt_data = {
        "patient_id": patient_id,
        "doctor_id": doc_id,
        "scheduled_at": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "type": "Test Consult"
    }
    res = requests.post(f"{BASE_URL}/appointments/", json=apt_data, headers=headers)
    if res.status_code == 200:
        apt_id = res.json()["id"]
        print(f"✅ Appointment created (ID: {apt_id})")
    else:
        print(f"❌ Appointment creation failed: {res.text}")
        return

    # Check Appointments List (Testing Lookup)
    res = requests.get(f"{BASE_URL}/appointments/", headers=headers)
    if res.status_code == 200 and len(res.json()) > 0:
        print(f"✅ Appointment lookup verified (Found: {len(res.json())})")
    else:
        print(f"❌ Appointment lookup failed: {res.text}")

    print("\n--- Phase 5: Dashboard Intelligence ---")
    res = requests.get(f"{BASE_URL}/dashboard/stats", headers=headers)
    if res.status_code == 200:
        stats = res.json()
        print(f"✅ Stats verified: {json.dumps(stats)}")
    else:
        print(f"❌ Stats retrieval failed: {res.text}")

    print("\n--- Phase 6: Messaging System ---")
    # Simulate Inbound WhatsApp Webhook
    webhook_data = {
        "From": "whatsapp:+9998887777",
        "Body": "I need help with my test appointment"
    }
    res = requests.post(f"{BASE_URL}/messages/webhook/whatsapp", data=webhook_data)
    if res.status_code == 200:
        print("✅ Inbound webhook processed")
    else:
        print(f"❌ Webhook failed: {res.text}")

    # Check Threads
    res = requests.get(f"{BASE_URL}/messages/threads", headers=headers)
    if res.status_code == 200 and len(res.json()) > 0:
        print(f"✅ Message threads verified (Count: {len(res.json())})")
    else:
        print(f"❌ Thread retrieval failed: {res.text}")

    print("\n--- ALL TESTS COMPLETED ---")

if __name__ == "__main__":
    test_flow()
