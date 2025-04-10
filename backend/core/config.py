from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv() # Load .env file if present

# Check if we are in a testing environment
TESTING = os.environ.get("TESTING", "False") == "True"

class Settings(BaseSettings):
    PROJECT_NAME: str = "InfluencerTracker"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "influencertracker")
    
    # Set DATABASE_URL based on the TESTING environment variable
    if TESTING:
        DATABASE_URL: str = "sqlite:///test.db"
    else:
        DATABASE_URL: str = os.getenv(
            "DATABASE_URL",
            f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"
        )
    print(TESTING)
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a-very-secret-key-for-testing" if TESTING else os.environ.get("SECRET_KEY"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days for testing, adjust as needed

    class Config:
        env_file = '.env'
        env_file_encoding = 'utf-8'
        case_sensitive = True

settings = Settings() 