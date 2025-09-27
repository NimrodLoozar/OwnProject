#!/usr/bin/env python3
"""
Migration script to add profile_picture and theme_preference to users table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Add profile_picture column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255);"))
            print("✓ Added profile_picture column")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("ℹ profile_picture column already exists")
            else:
                print(f"✗ Error adding profile_picture column: {e}")
        
        # Add theme_preference column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN theme_preference VARCHAR(20) DEFAULT 'light' NOT NULL;"))
            print("✓ Added theme_preference column")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("ℹ theme_preference column already exists")
            else:
                print(f"✗ Error adding theme_preference column: {e}")
        
        conn.commit()
        print("✓ Migration completed successfully!")

if __name__ == "__main__":
    run_migration()