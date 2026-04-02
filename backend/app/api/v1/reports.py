from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app import models, schemas
from app.db.database import get_db
from app.api import deps

router = APIRouter()

@router.get("/summary")
def get_reports_summary(
    timeframe: str = "month",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    now = datetime.now()
    if timeframe == 'week':
        start_date = now - timedelta(days=7)
    elif timeframe == 'quarter':
        start_date = now - timedelta(days=90)
    elif timeframe == 'year':
        start_date = now - timedelta(days=365)
    else: # month
        start_date = now - timedelta(days=30)
    
    # 1. Avg Work Hours
    # Get all attendance records in timeframe
    attendances = db.query(models.Attendance).filter(models.Attendance.attendance_date >= start_date.date()).all()
    total_hours = sum([a.working_hours for a in attendances if a.working_hours])
    avg_hours = total_hours / len(attendances) if attendances else 0.0

    # 2. Overall Attendance Rate
    # (Present / (Total Users * Days)) roughly. 
    # Simplified: Count unique user-dates in attendance vs Count of Users * Working Days
    total_users = db.query(models.User).filter(models.User.is_active == True).count()
    # Approx working days (excluding weekends)
    days_diff = (now.date() - start_date.date()).days
    # Simple approx working days = days * 5/7
    working_days = max(1, int(days_diff * 5 / 7))
    possible_attendances = total_users * working_days
    actual_attendances = len(attendances)
    attendance_rate = (actual_attendances / possible_attendances * 100) if possible_attendances > 0 else 0
    
    # 3. Approved Absences (Leaves)
    approved_leaves = db.query(models.Leave).filter(
        models.Leave.status == models.LeaveStatus.APPROVED,
        models.Leave.from_date >= start_date.date()
    ).count()

    # 4. Punctuality Rate
    # Count punches before 9:30 AM
    on_time_count = 0
    for a in attendances:
        if a.punch_in:
            limit = a.punch_in.replace(hour=9, minute=30, second=0, microsecond=0)
            if a.punch_in <= limit:
                on_time_count += 1
    punctuality = (on_time_count / len(attendances) * 100) if attendances else 100.0

    return {
        "avg_work_hours": round(avg_hours, 1),
        "attendance_rate": round(min(100, attendance_rate), 1),
        "approved_leaves": approved_leaves,
        "punctuality": round(punctuality, 1)
    }

@router.get("/weekly-trends")
def get_weekly_trends(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    # Last 12 weeks
    trends = []
    end_date = datetime.now()
    for i in range(12):
        start_week = end_date - timedelta(days=(i+1)*7)
        end_week = end_date - timedelta(days=i*7)
        
        # Calculate attendance % for this week
        count = db.query(models.Attendance).filter(
            models.Attendance.attendance_date >= start_week.date(),
            models.Attendance.attendance_date < end_week.date()
        ).count()
        
        # Normalize arbitrarily for demo (real would need accurate total users history)
        # Using current user count as baseline
        total_users = db.query(models.User).filter(models.User.is_active == True).count()
        max_possible = total_users * 5 
        percentage = (count / max_possible * 100) if max_possible > 0 else 0
        trends.append(round(min(100, percentage)))
    
    return trends[::-1] # Reverse to show oldest to newest

@router.get("/department-stats")
def get_dept_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    # Department efficiency (mocked logic based on attendance for now)
    # Group users by department
    users = db.query(models.User).filter(models.User.is_active == True).all()
    depts = {}
    for u in users:
        d = u.department or "Unknown"
        if d not in depts: depts[d] = []
        depts[d].append(u.id)
    
    stats = []
    colors = ['bg-blue-600', 'bg-blue-400', 'bg-slate-400', 'bg-slate-300', 'bg-emerald-500']
    
    for i, (dept, uids) in enumerate(depts.items()):
        if not uids: continue
        # Calculate avg work hours for this dept in last 30 days
        start_date = datetime.now() - timedelta(days=30)
        logs = db.query(models.Attendance).filter(
            models.Attendance.user_id.in_(uids),
            models.Attendance.attendance_date >= start_date.date()
        ).all()
        
        total_h = sum([l.working_hours for l in logs if l.working_hours])
        avg = total_h / len(logs) if logs else 0
        
        # Efficiency score: (Avg / 9h) * 100
        eff = min(100, round((avg / 9.0) * 100))
        
        stats.append({
            "name": dept,
            "value": eff,
            "color": colors[i % len(colors)]
        })
        
    return stats
