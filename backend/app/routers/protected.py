from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from ..models.user import User, UserData
from ..schemas.user import UserData as UserDataSchema, UserDataCreate, UserDataUpdate
from ..utils.auth import get_current_active_user

router = APIRouter()

@router.get("/data", response_model=List[UserDataSchema])
def get_user_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all data for current user"""
    user_data = db.query(UserData).filter(UserData.user_id == current_user.id).all()
    return user_data

@router.get("/data/{key}")
def get_user_data_by_key(
    key: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific data by key for current user"""
    user_data = db.query(UserData).filter(
        UserData.user_id == current_user.id,
        UserData.key == key
    ).first()
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data not found"
        )
    
    return {"key": user_data.key, "value": user_data.value}

@router.post("/data", response_model=UserDataSchema)
def create_user_data(
    data: UserDataCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create new data for current user"""
    # Check if key already exists for this user
    existing_data = db.query(UserData).filter(
        UserData.user_id == current_user.id,
        UserData.key == data.key
    ).first()
    
    if existing_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data with this key already exists. Use PUT to update."
        )
    
    db_data = UserData(
        user_id=current_user.id,
        key=data.key,
        value=data.value
    )
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    
    return db_data

@router.put("/data/{key}", response_model=UserDataSchema)
def update_user_data(
    key: str,
    data: UserDataUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update existing data for current user"""
    db_data = db.query(UserData).filter(
        UserData.user_id == current_user.id,
        UserData.key == key
    ).first()
    
    if not db_data:
        # Create new data if it doesn't exist
        db_data = UserData(
            user_id=current_user.id,
            key=key,
            value=data.value
        )
        db.add(db_data)
    else:
        # Update existing data
        db_data.value = data.value
    
    db.commit()
    db.refresh(db_data)
    return db_data

@router.delete("/data/{key}")
def delete_user_data(
    key: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete specific data by key for current user"""
    db_data = db.query(UserData).filter(
        UserData.user_id == current_user.id,
        UserData.key == key
    ).first()
    
    if not db_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data not found"
        )
    
    db.delete(db_data)
    db.commit()
    
    return {"message": "Data deleted successfully"}

@router.get("/dashboard")
def get_dashboard_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dashboard-specific data for current user"""
    # Get QR text data
    qr_data = db.query(UserData).filter(
        UserData.user_id == current_user.id,
        UserData.key == "qr_text"
    ).first()
    
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email
        },
        "qr_text": qr_data.value if qr_data else "http://flobozar.com/",
        "message": f"Welcome to your dashboard, {current_user.username}!"
    }