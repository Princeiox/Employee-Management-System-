import os
from dotenv import load_dotenv

load_dotenv()

def _parse_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]

class Settings:
    PROJECT_NAME: str = "Perfect Systems HR Management System"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./eulogik.db")
    
    # JWT configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_super_secret_key_here_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS configuration
    BACKEND_CORS_ORIGINS: list[str] = _parse_csv(
        os.getenv(
            "BACKEND_CORS_ORIGINS",
            ",".join(
                [
                    "https://employee-management-system-git-main-princeioxs-projects.vercel.app",
                    "https://employee-management-system-princeioxs-projects.vercel.app",
                    "https://employee-management-system-pi-olive.vercel.app",
                    "http://localhost:5173",
                    "http://localhost:3000",
                ]
            ),
        )
    )
    BACKEND_CORS_ORIGIN_REGEX: str = os.getenv(
        "BACKEND_CORS_ORIGIN_REGEX",
        r"https://employee-management-system-.*\.vercel\.app",
    )

settings = Settings()
