"""
Authentication routes for RuralDev.
Implements user registration, login, OTP verification, and logout.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from marshmallow import ValidationError
from app.schemas import (
    UserRegisterSchema, UserLoginSchema, OtpVerifySchema,
    OtpRequestSchema, JwtResponseSchema, UserResponseSchema
)
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.utils.decorators import user_or_higher_required
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    
    Request body:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "secure_password123",
        "role": "USER"  # Optional, defaults to USER
    }
    
    Response:
    {
        "success": true,
        "message": "User registered successfully...",
        "user": {...}
    }
    """
    schema = UserRegisterSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    # Register user
    success, user, message = AuthService.register_user(
        username=data["username"],
        email=data["email"],
        password=data["password"],
        role=data.get("role", "USER")
    )
    
    if not success:
        return jsonify({
            "success": False,
            "error": "Registration Failed",
            "message": message,
            "status_code": 400
        }), 400
    
    return jsonify({
        "success": True,
        "message": message,
        "user": UserResponseSchema().dump(user)
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user and return JWT tokens.
    
    Request body:
    {
        "email": "john@example.com",
        "password": "secure_password123"
    }
    
    Response:
    {
        "success": true,
        "message": "Login successful",
        "data": {
            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "token_type": "Bearer",
            "expires_in": 3600,
            "user": {...}
        }
    }
    """
    schema = UserLoginSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    # Authenticate user
    success, tokens, user, message = AuthService.login_user(
        email=data["email"],
        password=data["password"]
    )
    
    if not success:
        status_code = 401 if user else 401
        return jsonify({
            "success": False,
            "error": "Authentication Failed",
            "message": message,
            "status_code": status_code
        }), status_code
    
    return jsonify({
        "success": True,
        "message": message,
        "data": {
            **tokens,
            "user": UserResponseSchema().dump(user)
        }
    }), 200


@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    """
    Verify user email with OTP.
    
    Request body:
    {
        "email": "john@example.com",
        "otp_code": "123456"
    }
    
    Response:
    {
        "success": true,
        "message": "Email verified successfully",
        "user": {...}
    }
    """
    schema = OtpVerifySchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    # Verify email
    success, user, message = AuthService.verify_email(
        email=data["email"],
        otp_code=data["otp_code"]
    )
    
    if not success:
        return jsonify({
            "success": False,
            "error": "Verification Failed",
            "message": message,
            "status_code": 400
        }), 400
    
    return jsonify({
        "success": True,
        "message": message,
        "user": UserResponseSchema().dump(user)
    }), 200


@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    """
    Resend OTP to email.
    
    Request body:
    {
        "email": "john@example.com",
        "purpose": "email_verification"  # Optional
    }
    
    Response:
    {
        "success": true,
        "message": "OTP sent successfully"
    }
    """
    schema = OtpRequestSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    # Resend OTP
    success, message = AuthService.resend_otp(email=data["email"])
    
    if not success:
        return jsonify({
            "success": False,
            "error": "Request Failed",
            "message": message,
            "status_code": 400
        }), 400
    
    return jsonify({
        "success": True,
        "message": message
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """
    Logout user by blacklisting JWT token.
    
    Headers:
    {
        "Authorization": "Bearer <access_token>"
    }
    
    Response:
    {
        "success": true,
        "message": "Logout successful"
    }
    """
    claims = get_jwt()
    user_id = get_jwt_identity()
    jti = claims.get("jti")
    
    success, message = AuthService.logout_user(
        jti=jti,
        user_id=user_id,
        token_type="access"
    )
    
    if not success:
        return jsonify({
            "success": False,
            "error": "Logout Failed",
            "message": message,
            "status_code": 500
        }), 500
    
    return jsonify({
        "success": True,
        "message": message
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
@user_or_higher_required
def get_current_user():
    """
    Get current authenticated user details.
    
    Headers:
    {
        "Authorization": "Bearer <access_token>"
    }
    
    Response:
    {
        "success": true,
        "user": {...}
    }
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "success": False,
            "error": "User Not Found",
            "message": "User not found",
            "status_code": 404
        }), 404
    
    return jsonify({
        "success": True,
        "user": UserResponseSchema().dump(user)
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_access_token():
    """
    Get new access token using refresh token.
    
    Headers:
    {
        "Authorization": "Bearer <refresh_token>"
    }
    
    Response:
    {
        "success": true,
        "data": {
            "access_token": "...",
            "token_type": "Bearer",
            "expires_in": 3600
        }
    }
    """
    from flask_jwt_extended import create_access_token
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or not user.is_active:
        return jsonify({
            "success": False,
            "error": "Authentication Failed",
            "message": "User not found or inactive",
            "status_code": 401
        }), 401
    
    access_token = create_access_token(
        identity=user.id,
        additional_claims={
            "role": user.role,
            "username": user.username,
            "email": user.email
        }
    )
    
    return jsonify({
        "success": True,
        "data": {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": 3600
        }
    }), 200
