from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
import secrets
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.user import User

# HTTP Bearer security scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash"""
    try:
        # Split the stored hash to get salt and hash
        stored_salt, stored_hash = hashed_password.split(':')
        # Hash the plain password with the stored salt
        password_hash = hashlib.pbkdf2_hmac('sha256', 
                                          plain_password.encode('utf-8'), 
                                          stored_salt.encode('utf-8'), 
                                          100000)
        return secrets.compare_digest(stored_hash.encode('utf-8'), 
                                    password_hash.hex().encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generate password hash using PBKDF2"""
    # Generate a random salt
    salt = secrets.token_hex(32)
    # Hash the password with the salt
    password_hash = hashlib.pbkdf2_hmac('sha256', 
                                      password.encode('utf-8'), 
                                      salt.encode('utf-8'), 
                                      100000)
    # Return salt:hash format
    return f"{salt}:{password_hash.hex()}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """Verify JWT token and return username"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None

def authenticate_user(db: Session, username: str, password: str):
    """Authenticate user with username and password"""
    user = db.query(User).filter(
        User.username == username,
        User.deleted_at.is_(None)  # Exclude soft-deleted users
    ).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    username = verify_token(token)
    if username is None:
        raise credentials_exception
    
    user = db.query(User).filter(
        User.username == username,
        User.deleted_at.is_(None)  # Exclude soft-deleted users
    ).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_owner(current_user: User = Depends(get_current_active_user)):
    """Get current user if they have owner role"""
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Owner role required."
        )
    return current_user

def check_user_exists(db: Session, user_id: int) -> bool:
    """Check if user exists in database and is not soft-deleted"""
    user = db.query(User).filter(
        User.id == user_id,
        User.deleted_at.is_(None)  # Exclude soft-deleted users
    ).first()
    return user is not None