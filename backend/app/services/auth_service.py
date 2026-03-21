"""
Authentication service for user registration, login, and token management.
Implements the Spring Boot logic flow: Controller -> Service -> Repository
"""

from datetime import datetime, timedelta
from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from app import db
from app.models import User, BlacklistedToken, RoleEnum
from app.services.email_service import EmailService


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def register_user(username, email, password, role="USER"):
        """
        Register a new user (Direct Login - No OTP verification).
        
        Args:
            username: Username
            email: Email address
            password: Plain text password
            role: User role (USER, TRAINER, ADMIN)
        
        Returns:
            Tuple (success: bool, user: User or None, message: str)
        """
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return False, None, "Username already exists"
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return False, None, "Email already exists"
        
        # Validate role
        if role not in [r.value for r in RoleEnum]:
            return False, None, f"Invalid role. Must be one of: {', '.join([r.value for r in RoleEnum])}"
        
        try:
            # Create new user (verified by default for direct login)
            user = User(
                username=username,
                email=email,
                role=role,
                is_active=True,
                is_verified=True
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            # Send welcome email with login link
            from app.services.email_service import EmailService
            login_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173") + "/login"
            EmailService.send_welcome_email(email, login_url)
            
            return True, user, "Registration successful. Check your email."
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Registration error: {str(e)}")
            return False, None, "Registration failed. Please try again."
    
    @staticmethod
    def login_user(email, password):
        """
        Authenticate user and generate JWT token (Direct Login - Simplified).
        
        Args:
            email: Email address
            password: Plain text password
        
        Returns:
            Tuple (success: bool, user: User or None, token: str or None, message: str)
        """
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return False, None, None, "Invalid email or password"
        
        if not user.is_active:
            return False, None, None, "Account is disabled"
        
        # Verify password
        if not user.check_password(password):
            return False, None, None, "Invalid email or password"
        
        try:
            # Create JWT token
            access_token = create_access_token(
                identity=user.id,
                additional_claims={
                    "role": user.role,
                    "username": user.username,
                    "email": user.email
                }
            )
            
            return True, user, access_token, "Login successful"
        
        except Exception as e:
            current_app.logger.error(f"Login error: {str(e)}")
            return False, None, None, "Login failed. Please try again."
    
    @staticmethod
    def logout_user(jti, user_id, token_type="access"):
        """
        Logout user by blacklisting JWT token.
        
        Args:
            jti: JWT ID (unique identifier)
            user_id: User ID
            token_type: Type of token (access, refresh)
        
        Returns:
            Tuple (success: bool, message: str)
        """
        try:
            # Calculate expiry time
            expires_at = datetime.utcnow() + current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
            
            # Add token to blacklist
            blacklisted_token = BlacklistedToken(
                jti=jti,
                user_id=user_id,
                token_type=token_type,
                expires_at=expires_at
            )
            
            db.session.add(blacklisted_token)
            db.session.commit()
            
            return True, "Logout successful"
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Logout error: {str(e)}")
            return False, "Logout failed"
    
    @staticmethod
    def is_token_blacklisted(jti):
        """
        Check if token is blacklisted.
        
        Args:
            jti: JWT ID
        
        Returns:
            bool: True if blacklisted, False otherwise
        """
        blacklisted = BlacklistedToken.query.filter_by(jti=jti).first()
        
        if blacklisted:
            # If token has expired, remove from blacklist
            if blacklisted.is_expired():
                db.session.delete(blacklisted)
                db.session.commit()
                return False
            return True
        
        return False

