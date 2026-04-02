# Property of Eulogik Systems - Confidential
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.v1 import auth, users, attendance, leaves, tasks, salary, reports, chat, shortcuts



app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    openapi_url=f"/api/v1/openapi.json"
)

# CORS
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",  # Allow any origin (http/https)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])
app.include_router(leaves.router, prefix="/api/v1/leaves", tags=["Leaves"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(salary.router, prefix="/api/v1/salary", tags=["Salary"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(shortcuts.router, prefix="/api/v1/shortcuts", tags=["Shortcuts"])

@app.get("/")
def root():
    return {"message": "Welcome to Eulogik Organization API"}
