# Property of Perfect Systems - Confidential
import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init_db import init_db
from app.api.v1 import auth, users, attendance, leaves, tasks, salary, reports, chat, shortcuts

logger = logging.getLogger(__name__)

# Initialize FastAPI application with project settings
api = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url="/api/v1/openapi.json",
    description="Backend API for Perfect Systems Employee Management Portal"
)

# Database initialization on application startup
@api.on_event("startup")
def startup() -> None:
    """Initialize database tables if they don't exist."""
    init_db()

# Global exception handler for unhandled server-side errors
@api.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Log unhandled exceptions and return a generic 500 error response."""
    logger.exception("Unhandled server error on %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

api.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
api.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
api.include_router(attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])
api.include_router(leaves.router, prefix="/api/v1/leaves", tags=["Leaves"])
api.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
api.include_router(salary.router, prefix="/api/v1/salary", tags=["Salary"])
api.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
api.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
api.include_router(shortcuts.router, prefix="/api/v1/shortcuts", tags=["Shortcuts"])

@api.get("/")
def root():
    return {"message": "Welcome to Perfect Systems Organization API"}

api.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=settings.BACKEND_CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = api
