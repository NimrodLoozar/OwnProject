#!/usr/bin/env python3
"""
Migration script to add soft delete fields to users table
Adds deleted_at and deleted_by columns for soft delete functionality
"""

import sys
import os

# Change to backend directory to load correct .env file
backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

from sqlalchemy import create_engine, text
from app.config import settings

def run_migration():
    """Add soft delete columns to users table"""
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Starting soft delete migration...")
        
        # Add deleted_at column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;"))
            print("✓ Added deleted_at column")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("ℹ deleted_at column already exists")
            else:
                print(f"✗ Error adding deleted_at column: {e}")
                raise
        
        # Add deleted_by column
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN deleted_by INTEGER;"))
            print("✓ Added deleted_by column")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                print("ℹ deleted_by column already exists")
            else:
                print(f"✗ Error adding deleted_by column: {e}")
                raise
        
        # Create index on deleted_at for efficient queries
        try:
            conn.execute(text("CREATE INDEX idx_users_deleted_at ON users(deleted_at);"))
            print("✓ Created index on deleted_at column")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("ℹ Index on deleted_at already exists")
            else:
                print(f"ℹ Note: Could not create index: {e}")
        
        conn.commit()
        print("✓ Soft delete migration completed successfully!")
        print("\nNext steps:")
        print("1. Update authentication to exclude soft-deleted users")
        print("2. Update user management endpoints to use soft delete")
        print("3. Add restore and permanent delete functionality")

def rollback_migration():
    """Remove soft delete columns from users table (rollback)"""
    engine = create_engine(settings.DATABASE_URL)
    
    print("WARNING: This will permanently remove soft delete columns!")
    confirm = input("Type 'yes' to continue with rollback: ")
    
    if confirm.lower() != 'yes':
        print("Rollback cancelled")
        return
    
    with engine.connect() as conn:
        print("Starting rollback...")
        
        # Drop index
        try:
            conn.execute(text("DROP INDEX IF EXISTS idx_users_deleted_at;"))
            print("✓ Dropped index on deleted_at")
        except Exception as e:
            print(f"ℹ Note: Could not drop index: {e}")
        
        # Drop deleted_by column
        try:
            conn.execute(text("ALTER TABLE users DROP COLUMN deleted_by;"))
            print("✓ Removed deleted_by column")
        except Exception as e:
            print(f"✗ Error removing deleted_by column: {e}")
        
        # Drop deleted_at column
        try:
            conn.execute(text("ALTER TABLE users DROP COLUMN deleted_at;"))
            print("✓ Removed deleted_at column")
        except Exception as e:
            print(f"✗ Error removing deleted_at column: {e}")
        
        conn.commit()
        print("✓ Rollback completed!")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Soft delete migration script')
    parser.add_argument('--rollback', action='store_true', 
                       help='Rollback the migration (remove soft delete columns)')
    
    args = parser.parse_args()
    
    if args.rollback:
        rollback_migration()
    else:
        run_migration()
