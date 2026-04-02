from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.api import deps
from app.db.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.ShortcutResponse])
def read_shortcuts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    return db.query(models.Shortcut).filter(models.Shortcut.user_id == current_user.id).all()

@router.post("/", response_model=schemas.ShortcutResponse)
def create_shortcut(
    shortcut: schemas.ShortcutCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    new_shortcut = models.Shortcut(
        **shortcut.dict(),
        user_id=current_user.id
    )
    db.add(new_shortcut)
    db.commit()
    db.refresh(new_shortcut)
    return new_shortcut

@router.delete("/{shortcut_id}")
def delete_shortcut(
    shortcut_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    shortcut = db.query(models.Shortcut).filter(
        models.Shortcut.id == shortcut_id,
        models.Shortcut.user_id == current_user.id
    ).first()
    
    if not shortcut:
        raise HTTPException(status_code=404, detail="Shortcut not found")
        
    db.delete(shortcut)
    db.commit()
    return {"message": "Shortcut deleted"}
