import sys
import os
import uvicorn

# Add the current directory to sys.path so 'app' can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # Import settings here to avoid circular imports during path setup
    from app.config import get_settings
    settings = get_settings()
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port, reload=True)
