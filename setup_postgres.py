#!/usr/bin/env python3
"""
PostgreSQL Setup Script for SwipeSavvy
Creates the three required databases and tables
"""

import subprocess
import time
import sys
import os

def run_command(cmd, shell=False):
    """Run a shell command and return output"""
    try:
        result = subprocess.run(
            cmd,
            shell=shell,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, "", "Command timed out"
    except Exception as e:
        return 1, "", str(e)

def start_postgresql():
    """Start PostgreSQL service"""
    print("🔧 Starting PostgreSQL service...")
    
    # First kill any running processes
    run_command("pkill -9 postgres", shell=True)
    time.sleep(2)
    
    # Start PostgreSQL
    cmd = "/opt/homebrew/opt/postgresql@14/bin/postgres -D /opt/homebrew/var/postgresql@14"
    print(f"  Running: {cmd}")
    
    # Start in background
    subprocess.Popen(
        cmd,
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    print("  ⏳ Waiting for PostgreSQL to start...")
    time.sleep(5)
    
    # Test connection
    for attempt in range(10):
        code, _, _ = run_command("psql -U postgres -c 'SELECT 1;'", shell=True)
        if code == 0:
            print("  ✅ PostgreSQL started successfully!")
            return True
        print(f"  ⏳ Attempt {attempt + 1}/10...")
        time.sleep(1)
    
    print("  ❌ Failed to start PostgreSQL")
    return False

def create_databases():
    """Create the three required databases"""
    databases = ['swipesavvy_ai', 'swipesavvy_dev', 'swipesavvy_wallet']
    
    print("\n📊 Creating databases...")
    for db in databases:
        code, _, err = run_command(
            f"psql -U postgres -c 'CREATE DATABASE {db};'",
            shell=True
        )
        if code == 0 or "already exists" in err:
            print(f"  ✅ Database '{db}' created/exists")
        else:
            print(f"  ❌ Failed to create '{db}': {err}")
            return False
    
    return True

def list_databases():
    """List all databases"""
    print("\n📋 Listing databases...")
    code, out, _ = run_command("psql -U postgres -l", shell=True)
    if code == 0:
        # Filter for swipesavvy databases
        for line in out.split('\n'):
            if 'swipesavvy' in line.lower():
                print(f"  {line}")
    
    return code == 0

def main():
    print("=" * 60)
    print("SwipeSavvy PostgreSQL Setup")
    print("=" * 60)
    
    # Start PostgreSQL
    if not start_postgresql():
        print("\n❌ Could not start PostgreSQL")
        sys.exit(1)
    
    # Create databases
    if not create_databases():
        print("\n❌ Could not create databases")
        sys.exit(1)
    
    # List databases
    if not list_databases():
        print("\n❌ Could not list databases")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ PostgreSQL setup complete!")
    print("=" * 60)
    print("\nDatabase Connection Strings:")
    print("  swipesavvy_ai:     postgresql://postgres@localhost:5432/swipesavvy_ai")
    print("  swipesavvy_dev:    postgresql://postgres@localhost:5432/swipesavvy_dev")
    print("  swipesavvy_wallet: postgresql://postgres@localhost:5432/swipesavvy_wallet")
    print("\nPostgreSQL is running in the background.")
    print("To stop it later: pkill -9 postgres")

if __name__ == "__main__":
    main()
