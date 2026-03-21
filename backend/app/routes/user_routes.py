"""
User management routes.
Includes user profile, listing, and update endpoints.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app import db
from app.models import User
from app.schemas import UserResponseSchema, UserUpdateSchema
from app.utils.decorators import admin_required, user_or_higher_required

user_bp = Blueprint("users", __name__, url_prefix="/api/users")


@user_bp.route("", methods=["GET"])
@jwt_required()
@admin_required
def list_users():
    """
    List all users (Admin only).
    
    Query Parameters:
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10)
    - role: Filter by role (USER, TRAINER, ADMIN)
    
    Response:
    {
        "success": true,
        "data": [
            {...},
            ...
        ],
        "total": 100,
        "pages": 10,
        "current_page": 1
    }
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    role = request.args.get("role")
    
    query = User.query
    
    if role:
        query = query.filter_by(role=role)
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "success": True,
        "data": UserResponseSchema(many=True).dump(paginated.items),
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200


@user_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
@user_or_higher_required
def get_user(user_id):
    """
    Get user by ID.
    Users can only view their own profile, admins can view any.
    
    Response:
    {
        "success": true,
        "user": {...}
    }
    """
    current_user_id = get_jwt_identity()
    claims = request.headers.get("Authorization")
    
    # Check authorization
    if current_user_id != user_id:
        current_user = User.query.get(current_user_id)
        if current_user.role != "ADMIN":
            return jsonify({
                "success": False,
                "error": "Forbidden",
                "message": "You can only view your own profile",
                "status_code": 403
            }), 403
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "User not found",
            "status_code": 404
        }), 404
    
    return jsonify({
        "success": True,
        "user": UserResponseSchema().dump(user)
    }), 200


@user_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
@user_or_higher_required
def update_user(user_id):
    """
    Update user profile.
    Users can only update their own profile, admins can update any.
    
    Request body:
    {
        "username": "new_username",
        "email": "newemail@example.com",
        "password": "new_password123"
    }
    
    Response:
    {
        "success": true,
        "user": {...}
    }
    """
    current_user_id = get_jwt_identity()
    
    # Check authorization
    if current_user_id != user_id:
        current_user = User.query.get(current_user_id)
        if current_user.role != "ADMIN":
            return jsonify({
                "success": False,
                "error": "Forbidden",
                "message": "You can only update your own profile",
                "status_code": 403
            }), 403
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "User not found",
            "status_code": 404
        }), 404
    
    schema = UserUpdateSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    # Update fields
    if "username" in data:
        # Check if username already exists
        existing = User.query.filter_by(username=data["username"]).first()
        if existing and existing.id != user_id:
            return jsonify({
                "success": False,
                "error": "Conflict",
                "message": "Username already exists",
                "status_code": 409
            }), 409
        user.username = data["username"]
    
    if "email" in data:
        # Check if email already exists
        existing = User.query.filter_by(email=data["email"]).first()
        if existing and existing.id != user_id:
            return jsonify({
                "success": False,
                "error": "Conflict",
                "message": "Email already exists",
                "status_code": 409
            }), 409
        user.email = data["email"]
        user.is_verified = False  # Require re-verification
    
    if "password" in data:
        user.set_password(data["password"])
    
    if "bio" in data:
        user.bio = data["bio"]
    
    if "skills" in data:
        user.skills = data["skills"]
    
    if "location" in data:
        user.location = data["location"]
    
    if "is_profile_complete" in data:
        user.is_profile_complete = data["is_profile_complete"]
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "User updated successfully",
        "user": UserResponseSchema().dump(user)
    }), 200


@user_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    """
    Delete user (Admin only).
    
    Response:
    {
        "success": true,
        "message": "User deleted successfully"
    }
    """
    current_user_id = get_jwt_identity()
    
    # Prevent self-deletion
    if current_user_id == user_id:
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You cannot delete your own account",
            "status_code": 403
        }), 403
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "User not found",
            "status_code": 404
        }), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "User deleted successfully"
    }), 200


@user_bp.route("/<int:user_id>/role", methods=["PATCH"])
@jwt_required()
@admin_required
def change_user_role(user_id):
    """
    Change user role (Admin only).
    
    Request body:
    {
        "role": "TRAINER"
    }
    
    Response:
    {
        "success": true,
        "user": {...}
    }
    """
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "User not found",
            "status_code": 404
        }), 404
    
    data = request.get_json()
    new_role = data.get("role", "").upper()
    
    if new_role not in ["USER", "TRAINER", "ADMIN"]:
        return jsonify({
            "success": False,
            "error": "Invalid Role",
            "message": "Role must be one of: USER, TRAINER, ADMIN",
            "status_code": 400
        }), 400
    
    user.role = new_role
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"User role changed to {new_role}",
        "user": UserResponseSchema().dump(user)
    }), 200


@user_bp.route("/<int:user_id>/status", methods=["PATCH"])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """
    Enable/Disable user account (Admin only).
    
    Request body:
    {
        "is_active": true
    }
    
    Response:
    {
        "success": true,
        "user": {...}
    }
    """
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "User not found",
            "status_code": 404
        }), 404
    
    data = request.get_json()
    is_active = data.get("is_active")
    
    if is_active is None:
        return jsonify({
            "success": False,
            "error": "Invalid Input",
            "message": "is_active field is required",
            "status_code": 400
        }), 400
    
    user.is_active = bool(is_active)
    db.session.commit()
    
    status = "activated" if user.is_active else "deactivated"
    
    return jsonify({
        "success": True,
        "message": f"User {status} successfully",
        "user": UserResponseSchema().dump(user)
    }), 200
