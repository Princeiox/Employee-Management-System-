from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.api import deps
from app.db.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.LeaveResponse)
def apply_for_leave(
    leave: schemas.LeaveCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    # Check balance
    leave_days = (leave.to_date - leave.from_date).days + 1
    if current_user.leave_balance < leave_days:
        raise HTTPException(status_code=400, detail=f"Insufficient leave balance. requested: {leave_days}, available: {current_user.leave_balance}")

    new_leave = models.Leave(
        user_id=current_user.id,
        from_date=leave.from_date,
        to_date=leave.to_date,
        reason=leave.reason,
        status=models.LeaveStatus.PENDING
    )
    db.add(new_leave)
    db.commit()
    db.refresh(new_leave)
    return new_leave

@router.get("/me", response_model=List[schemas.LeaveResponse])
def read_own_leaves(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return db.query(models.Leave).filter(models.Leave.user_id == current_user.id).all()

# HR Endpoints
@router.get("/all", response_model=List[schemas.LeaveResponse])
def read_all_leaves(
    status: models.LeaveStatus = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    query = db.query(models.Leave)
    if status:
        query = query.filter(models.Leave.status == status)
    return query.all()

@router.put("/{leave_id}/status", response_model=schemas.LeaveResponse)
def update_leave_status(
    leave_id: int,
    leave_update: schemas.LeaveUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    previous_status = leave.status
    leave.status = leave_update.status
    leave.remarks = leave_update.remarks
    leave.approved_by = current_user.id
    
    # Calculate days for balance update
    leave_days = (leave.to_date - leave.from_date).days + 1
    
    # Logic: If becoming Approved, subtract from balance
    if leave.status == models.LeaveStatus.APPROVED and previous_status != models.LeaveStatus.APPROVED:
        leave.user.leave_balance -= leave_days
        
    # Logic: If was Approved but now Rejected/Pending, add back to balance
    elif previous_status == models.LeaveStatus.APPROVED and leave.status != models.LeaveStatus.APPROVED:
        leave.user.leave_balance += leave_days
    
    db.commit()
    db.refresh(leave)
    return leave
