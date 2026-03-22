"""
Authentication routes for RuralDev.
Implements user registration, login, OTP verification, and logout.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from marshmallow import ValidationError
from app.schemas import (
    UserRegisterSchema, UserLoginSchema,
    UserResponseSchema
)
from app.services.auth_service import AuthService
from app.services.email_service import EmailService
from app.utils.decorators import user_or_higher_required
from app.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user (Direct Login - No OTP verification).
    
    Request body:
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "secure_password123",
        "role": "USER"  # Optional, defaults to USER
    }
    
    Response (201):
    {
        "status": 201,
        "message": "Registration successful. Check your email.",
        "data": {
            "token": "...",
            "email": "john@example.com",
            "role": "USER"
        }
    }
    """
    schema = UserRegisterSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "status": 400,
            "message": "Validation Error",
            "error": err.messages
        }), 400
    
    # Register user
    success, user, message = AuthService.register_user(
        username=data["username"],
        email=data["email"],
        password=data["password"],
        role=data.get("role", "USER")
    )
    
    if not success:
        status_code = 409 if "already exists" in message else 400
        return jsonify({
            "status": status_code,
            "message": message
        }), status_code
    
    # Generate JWT token for immediate login
    from flask_jwt_extended import create_access_token
    access_token = create_access_token(
        identity=user.id,
        additional_claims={
            "role": user.role,
            "username": user.username,
            "email": user.email
        }
    )
    
    return jsonify({
        "status": 201,
        "message": "Registration successful. Check your email.",
        "data": {
            "token": access_token,
            "user": UserResponseSchema().dump(user)
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user and return JWT token (Direct Login - Simplified).
    
    Request body:
    {
        "email": "john@example.com",
        "password": "secure_password123"
    }
    
    Response (200):
    {
        "status": 200,
        "message": "Successfully logged in",
        "data": {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
            "email": "john@example.com",
            "role": "USER"
        }
    }
    """
    schema = UserLoginSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "status": 400,
            "message": "Validation Error",
            "error": err.messages
        }), 400
    
    # Authenticate user
    success, user, token, message = AuthService.login_user(
        email=data["email"],
        password=data["password"]
    )
    
    if not success:
        status_code = 401
        return jsonify({
            "status": status_code,
            "message": message
        }), status_code
    
    return jsonify({
        "status": 200,
        "message": "Successfully logged in",
        "data": {
            "token": token,
            "user": UserResponseSchema().dump(user)
        }
    }), 200


@auth_bp.route("/dashboard", methods=["GET"])
@jwt_required()
@user_or_higher_required
def dashboard():
    """
    Get user dashboard data (protected endpoint).
    Accessible to: ADMIN, USER, TRAINER, RECRUITER, SELLER
    
    Headers:
    {
        "Authorization": "Bearer <access_token>"
    }
    
    Response (200):
    {
        "status": 200,
        "message": "Dashboard data retrieved",
        "data": {
            "user": {...},
            "stats": {...}
        }
    }
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "status": 404,
            "message": "User not found"
        }), 404
    
    # Construct dashboard data
    dashboard_data = {
        "user": UserResponseSchema().dump(user),
        "stats": {
            "accountCreated": user.created_at.isoformat(),
            "lastUpdated": user.updated_at.isoformat()
        }
    }
    
    return jsonify({
        "status": 200,
        "message": "Dashboard data retrieved",
        "data": dashboard_data
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
