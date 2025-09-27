from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from pathlib import Path

from ..database import get_db
from ..models.user import User
from ..schemas.user import User as UserSchema, UserProfileUpdate, ProfilePictureResponse
from ..utils.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of users (only for admin users)"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
def read_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get specific user by ID"""
    # Users can only access their own info unless they're admin
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.put("/me/profile", response_model=UserSchema)
def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile settings"""
    if profile_update.theme_preference is not None:
        current_user.theme_preference = profile_update.theme_preference
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/profile-picture", response_model=ProfilePictureResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Upload profile picture for current user"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG and GIF files are allowed"
        )
    
    # Validate file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    file_content = await file.read()
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum 5MB allowed"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads/profile_pictures")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # Update user's profile picture path
    profile_picture_url = f"/uploads/profile_pictures/{unique_filename}"
    current_user.profile_picture = profile_picture_url
    db.commit()
    db.refresh(current_user)
    
    return ProfilePictureResponse(
        profile_picture=profile_picture_url,
        message="Profile picture updated successfully"
    )

@router.delete("/me/profile-picture")
def delete_profile_picture(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete current user's profile picture"""
    if current_user.profile_picture:
        # Try to delete the file from filesystem
        try:
            file_path = Path(f".{current_user.profile_picture}")
            if file_path.exists():
                file_path.unlink()
        except Exception:
            pass  # Continue even if file deletion fails
        
        # Remove profile picture from database
        current_user.profile_picture = None
        db.commit()
        
    return {"message": "Profile picture deleted successfully"}