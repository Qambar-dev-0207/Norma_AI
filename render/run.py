import uvicorn
import os
import sys

# Add the current directory (render/) to sys.path
# This allows 'import app' to work correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"NORMA AI: Starting WhatsApp Orchestrator on port {port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, log_level="info")
