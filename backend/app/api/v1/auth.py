from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app import models, schemas
from app.core import security
from app.db.database import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):

    print(f"Login attempt for: {form_data.username}")
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if user:

         is_valid = security.verify_password(form_data.password, user.hashed_password)


    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"received signup request: {user.dict()}")
    try:
        # Check if user exists
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            print(f"Error: Email {user.email} already registered")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        db_employee = db.query(models.User).filter(models.User.employee_id == user.employee_id).first()
        if db_employee:
            print(f"Error: Employee ID {user.employee_id} already registered")
            raise HTTPException(status_code=400, detail="Employee ID already registered")
        
        hashed_password = security.get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            hashed_password=hashed_password,
            name=user.name,
            employee_id=user.employee_id,
            phone=user.phone,
            role=user.role,
            designation=user.designation,
            department=user.department,
            leave_balance=24,
            theme="light"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        print(f"User created successfully: {db_user.id}")
        return db_user
    except Exception as e:
        print(f"Signup failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e
