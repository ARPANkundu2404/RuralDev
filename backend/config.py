"""
Configuration classes for RuralDev Flask application.
"""

import os
from datetime import timedelta


def _get_database_uri(default_sqlite=True):
    """
    Get database URI from environment or use fallback.
    
    Args:
        default_sqlite: If True and DATABASE_URL not set, use SQLite
    
    Returns:
        Database connection URI
    """
    db_url = os.getenv("DATABASE_URL")
    
    if db_url:
        # Convert old postgres:// scheme to postgresql:// for newer SQLAlchemy
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        return db_url
    
    # Fallback to SQLite if no DATABASE_URL and default_sqlite is True
    if default_sqlite:
        return "sqlite:///ruraldev.db"
    
    # No database URL available
    return None


class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Email configuration
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", True)
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", "noreply@ruraldev.com")
    
    # OTP configuration
    OTP_EXPIRY_MINUTES = 15
    MAX_OTP_ATTEMPTS = 5


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = _get_database_uri(default_sqlite=True)
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = _get_database_uri(default_sqlite=False)
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError(
            "DATABASE_URL environment variable must be set for production. "
            "Format: postgresql://username:password@host:port/database"
        )
