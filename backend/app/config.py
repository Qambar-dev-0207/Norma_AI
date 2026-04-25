from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

class Settings(BaseSettings):
    app_name: str = "Norma AI"
    mongodb_uri: str
    mongodb_db_name: str = "norma_ai"
    jwt_secret: str
    gemini_api_key: str
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str
    twilio_whatsapp_enabled: bool = True
    port: int = 5000

    model_config = SettingsConfigDict(env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"), extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
