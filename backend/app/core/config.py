import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Perfect Systems HR Management System"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./eulogik.db")
    
    # JWT configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_super_secret_key_here_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

settings = Settings()
