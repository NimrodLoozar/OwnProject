from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user import User as UserSchema, DeletedUser as DeletedUserSchema
from ..utils.auth import get_current_owner, check_user_exists

router = APIRouter()

@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    include_deleted: bool = Query(False, description="Include soft-deleted users"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    """Get all users - Owner only. By default excludes soft-deleted users."""
    query = db.query(User)
    if not include_deleted:
        query = query.filter(User.deleted_at.is_(None))
    users = query.all()
    return users

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    permanent: bool = Query(False, description="Permanently delete user (cannot be restored)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    """Delete a user - Owner only. By default performs soft delete."""
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
    
    if permanent:
        # Permanent delete - remove from database
        db.delete(user)
        db.commit()
        return {"message": f"User {user.username} permanently deleted"}
    else:
        # Soft delete - mark as deleted
        user.deleted_at = datetime.utcnow()
        user.deleted_by = current_user.id
        db.commit()
        return {"message": f"User {user.username} deleted successfully"}

@router.post("/users/{user_id}/restore")
async def restore_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    """Restore a soft-deleted user - Owner only"""
    user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at.isnot(None)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deleted user not found"
        )
    
    # Restore user by clearing soft delete fields
    user.deleted_at = None
    user.deleted_by = None
    db.commit()
    
    return {"message": f"User {user.username} restored successfully"}

@router.get("/users/deleted/list", response_model=List[DeletedUserSchema])
async def get_deleted_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_owner)
):
    """Get all soft-deleted users - Owner only"""
    deleted_users = db.query(User).filter(User.deleted_at.isnot(None)).all()
    
    # Enrich with deleted_by username
    result = []
    for user in deleted_users:
        user_dict = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "is_admin": user.is_admin,
            "profile_picture": user.profile_picture,
            "theme_preference": user.theme_preference,
            "deleted_at": user.deleted_at,
            "deleted_by": user.deleted_by,
            "created_at": user.created_at,
            "deleted_by_username": None
        }
        
        # Get username of the owner who deleted this user
        if user.deleted_by:
            deleter = db.query(User).filter(User.id == user.deleted_by).first()
            if deleter:
                user_dict["deleted_by_username"] = deleter.username
        
        result.append(user_dict)
    
    return result

@router.get("/users/{user_id}/exists")
async def check_user_exists_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Check if a user exists - for checking if current user is still valid"""
    exists = check_user_exists(db, user_id)
    return {"exists": exists}