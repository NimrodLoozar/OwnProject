from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[str] = Field(default="user")

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    role: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# User data schemas
class UserDataBase(BaseModel):
    key: str
    value: Optional[str] = None

class UserDataCreate(UserDataBase):
    pass

class UserDataUpdate(BaseModel):
    value: Optional[str] = None

class UserData(UserDataBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True