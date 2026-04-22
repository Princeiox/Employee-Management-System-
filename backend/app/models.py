from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Date, Enum as SqlEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base

class UserRole(str, enum.Enum):
    """Enumeration of user roles within the organization."""
    EMPLOYEE = "employee"
    HR = "hr"
    MANAGER = "manager"
    TEAM_LEAD = "team_lead"

class LeaveStatus(str, enum.Enum):
    """Enumeration of leave request statuses."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class User(Base):
    """
    User model representing employees and administrators.
    Stores authentication details, profile information, and preferences.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SqlEnum(UserRole), default=UserRole.EMPLOYEE)
    designation = Column(String, nullable=True)
    department = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    theme = Column(String, default="light")
    profile_pic = Column(String, nullable=True)
    cover_pic = Column(String, nullable=True)
    leave_balance = Column(Integer, default=24)
    pref_timesheets = Column(Boolean, default=True)
    pref_alerts = Column(Boolean, default=True)
    github_url = Column(String, nullable=True)
    meet_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    attendance_records = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    leave_requests = relationship("Leave", back_populates="user", foreign_keys="[Leave.user_id]", cascade="all, delete-orphan")
    reviewed_leaves = relationship("Leave", back_populates="reviewer", foreign_keys="[Leave.approved_by]")
    salary = relationship("Salary", uselist=False, back_populates="user", cascade="all, delete-orphan")

class Attendance(Base):
    """
    Attendance model for tracking daily work sessions.
    Supports multiple punch segments per day via the 'working_hours' accumulator.
    """
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    punch_in = Column(DateTime(timezone=True), nullable=False)
    punch_out = Column(DateTime(timezone=True), nullable=True)
    working_hours = Column(Float, nullable=True, default=0.0) # Cumulative hours for the day
    attendance_date = Column(Date, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="attendance_records")

class Leave(Base):
    """
    Leave model for time-off requests.
    Tracks application details, approval status, and reviewer remarks.
    """
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(SqlEnum(LeaveStatus), default=LeaveStatus.PENDING)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    remarks = Column(String, nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="leave_requests")
    reviewer = relationship("User", foreign_keys=[approved_by], back_populates="reviewed_leaves")

class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(Base):
    """
    Task model for work assignment and tracking.
    Facilitates project management by linking assigned tasks between users.
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(SqlEnum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(String, default="medium")
    due_date = Column(Date, nullable=True)
    
    # Foreign keys for task assignments
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ORM Relationships for easier access to user details
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], backref="tasks_assigned")
    assigned_by = relationship("User", foreign_keys=[assigned_by_id], backref="tasks_created")

class Salary(Base):
    """
    Salary model containing pay structure for an employee.
    """
    __tablename__ = "salaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    basic_salary = Column(Float, default=0.0)
    hra = Column(Float, default=0.0)
    other_allowances = Column(Float, default=0.0)
    
    pf = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    other_deductions = Column(Float, default=0.0)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="salary")

class Message(Base):
    """
    Internal chat system message model.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], backref="received_messages")

class Shortcut(Base):
    """
    User-specific shortcuts for the digital toolbox.
    """
    __tablename__ = "shortcuts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    icon_type = Column(String, default="Globe")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="shortcuts")
