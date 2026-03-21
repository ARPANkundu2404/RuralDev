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
        Register a new user.
        
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
            # Create new user
            user = User(
                username=username,
                email=email,
                role=role,
                is_active=True,
                is_verified=False
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            # Send OTP for email verification
            otp = EmailService.create_otp(user, email, purpose="email_verification")
            EmailService.send_otp_email(email, otp.otp_code, purpose="email_verification")
            
            return True, user, "User registered successfully. Check email for OTP."
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Registration error: {str(e)}")
            return False, None, "Registration failed. Please try again."
    
    @staticmethod
    def login_user(email, password):
        """
        Authenticate user and generate JWT tokens.
        
        Args:
            email: Email address
            password: Plain text password
        
        Returns:
            Tuple (success: bool, tokens: dict or None, user: User or None, message: str)
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
        
        # Check if email is verified
        if not user.is_verified:
            return False, None, user, "Email not verified. Please verify your email."
        
        try:
            # Create JWT tokens
            access_token = create_access_token(
                identity=user.id,
                additional_claims={
                    "role": user.role,
                    "username": user.username,
                    "email": user.email
                }
            )
            refresh_token = create_refresh_token(identity=user.id)
            
            tokens = {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "Bearer",
                "expires_in": current_app.config["JWT_ACCESS_TOKEN_EXPIRES"].total_seconds()
            }
            
            return True, tokens, user, "Login successful"
        
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
    
    @staticmethod
    def verify_email(email, otp_code):
        """
        Verify user email with OTP.
        
        Args:
            email: Email address
            otp_code: OTP code
        
        Returns:
            Tuple (success: bool, user: User or None, message: str)
        """
        # Verify OTP
        success, message, otp = EmailService.verify_otp(email, otp_code)
        
        if not success:
            if otp:
                EmailService.increment_otp_attempts(email, otp_code)
            return False, None, message
        
        # Find and update user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return False, None, "User not found"
        
        try:
            user.is_verified = True
            db.session.commit()
            return True, user, "Email verified successfully"
        
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Email verification error: {str(e)}")
            return False, None, "Verification failed"
    
    @staticmethod
    def resend_otp(email):
        """
        Resend OTP to email.
        
        Args:
            email: Email address
        
        Returns:
            Tuple (success: bool, message: str)
        """
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return False, "User not found"
        
        if user.is_verified:
            return False, "Email already verified"
        
        try:
            otp = EmailService.create_otp(user, email, purpose="email_verification")
            EmailService.send_otp_email(email, otp.otp_code, purpose="email_verification")
            return True, "OTP sent successfully"
        
        except Exception as e:
            current_app.logger.error(f"Resend OTP error: {str(e)}")
            return False, "Failed to resend OTP"
