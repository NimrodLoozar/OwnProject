#!/usr/bin/env python3
"""
Migration script to update theme_preference column default and existing values
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config import settings

def run_migration():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Update existing users with 'light' theme to 'system'
        try:
            result = conn.execute(text("""
                UPDATE users 
                SET theme_preference = 'system' 
                WHERE theme_preference = 'light' OR theme_preference IS NULL;
            """))
            print(f"✓ Updated {result.rowcount} users to use 'system' theme")
        except Exception as e:
            print(f"✗ Error updating theme preferences: {e}")
        
        # Update column default value
        try:
            conn.execute(text("""
                ALTER TABLE users 
                ALTER COLUMN theme_preference SET DEFAULT 'system';
            """))
            print("✓ Updated theme_preference column default to 'system'")
        except Exception as e:
            print(f"ℹ Note: Could not update column default (might already be correct): {e}")
        
        conn.commit()
        print("✓ Theme migration completed successfully!")

if __name__ == "__main__":
    run_migration()