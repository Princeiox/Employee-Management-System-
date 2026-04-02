from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from app.models import UserRole, LeaveStatus, TaskStatus

# --- Authentication & Token ---

class Token(BaseModel):
    """Schema for OAuth2 token response."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Internal data structure for decoded tokens."""
    email: Optional[str] = None
    role: Optional[str] = None

# --- User Management ---

class UserBase(BaseModel):
    """Base schema for User data across operations."""
    employee_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    role: UserRole = UserRole.EMPLOYEE
    profile_pic: Optional[str] = None
    cover_pic: Optional[str] = None
    leave_balance: int = 24
    pref_timesheets: bool = True
    pref_alerts: bool = True
    github_url: Optional[str] = None
    meet_url: Optional[str] = None

class UserCreate(UserBase):
    """Schema for new user registration."""
    password: str

class UserUpdate(BaseModel):
    """Schema for updating user profile details."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    github_url: Optional[str] = None
    meet_url: Optional[str] = None

class UserUpdateTheme(BaseModel):
    """Schema for theme preference updates."""
    theme: str

class UserUpdateProfilePic(BaseModel):
    """Schema for profile picture updates."""
    profile_pic: str

class UserUpdateCoverPic(BaseModel):
    """Schema for cover photo updates."""
    cover_pic: str

class UserUpdatePrefs(BaseModel):
    """Schema for notification and display preferences."""
    pref_timesheets: Optional[bool] = None
    pref_alerts: Optional[bool] = None

class UserPasswordUpdate(BaseModel):
    """Schema for password change operations."""
    current_password: str
    new_password: str

class UserResponse(UserBase):
    """Schema for user data in API responses."""
    id: int
    is_active: bool
    theme: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Attendance tracking ---

class AttendancePunch(BaseModel):
    """Schema for punching in/out with geolocation."""
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AttendanceResponse(BaseModel):
    """Schema for attendance record details."""
    id: int
    user_id: int
    punch_in: datetime
    punch_out: Optional[datetime] = None
    working_hours: float
    attendance_date: date
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- Leave Management ---

class LeaveCreate(BaseModel):
    """Schema for submitting a new leave request."""
    from_date: date
    to_date: date
    reason: str

class LeaveUpdate(BaseModel):
    """Schema for reviewing a leave request (HR)."""
    status: LeaveStatus
    remarks: Optional[str] = None

class LeaveResponse(BaseModel):
    """Schema for leave request details in API responses."""
    id: int
    user_id: int
    from_date: date
    to_date: date
    reason: str
    status: LeaveStatus
    remarks: Optional[str] = None
    applied_at: datetime
    approved_by: Optional[int] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- Task Management ---

class TaskCreate(BaseModel):
    """Schema for creating individual tasks."""
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[date] = None
    assigned_to_id: int

class TaskUpdate(BaseModel):
    """Schema for task status or detail updates."""
    status: Optional[TaskStatus] = None
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None

class TaskResponse(BaseModel):
    """Schema for task details in API responses."""
    id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: str
    due_date: Optional[date] = None
    assigned_to_id: int
    assigned_by_id: int
    created_at: datetime
    assigned_to: Optional[UserResponse] = None
    assigned_by: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- Payroll & Salary ---

class SalaryBase(BaseModel):
    """Core salary structure fields."""
    basic_salary: float = 0.0
    hra: float = 0.0
    other_allowances: float = 0.0
    pf: float = 0.0
    tax: float = 0.0
    other_deductions: float = 0.0

class SalaryCreate(SalaryBase):
    """Schema for initializing salary for a user."""
    user_id: int

class SalaryUpdate(SalaryBase):
    """Schema for updating an existing salary structure."""
    pass

class SalaryResponse(SalaryBase):
    """Schema for salary information in API responses."""
    id: int
    user_id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- Messaging System ---

class MessageCreate(BaseModel):
    """Schema for sending a new direct message."""
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    """Schema for message history and real-time alerts."""
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    is_read: bool
    sender: Optional[UserResponse] = None
    receiver: Optional[UserResponse] = None

    class Config:
        from_attributes = True

# --- ToolBox Shortcuts ---

class ShortcutBase(BaseModel):
    """Base fields for a personal resource link."""
    title: str
    url: str
    icon_type: Optional[str] = "Globe"

class ShortcutCreate(ShortcutBase):
    """Schema for adding a new shortcut."""
    pass

class ShortcutResponse(ShortcutBase):
    """Schema for personal links in API responses."""
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
