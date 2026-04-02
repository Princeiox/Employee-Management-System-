from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.api import deps
from app.db.database import get_db
from app.core import security

router = APIRouter()

@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(deps.get_current_active_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_details(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    if user_update.name:
        current_user.name = user_update.name
    if user_update.email:
        # Check if email is taken by another user
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user and existing_user.id != current_user.id:
             raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email
    if user_update.phone:
        current_user.phone = user_update.phone
    if user_update.designation:
        current_user.designation = user_update.designation
    if user_update.department:
        current_user.department = user_update.department
    if user_update.github_url is not None:
        current_user.github_url = user_update.github_url
    if user_update.meet_url is not None:
        current_user.meet_url = user_update.meet_url
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/password", status_code=status.HTTP_200_OK)
def update_password(
    password_update: schemas.UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    if not security.verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = security.get_password_hash(password_update.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.put("/me/theme", response_model=schemas.UserResponse)
def update_theme(
    theme_update: schemas.UserUpdateTheme,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    current_user.theme = theme_update.theme
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/profile-pic", response_model=schemas.UserResponse)
def update_profile_pic(
    pic_update: schemas.UserUpdateProfilePic,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    current_user.profile_pic = pic_update.profile_pic
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/cover-pic", response_model=schemas.UserResponse)
def update_cover_pic(
    cover_update: schemas.UserUpdateCoverPic,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    current_user.cover_pic = cover_update.cover_pic
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/prefs", response_model=schemas.UserResponse)
def update_prefs(
    prefs_update: schemas.UserUpdatePrefs,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    if prefs_update.pref_timesheets is not None:
        current_user.pref_timesheets = prefs_update.pref_timesheets
    if prefs_update.pref_alerts is not None:
        current_user.pref_alerts = prefs_update.pref_alerts
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# HR Endpoints
@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return db.query(models.User).offset(skip).limit(limit).all()
