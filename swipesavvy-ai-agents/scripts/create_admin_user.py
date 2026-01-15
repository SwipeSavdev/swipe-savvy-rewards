#!/usr/bin/env python3
"""
Create Admin User Script

Run this script to create an admin user in the production database.
Can be executed via ECS Exec or locally with database access.

Usage:
    python scripts/create_admin_user.py
"""

import os
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from passlib.context import CryptContext
import uuid

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL environment variable not set")
    sys.exit(1)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Admin user details
ADMIN_EMAIL = "admin@swipesavvy.com"
ADMIN_PASSWORD = "SwipeSavvy2026!"
ADMIN_NAME = "SwipeSavvy Admin"
ADMIN_ROLE = "super_admin"

def create_admin_user():
    """Create admin user in database"""

    engine = create_engine(DATABASE_URL)

    # Hash password
    password_hash = pwd_context.hash(ADMIN_PASSWORD)
    user_id = str(uuid.uuid4())

    # Check if user exists
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT id FROM admin_users WHERE email = :email"),
            {"email": ADMIN_EMAIL}
        )
        existing = result.fetchone()

        if existing:
            # Update existing user
            conn.execute(
                text("""
                    UPDATE admin_users
                    SET password_hash = :password_hash,
                        status = 'active',
                        updated_at = NOW()
                    WHERE email = :email
                """),
                {"email": ADMIN_EMAIL, "password_hash": password_hash}
            )
            conn.commit()
            print(f"Updated existing admin user: {ADMIN_EMAIL}")
        else:
            # Create new user
            conn.execute(
                text("""
                    INSERT INTO admin_users (id, email, password_hash, full_name, role, status, created_at, updated_at)
                    VALUES (:id, :email, :password_hash, :full_name, :role, 'active', NOW(), NOW())
                """),
                {
                    "id": user_id,
                    "email": ADMIN_EMAIL,
                    "password_hash": password_hash,
                    "full_name": ADMIN_NAME,
                    "role": ADMIN_ROLE
                }
            )
            conn.commit()
            print(f"Created new admin user: {ADMIN_EMAIL}")

    print(f"\nAdmin credentials:")
    print(f"  Email: {ADMIN_EMAIL}")
    print(f"  Password: {ADMIN_PASSWORD}")
    print(f"  Role: {ADMIN_ROLE}")

if __name__ == "__main__":
    create_admin_user()
