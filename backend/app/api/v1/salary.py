from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import models, schemas
from app.api import deps
from app.db.database import get_db

router = APIRouter()

@router.get("/user/{user_id}", response_model=schemas.SalaryResponse)
def read_user_salary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    salary = db.query(models.Salary).filter(models.Salary.user_id == user_id).first()
    if not salary:
        # Return default structure if allowed, or 404. 
        # Better to return empty structure so HR can Create/edit it easily
        return schemas.SalaryResponse(
             id=0, user_id=user_id, updated_at=models.func.now(), # Dummy
             basic_salary=0, hra=0, other_allowances=0, pf=0, tax=0, other_deductions=0
        )
    return salary

@router.post("/", response_model=schemas.SalaryResponse)
def create_or_update_salary(
    salary_in: schemas.SalaryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_hr_user)
):
    user = db.query(models.User).filter(models.User.id == salary_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_salary = db.query(models.Salary).filter(models.Salary.user_id == salary_in.user_id).first()
    
    if db_salary:
        # Update existing
        db_salary.basic_salary = salary_in.basic_salary
        db_salary.hra = salary_in.hra
        db_salary.other_allowances = salary_in.other_allowances
        db_salary.pf = salary_in.pf
        db_salary.tax = salary_in.tax
        db_salary.other_deductions = salary_in.other_deductions
    else:
        # Create new
        db_salary = models.Salary(
            user_id=salary_in.user_id,
            basic_salary=salary_in.basic_salary,
            hra=salary_in.hra,
            other_allowances=salary_in.other_allowances,
            pf=salary_in.pf,
            tax=salary_in.tax,
            other_deductions=salary_in.other_deductions
        )
        db.add(db_salary)
        
    db.commit()
    db.refresh(db_salary)
    return db_salary
