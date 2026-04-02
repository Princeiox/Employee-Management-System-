from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from app import models, schemas
from app.api import deps
from app.db.database import get_db

router = APIRouter()

@router.post("/punch-in", response_model=schemas.AttendanceResponse)
def punch_in(
    data: Optional[schemas.AttendancePunch] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Registers a punch-in event. 
    If a record for today exists, it treats this as a 'resume' action.
    """
    today = date.today()
    
    # Check if a record for today already exists
    attendance = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.attendance_date == today
    ).first()

    if attendance:
        if attendance.punch_out is None:
             raise HTTPException(status_code=400, detail="You are already on the clock.")
        
        # Resume session
        attendance.punch_in = datetime.now()
        attendance.punch_out = None
        # Safely update location if provided
        if data:
            attendance.latitude = getattr(data, 'latitude', None)
            attendance.longitude = getattr(data, 'longitude', None)
    else:
        # Initial punch of the day
        attendance = models.Attendance(
            user_id=current_user.id,
            punch_in=datetime.now(),
            attendance_date=today,
            working_hours=0.0,
            latitude=getattr(data, 'latitude', None) if data else None,
            longitude=getattr(data, 'longitude', None) if data else None
        )
        db.add(attendance)
    
    db.commit()
    db.refresh(attendance)
    return attendance

@router.post("/punch-out", response_model=schemas.AttendanceResponse)
def punch_out(
    data: schemas.AttendancePunch,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Registers a punch-out event.
    Calculates the duration of the current segment and adds it to the daily total 'working_hours'.
    """
    today = date.today()
    attendance = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.attendance_date == today,
        models.Attendance.punch_out.is_(None)
    ).first()

    if not attendance:
        raise HTTPException(status_code=400, detail="No active punch-in found for today.")
    
    # Handle timezone awareness
    now = datetime.now(attendance.punch_in.tzinfo) if attendance.punch_in.tzinfo else datetime.now()
    
    # Calculate duration of the session segment in hours
    duration = now - attendance.punch_in
    segment_hours = duration.total_seconds() / 3600.0
    
    # Accumulate segment into total daily working_hours
    attendance.working_hours += segment_hours
    attendance.punch_out = now
    
    # Optional: We could also update location on punch out if desired
    if data.latitude and data.longitude:
        attendance.latitude = data.latitude
        attendance.longitude = data.longitude
        
    db.commit()
    db.refresh(attendance)
    return attendance

@router.get("/me", response_model=List[schemas.AttendanceResponse])
def read_own_attendance(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """Retrieves current user's attendance history."""
    return db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id
    ).order_by(models.Attendance.attendance_date.desc(), models.Attendance.created_at.desc()).offset(skip).limit(limit).all()

# HR Administrative Endpoints
@router.get("/all", response_model=List[schemas.AttendanceResponse])
def read_all_attendance(
    skip: int = 0,
    limit: int = 100,
    from_date: date = None,
    to_date: date = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    """HR ONLY: Read all attendance records with optional date filtering."""
    query = db.query(models.Attendance)
    if from_date:
        query = query.filter(models.Attendance.attendance_date >= from_date)
    if to_date:
        query = query.filter(models.Attendance.attendance_date <= to_date)
    return query.order_by(models.Attendance.attendance_date.desc()).offset(skip).limit(limit).all()

@router.get("/user/{user_id}", response_model=List[schemas.AttendanceResponse])
def read_user_attendance(
    user_id: int,
    from_date: date = None,
    to_date: date = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    """HR ONLY: Read specific user's attendance records."""
    query = db.query(models.Attendance).filter(models.Attendance.user_id == user_id)
    if from_date:
        query = query.filter(models.Attendance.attendance_date >= from_date)
    if to_date:
        query = query.filter(models.Attendance.attendance_date <= to_date)
    return query.order_by(models.Attendance.attendance_date.desc()).all()
