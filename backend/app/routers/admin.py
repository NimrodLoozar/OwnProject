from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user import User as UserSchema
from ..utils.auth import get_current_owner, check_user_exists

router = APIRouter()

@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    """Get all users - Owner only"""
    users = db.query(User).all()
    return users

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    """Delete a user - Owner only"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted successfully"}

@router.get("/users/{user_id}/exists")
async def check_user_exists_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Check if a user exists - for checking if current user is still valid"""
    exists = check_user_exists(db, user_id)
    return {"exists": exists}