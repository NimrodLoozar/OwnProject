from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pathlib import Path
from .config import settings
from .database import engine, Base, get_db
from .routers import auth, users, protected, admin
from .models.user import User
from .utils.auth import get_password_hash

# Create database tables
Base.metadata.create_all(bind=engine)

def create_owner_user():
    """Create the owner user if it doesn't exist"""
    db = next(get_db())
    try:
        # Check if owner user already exists
        existing_owner = db.query(User).filter(User.email == "nimrod.loboar@gmail.com").first()
        if not existing_owner:
            # Create the owner user
            hashed_password = get_password_hash("owner123")  # You may want to change this default password
            owner_user = User(
                username="Nimrod",
                email="nimrod.loboar@gmail.com",
                hashed_password=hashed_password,
                role="owner",
                is_active=True,
                is_superuser=True,
                is_admin=True
            )
            db.add(owner_user)
            db.commit()
            print("Owner user created successfully")
        else:
            # Update existing user to owner role if needed
            if existing_owner.role != "owner":
                existing_owner.role = "owner"
                existing_owner.is_superuser = True
                existing_owner.is_admin = True
                db.commit()
                print("Existing user updated to owner role")
    finally:
        db.close()

# Create owner user on startup
create_owner_user()

app = FastAPI(
    title="MyApp Backend API",
    description="Backend API for MyApp with user authentication and data management",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(protected.router, prefix="/api", tags=["protected"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])

# Create uploads directory and mount static files
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "profile_pictures").mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "MyApp Backend API is running!"}

@app.get("/api")
async def api_root():
    return {
        "message": "MyApp Backend API", 
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/auth",
            "users": "/api/users", 
            "admin": "/api/admin",
            "data": "/api/data",
            "dashboard": "/api/dashboard"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}