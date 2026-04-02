from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional
from datetime import datetime
import json

from app import models, schemas
from app.db.database import get_db
from app.api import deps
from app.core import security
from jose import jwt, JWTError

router = APIRouter()

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        # Map user_id -> WebSocket
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(message))

manager = ConnectionManager()

# --- Endpoints ---

@router.get("/history/{other_user_id}", response_model=List[schemas.MessageResponse])
def get_chat_history(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Fetch message history between current user and other_user_id
    """
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == other_user_id)) |
        ((models.Message.sender_id == other_user_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.timestamp.asc()).all()
    
    return messages

@router.get("/unread-counts", response_model=Dict[int, int])
def get_unread_counts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Get count of unread messages grouped by sender
    """
    results = db.query(
        models.Message.sender_id,
        func.count(models.Message.id)
    ).filter(
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).group_by(models.Message.sender_id).all()
    
    return {sender_id: count for sender_id, count in results}

@router.put("/read/{sender_id}")
def mark_messages_as_read(
    sender_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Mark all messages from sender_id to current_user as read
    """
    db.query(models.Message).filter(
        models.Message.sender_id == sender_id,
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    return {"message": "Marked as read"}

@router.post("/", response_model=schemas.MessageResponse)
async def send_message_api(
    msg: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Send a message via HTTP POST (optional, good for fallback)
    """
    db_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=msg.receiver_id,
        content=msg.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # Real-time delivery
    payload = {
        "type": "new_message",
        "data": {
            "id": db_msg.id,
            "sender_id": db_msg.sender_id,
            "receiver_id": db_msg.receiver_id,
            "content": db_msg.content,
            "timestamp": db_msg.timestamp.isoformat(),
            "is_read": db_msg.is_read
        }
    }
    
    # Send to receiver if online
    await manager.send_personal_message(payload, msg.receiver_id)
    # Send confirmation to sender too (if they use WS for local updates)
    await manager.send_personal_message(payload, current_user.id)
    
    return db_msg

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    # Verify token
    try:
        payload = jwt.decode(token, security.settings.SECRET_KEY, algorithms=[security.settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("WS Error: Email missing in token")
            await websocket.close(code=4003)
            return
    except JWTError as e:
        print(f"WS Error: Invalid token - {e}")
        await websocket.close(code=4003)
        return

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        await websocket.close(code=4003)
        return

    await manager.connect(user.id, websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WS messages if we want to support sending via WS
            # For simplicity, we can parse JSON
            try:
                msg_data = json.loads(data)
                if msg_data.get("type") == "send_message":
                    content = msg_data.get("content")
                    receiver_id = msg_data.get("receiver_id")
                    
                    if content and receiver_id:
                        # Save to DB
                        db_msg = models.Message(
                            sender_id=user.id,
                            receiver_id=receiver_id,
                            content=content
                        )
                        db.add(db_msg)
                        db.commit()
                        db.refresh(db_msg)
                        
                        # Broadcast
                        response_payload = {
                            "type": "new_message",
                            "data": {
                                "id": db_msg.id,
                                "sender_id": db_msg.sender_id,
                                "receiver_id": db_msg.receiver_id,
                                "content": db_msg.content,
                                "timestamp": db_msg.timestamp.isoformat(),
                                "is_read": db_msg.is_read
                            }
                        }
                        await manager.send_personal_message(response_payload, receiver_id)
                        # Echo back to sender so UI updates
                        await manager.send_personal_message(response_payload, user.id) 
            except Exception as e:
                print(f"WS Error: {e}")
                
    except WebSocketDisconnect:
        manager.disconnect(user.id)
