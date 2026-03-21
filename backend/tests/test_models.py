"""
Tests for database models.
"""

import pytest
from datetime import datetime, timedelta
from app import db
from app.models import User, Otp, BlacklistedToken, Workshop, RoleEnum


class TestUserModel:
    """Test User model."""
    
    def test_user_creation(self, app):
        """Test creating a user."""
        with app.app_context():
            user = User(
                username="testuser",
                email="test@example.com",
                role=RoleEnum.USER.value
            )
            user.set_password("password123")
            
            assert user.username == "testuser"
            assert user.password_hash is not None
            assert user.password_hash != "password123"
    
    def test_password_hashing(self, app):
        """Test password hashing."""
        with app.app_context():
            user = User(username="test", email="test@example.com")
            user.set_password("mypassword")
            
            assert user.check_password("mypassword") is True
            assert user.check_password("wrongpassword") is False
    
    def test_has_role(self, app):
        """Test role checking."""
        with app.app_context():
            user = User(username="test", email="test@example.com", role=RoleEnum.ADMIN.value)
            
            assert user.has_role("ADMIN") is True
            assert user.has_role("USER") is False
            assert user.has_role("ADMIN", "USER") is True
    
    def test_user_to_dict(self, app):
        """Test user serialization."""
        with app.app_context():
            user = User(
                username="test",
                email="test@example.com",
                role=RoleEnum.USER.value
            )
            
            user_dict = user.to_dict(include_email=True)
            
            assert user_dict["username"] == "test"
            assert user_dict["email"] == "test@example.com"
            assert user_dict["role"] == "USER"


class TestOtpModel:
    """Test OTP model."""
    
    def test_otp_creation(self, app, test_user):
        """Test creating OTP."""
        with app.app_context():
            otp = Otp(
                user_id=test_user.id,
                otp_code="123456",
                email=test_user.email,
                expires_at=datetime.utcnow() + timedelta(minutes=15)
            )
            
            assert otp.otp_code == "123456"
            assert otp.is_valid() is True
    
    def test_otp_expiry(self, app, test_user):
        """Test OTP expiry."""
        with app.app_context():
            otp = Otp(
                user_id=test_user.id,
                otp_code="123456",
                email=test_user.email,
                expires_at=datetime.utcnow() - timedelta(minutes=1)
            )
            
            assert otp.is_expired() is True
            assert otp.is_valid() is False
    
    def test_otp_usage(self, app, test_user):
        """Test OTP usage."""
        with app.app_context():
            otp = Otp(
                user_id=test_user.id,
                otp_code="123456",
                email=test_user.email,
                is_used=True,
                expires_at=datetime.utcnow() + timedelta(minutes=15)
            )
            
            assert otp.is_valid() is False
    
    def test_otp_attempts(self, app, test_user):
        """Test OTP attempt tracking."""
        with app.app_context():
            otp = Otp(
                user_id=test_user.id,
                otp_code="123456",
                email=test_user.email,
                attempts=3,
                expires_at=datetime.utcnow() + timedelta(minutes=15)
            )
            
            assert otp.can_retry(max_attempts=5) is True
            assert otp.can_retry(max_attempts=3) is False


class TestBlacklistedTokenModel:
    """Test BlacklistedToken model."""
    
    def test_token_blacklist(self, app, test_user):
        """Test blacklisting a token."""
        with app.app_context():
            token = BlacklistedToken(
                jti="test-jti-123",
                user_id=test_user.id,
                expires_at=datetime.utcnow() + timedelta(hours=1)
            )
            
            assert token.is_expired() is False
    
    def test_token_expiry(self, app, test_user):
        """Test token expiry."""
        with app.app_context():
            token = BlacklistedToken(
                jti="test-jti-123",
                user_id=test_user.id,
                expires_at=datetime.utcnow() - timedelta(hours=1)
            )
            
            assert token.is_expired() is True


class TestWorkshopModel:
    """Test Workshop model."""
    
    def test_workshop_creation(self, app, test_trainer):
        """Test creating a workshop."""
        with app.app_context():
            workshop = Workshop(
                trainer_id=test_trainer.id,
                title="Pottery Basics",
                description="Learn pottery",
                skill_category="Pottery",
                max_participants=20
            )
            
            assert workshop.title == "Pottery Basics"
            assert workshop.status == "PENDING"
    
    def test_workshop_to_dict(self, app, test_trainer):
        """Test workshop serialization."""
        with app.app_context():
            workshop = Workshop(
                trainer_id=test_trainer.id,
                title="Embroidery",
                description="Traditional embroidery",
                skill_category="Embroidery",
                max_participants=15
            )
            
            workshop_dict = workshop.to_dict()
            
            assert workshop_dict["title"] == "Embroidery"
            assert workshop_dict["status"] == "PENDING"
            assert workshop_dict["max_participants"] == 15
