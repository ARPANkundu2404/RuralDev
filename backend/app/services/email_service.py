"""
Email service for sending OTP and notifications.
Implements SMTP-based email sending.
"""

import random
import string
from datetime import datetime, timedelta
from flask import current_app, render_template_string
from app import db
from app.models import Otp


class EmailService:
    """Service for email operations."""
    
    @staticmethod
    def generate_otp(length=6):
        """Generate a random OTP code."""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def create_otp(user, email, purpose="email_verification"):
        """
        Create an OTP record in database.
        
        Args:
            user: User object
            email: Email address
            purpose: Purpose of OTP (email_verification, password_reset, etc.)
        
        Returns:
            Otp object with generated OTP code
        """
        # Invalidate previous OTPs for this email and purpose
        Otp.query.filter_by(email=email, purpose=purpose, is_used=False).update(
            {"is_used": True},
            synchronize_session=False
        )
        db.session.commit()
        
        otp_code = EmailService.generate_otp()
        otp_expiry = datetime.utcnow() + timedelta(
            minutes=current_app.config.get("OTP_EXPIRY_MINUTES", 15)
        )
        
        otp = Otp(
            user_id=user.id,
            otp_code=otp_code,
            email=email,
            purpose=purpose,
            expires_at=otp_expiry
        )
        
        db.session.add(otp)
        db.session.commit()
        
        return otp
    
    @staticmethod
    def send_otp_email(email, otp_code, purpose="email_verification"):
        """
        Send OTP via email.
        
        Args:
            email: Recipient email
            otp_code: OTP code to send
            purpose: Purpose of OTP
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Email template
            if purpose == "email_verification":
                subject = "RuralDev - Email Verification OTP"
                body = f"""
                <h2>Email Verification</h2>
                <p>Your OTP code is: <strong>{otp_code}</strong></p>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                """
            elif purpose == "password_reset":
                subject = "RuralDev - Password Reset OTP"
                body = f"""
                <h2>Password Reset</h2>
                <p>Your OTP code for password reset is: <strong>{otp_code}</strong></p>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                """
            else:
                subject = "RuralDev - Your OTP Code"
                body = f"""
                <h2>Your OTP Code</h2>
                <p>Your OTP code is: <strong>{otp_code}</strong></p>
                <p>This code will expire in 15 minutes.</p>
                """
            
            # In production, use Flask-Mail or similar
            # For development, we'll log the OTP
            current_app.logger.info(
                f"[EMAIL] To: {email}, Subject: {subject}, OTP: {otp_code}"
            )
            
            # Simulated email sending (in production, uncomment actual email logic)
            # from flask_mail import Mail, Message
            # mail = Mail(current_app)
            # msg = Message(
            #     subject=subject,
            #     recipients=[email],
            #     html=body
            # )
            # mail.send(msg)
            
            return True
        
        except Exception as e:
            current_app.logger.error(f"Failed to send email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def verify_otp(email, otp_code):
        """
        Verify an OTP code.
        
        Args:
            email: Email address
            otp_code: OTP code to verify
        
        Returns:
            Tuple (success: bool, message: str, otp: Otp or None)
        """
        otp = Otp.query.filter_by(email=email, otp_code=otp_code).first()
        
        if not otp:
            return False, "Invalid OTP code", None
        
        if otp.is_expired():
            return False, "OTP has expired", otp
        
        if otp.is_used:
            return False, "OTP has already been used", otp
        
        if not otp.can_retry(current_app.config.get("MAX_OTP_ATTEMPTS", 5)):
            return False, "Too many attempts. Request a new OTP", otp
        
        # Mark as used
        otp.is_used = True
        db.session.commit()
        
        return True, "OTP verified successfully", otp
    
    @staticmethod
    def increment_otp_attempts(email, otp_code):
        """Increment OTP attempt counter."""
        otp = Otp.query.filter_by(email=email, otp_code=otp_code).first()
        if otp:
            otp.attempts += 1
            db.session.commit()
