#!/usr/bin/env python3
"""
Initialize the database with all tables
"""

import os
import sys

# Change to backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

# Import models to register them with SQLAlchemy
from app.models import User, UserData
from app.database import Base, engine
from app.utils.auth import get_password_hash
from sqlalchemy.orm import Session

def init_database():
    """Create all tables and initialize with owner user"""
    print("Creating database tables...")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")
    
    # Create owner user if it doesn't exist
    db = Session(engine)
    try:
        existing_owner = db.query(User).filter(User.email == "nimrod.loboar@gmail.com").first()
        
        if not existing_owner:
            print("Creating owner user...")
            owner_user = User(
                username="Nimrod",
                email="nimrod.loboar@gmail.com",
                hashed_password=get_password_hash("owner123"),
                role="owner",
                is_active=True,
                is_superuser=True,
                is_admin=True
            )
            db.add(owner_user)
            db.commit()
            print("✓ Owner user created")
            print(f"  Username: Nimrod")
            print(f"  Email: nimrod.loboar@gmail.com")
            print(f"  Password: owner123")
        else:
            print("ℹ Owner user already exists")
        
    finally:
        db.close()
    
    print("\n✓ Database initialization complete!")

if __name__ == "__main__":
    init_database()
