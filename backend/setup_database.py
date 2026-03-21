#!/usr/bin/env python
"""
Database initialization script for RuralDev.
Creates the PostgreSQL database if it doesn't exist.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Create the PostgreSQL database and tables."""
    try:
        import psycopg2
        from psycopg2 import sql
    except ImportError:
        print("❌ psycopg2 not installed. Installing...")
        os.system(f"{sys.executable} -m pip install psycopg2-binary")
        import psycopg2
        from psycopg2 import sql
    
    # Parse DATABASE_URL
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in .env")
        return False
    
    # Parse connection string: postgresql://user:password@host:port/database
    try:
        from urllib.parse import urlparse
        parsed = urlparse(database_url)
        
        db_name = parsed.path.lstrip("/")
        db_user = parsed.username
        db_password = parsed.password
        db_host = parsed.hostname or "localhost"
        db_port = parsed.port or 5432
        
        if not all([db_user, db_name]):
            print("❌ Invalid DATABASE_URL format")
            return False
        
        print(f"📊 Creating database: {db_name} on {db_host}:{db_port}")
        
        # Connect to PostgreSQL (default 'postgres' database)
        conn = psycopg2.connect(
            dbname="postgres",
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        exists = cursor.fetchone()
        
        if exists:
            print(f"✅ Database '{db_name}' already exists")
        else:
            print(f"🔨 Creating database '{db_name}'...")
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(db_name)
            ))
            print(f"✅ Database '{db_name}' created successfully")
        
        cursor.close()
        conn.close()
        
        # Now create tables using Flask
        print("🔨 Creating database tables...")
        os.environ["FLASK_ENV"] = "development"
        
        from app import create_app, db
        app = create_app(config_name="development")
        
        with app.app_context():
            db.create_all()
            print("✅ All database tables created successfully")
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    try:
        success = setup_database()
        if success:
            print("\n✨ Database setup complete! You can now run: python run.py")
            sys.exit(0)
        else:
            print("\n❌ Database setup failed. Check DATABASE_URL in .env")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n⚠️  Setup cancelled by user")
        sys.exit(1)
