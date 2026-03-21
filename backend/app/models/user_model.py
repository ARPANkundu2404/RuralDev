"""
Database models for RuralDev application.
Includes User, Role, OTP, and BlacklistedToken models.
"""

from datetime import datetime, timedelta
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class RoleEnum(str, Enum):
    """Role enumeration for RBAC."""
    USER = "USER"
    TRAINER = "TRAINER"
    RECRUITER = "RECRUITER"
    SELLER = "SELLER"
    ADMIN = "ADMIN"


class User(db.Model):
    """User model with role-based access control."""
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default=RoleEnum.USER.value, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    bio = db.Column(db.Text, nullable=True)
    skills = db.Column(db.JSON, nullable=True)
    location = db.Column(db.String(255), nullable=True)
    is_profile_complete = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    otps = db.relationship("Otp", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    
    def set_password(self, password):
        """Hash and set the password."""
        self.password_hash = generate_password_hash(password, method="pbkdf2:sha256")
    
    def check_password(self, password):
        """Verify password against hash."""
        return check_password_hash(self.password_hash, password)
    
    def has_role(self, *roles):
        """Check if user has any of the specified roles."""
        return self.role in roles
    
    def to_dict(self, include_email=False):
        """Convert user to dictionary."""
        data = {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "bio": self.bio,
            "skills": self.skills,
            "location": self.location,
            "is_profile_complete": self.is_profile_complete,
            "created_at": self.created_at.isoformat(),
        }
        if include_email:
            data["email"] = self.email
        return data
    
    def __repr__(self):
        return f"<User {self.username} ({self.role})>"


class Otp(db.Model):
    """One-Time Password model for email verification."""
    __tablename__ = "otps"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    otp_code = db.Column(db.String(6), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    purpose = db.Column(db.String(50), default="email_verification")  # email_verification, password_reset
    is_used = db.Column(db.Boolean, default=False)
    attempts = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    def is_valid(self):
        """Check if OTP is still valid."""
        return not self.is_used and datetime.utcnow() < self.expires_at
    
    def is_expired(self):
        """Check if OTP has expired."""
        return datetime.utcnow() > self.expires_at
    
    def can_retry(self, max_attempts=5):
        """Check if user can retry OTP."""
        return self.attempts < max_attempts
    
    def to_dict(self):
        """Convert OTP to dictionary."""
        return {
            "id": self.id,
            "email": self.email,
            "purpose": self.purpose,
            "is_used": self.is_used,
            "is_valid": self.is_valid(),
            "expires_at": self.expires_at.isoformat(),
        }
    
    def __repr__(self):
        return f"<Otp {self.email} ({self.purpose})>"


class BlacklistedToken(db.Model):
    """Blacklist for revoked tokens (logout functionality)."""
    __tablename__ = "blacklisted_tokens"
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(255), unique=True, nullable=False, index=True)  # JWT ID
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    token_type = db.Column(db.String(20), default="access")  # access, refresh
    blacklisted_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    def is_expired(self):
        """Check if blacklist entry has expired (token expired)."""
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "jti": self.jti,
            "user_id": self.user_id,
            "token_type": self.token_type,
            "blacklisted_at": self.blacklisted_at.isoformat(),
        }
    
    def __repr__(self):
        return f"<BlacklistedToken user_id={self.user_id}>"


class Workshop(db.Model):
    """Workshop model for trainers to propose workshops."""
    __tablename__ = "workshops"
    
    id = db.Column(db.Integer, primary_key=True)
    trainer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    skill_category = db.Column(db.String(100), nullable=False)  # Pottery, Embroidery, etc.
    max_participants = db.Column(db.Integer, default=20)
    status = db.Column(db.String(20), default="PENDING")  # PENDING, APPROVED, REJECTED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trainer = db.relationship("User", backref="workshops")
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "trainer_id": self.trainer_id,
            "title": self.title,
            "description": self.description,
            "skill_category": self.skill_category,
            "max_participants": self.max_participants,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
    
    def __repr__(self):
        return f"<Workshop {self.title} ({self.status})>"


class Job(db.Model):
    """Job model for recruiters to post job listings."""
    __tablename__ = "jobs"
    
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(255))
    salary_range = db.Column(db.String(100))  # e.g., "50000-70000"
    job_category = db.Column(db.String(100), nullable=False)  # e.g., Artisan, Crafts, Other
    status = db.Column(db.String(20), default="PENDING")  # PENDING, APPROVED, REJECTED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    recruiter = db.relationship("User", backref="jobs")
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "recruiter_id": self.recruiter_id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "salary_range": self.salary_range,
            "job_category": self.job_category,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
    
    def __repr__(self):
        return f"<Job {self.title} ({self.status})>"


class Product(db.Model):
    """Product model for sellers to list artisan products."""
    __tablename__ = "products"
    
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)  # Pottery, Textiles, Jewelry, etc.
    image_url = db.Column(db.String(500))
    stock_quantity = db.Column(db.Integer, default=1)
    status = db.Column(db.String(20), default="PENDING")  # PENDING, APPROVED, REJECTED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    seller = db.relationship("User", backref="products")
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "seller_id": self.seller_id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "category": self.category,
            "image_url": self.image_url,
            "stock_quantity": self.stock_quantity,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
    
    def __repr__(self):
        return f"<Product {self.title} ({self.status})>"
