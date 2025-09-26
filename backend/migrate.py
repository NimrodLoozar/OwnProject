#!/usr/bin/env python3
"""
Database migration script to add role column to users table
"""

import sqlite3
import os
from app.database import engine
from app.models.user import User
from app.utils.auth import get_password_hash

def migrate_database():
    """Add role column to users table and create owner user"""
    # Get the database URL from the engine
    db_path = str(engine.url).replace('sqlite:///', '')
    
    print(f"Migrating database: {db_path}")
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if role column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'role' not in columns:
            print("Adding 'role' column to users table...")
            # Add role column with default value 'user'
            cursor.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")
            
            # Update all existing users to have 'user' role
            cursor.execute("UPDATE users SET role = 'user' WHERE role IS NULL")
            print("Role column added successfully")
        else:
            print("Role column already exists")
        
        # Check if owner user exists (by email or username)
        cursor.execute("SELECT * FROM users WHERE email = ? OR username = ?", 
                      ("nimrod.loboar@gmail.com", "Nimrod"))
        owner_user = cursor.fetchone()
        
        if not owner_user:
            print("Creating owner user...")
            # Create owner user
            hashed_password = get_password_hash("owner123")
            cursor.execute("""
                INSERT INTO users (username, email, hashed_password, role, is_active, is_superuser, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """, ("Nimrod", "nimrod.loboar@gmail.com", hashed_password, "owner", True, True))
            print("Owner user created successfully")
        else:
            # Update existing user to owner role
            print("Updating existing Nimrod user to owner role...")
            cursor.execute("UPDATE users SET role = 'owner', is_superuser = 1 WHERE email = ? OR username = ?", 
                         ("nimrod.loboar@gmail.com", "Nimrod"))
            print("Existing user updated to owner role")
        
        # Commit changes
        conn.commit()
        print("Database migration completed successfully!")
        
        # Show all users
        cursor.execute("SELECT username, email, role FROM users")
        users = cursor.fetchall()
        print("\nCurrent users:")
        for user in users:
            print(f"  - {user[0]} ({user[1]}) - Role: {user[2]}")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()