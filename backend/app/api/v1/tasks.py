from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.api import deps
from app.db.database import get_db

router = APIRouter()

def check_task_assignment_permission(user: models.User):
    """Helper to check if a user has permission to assign tasks."""
    allowed_roles = [models.UserRole.HR, models.UserRole.MANAGER, models.UserRole.TEAM_LEAD]
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Insufficient permissions to assign or manage tasks for others."
        )

@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """Assigns a new individual task to an employee."""
    check_task_assignment_permission(current_user)
    
    db_task = models.Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        assigned_to_id=task.assigned_to_id,
        assigned_by_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.post("/bulk", response_model=List[schemas.TaskResponse])
def create_tasks_bulk(
    tasks: List[schemas.TaskCreate],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """Assigns multiple tasks in a single batch operation."""
    check_task_assignment_permission(current_user)
    
    db_tasks = []
    for task in tasks:
        new_task = models.Task(
            title=task.title,
            description=task.description,
            priority=task.priority,
            due_date=task.due_date,
            assigned_to_id=task.assigned_to_id,
            assigned_by_id=current_user.id
        )
        db_tasks.append(new_task)
    
    db.add_all(db_tasks)
    db.commit()
    for task in db_tasks:
        db.refresh(task)
    return db_tasks

@router.get("/me", response_model=List[schemas.TaskResponse])
def read_my_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """Retrieves all tasks assigned TO the current user."""
    return db.query(models.Task).filter(models.Task.assigned_to_id == current_user.id).all()

@router.get("/assigned", response_model=List[schemas.TaskResponse])
def read_tasks_assigned_by_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """Retrieves all tasks assigned BY the current user (Managers/HR)."""
    return db.query(models.Task).filter(models.Task.assigned_by_id == current_user.id).all()

@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Updates an existing task.
    Assignees can update status. 
    Assigners (Managers) can update title, description, and priority.
    """
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Permission Check: only assignee or assigner can update
    is_assigner = db_task.assigned_by_id == current_user.id
    is_assignee = db_task.assigned_to_id == current_user.id
    
    if not (is_assigner or is_assignee):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this task")

    # Fill updates
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == 'status' or is_assigner: # Assignee can only update status, Assigner can update everything
            setattr(db_task, field, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task
