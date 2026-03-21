"""
Email service for sending welcome emails and password reset notifications.
Implements SMTP-based email sending with Flask-Mail.
"""

from flask import current_app
from flask_mail import Mail, Message
from app import db


class EmailService:
    """Service for email operations."""
    
    mail = None
    
    @staticmethod
    def init_mail(app):
        """Initialize Flask-Mail with the Flask app."""
        EmailService.mail = Mail(app)
    
    @staticmethod
    def send_welcome_email(email, login_url="http://localhost:5173/login"):
        """
        Send welcome email to new user with login link.
        
        Args:
            email: Recipient email
            login_url: URL to login page
        
        Returns:
            True if successful, False otherwise
        """
        try:
            subject = "Welcome to RuralDev!"
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2D5A27;">Welcome to RuralDev!</h2>
                    <p>Your account has been successfully created.</p>
                    <p>You can now log in to your account using the link below:</p>
                    <p>
                        <a href="{login_url}" style="background-color: #2D5A27; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Go to Login
                        </a>
                    </p>
                    <p>Or copy this link: <a href="{login_url}">{login_url}</a></p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">
                        If you didn't create this account, please ignore this email.
                    </p>
                </body>
            </html>
            """
            
            msg = Message(
                subject=subject,
                recipients=[email],
                html=html_body
            )
            
            if EmailService.mail:
                EmailService.mail.send(msg)
                current_app.logger.info(f"[EMAIL] Welcome email sent to {email}")
            else:
                # Fallback: log the email for development
                current_app.logger.info(
                    f"[EMAIL] To: {email}, Subject: {subject}, Body: {html_body}"
                )
            
            return True
        
        except Exception as e:
            current_app.logger.error(f"Failed to send welcome email to {email}: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset_email(email, reset_link):
        """
        Send password reset email with OTP or reset link.
        
        Args:
            email: Recipient email
            reset_link: Password reset link or OTP
        
        Returns:
            True if successful, False otherwise
        """
        try:
            subject = "RuralDev - Password Reset"
            html_body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2D5A27;">Password Reset Request</h2>
                    <p>We received a request to reset your password. Use the link below:</p>
                    <p>
                        <a href="{reset_link}" style="background-color: #2D5A27; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </p>
                    <p>This link will expire in 1 hour.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">
                        If you didn't request this, please ignore this email.
                    </p>
                </body>
            </html>
            """
            
            msg = Message(
                subject=subject,
                recipients=[email],
                html=html_body
            )
            
            if EmailService.mail:
                EmailService.mail.send(msg)
                current_app.logger.info(f"[EMAIL] Password reset email sent to {email}")
            else:
                # Fallback: log the email for development
                current_app.logger.info(
                    f"[EMAIL] To: {email}, Subject: {subject}, Body: {html_body}"
                )
            
            return True
        
        except Exception as e:
            current_app.logger.error(f"Failed to send password reset email to {email}: {str(e)}")
            return False

