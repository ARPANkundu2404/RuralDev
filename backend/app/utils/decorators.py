"""
Custom decorators for RBAC and authentication.
Provides @role_required for role-based access control.
"""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def role_required(*allowed_roles):
    """
    Decorator to enforce role-based access control.
    
    Usage:
        @app.route('/admin/dashboard')
        @role_required('ADMIN')
        def admin_dashboard():
            return {'message': 'Admin only'}
        
        @app.route('/approve-workshop/<id>')
        @role_required('ADMIN')
        def approve_workshop(id):
            return {'message': 'Approved'}
    
    Args:
        *allowed_roles: Variable number of role names (e.g., 'ADMIN', 'TRAINER')
    
    Returns:
        403 Forbidden if user doesn't have required role
        401 Unauthorized if JWT is invalid or missing
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Verify JWT is present and valid
            verify_jwt_in_request()
            
            # Get JWT claims
            claims = get_jwt()
            user_role = claims.get("role")
            
            # Check if user has required role
            if user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "error": "Forbidden",
                    "message": f"Access denied. Required roles: {', '.join(allowed_roles)}",
                    "status_code": 403
                }), 403
            
            # User has required role, proceed
            return fn(*args, **kwargs)
        
        return wrapper
    return decorator


def admin_required(fn):
    """
    Convenience decorator for admin-only routes.
    Equivalent to @role_required('ADMIN').
    """
    return role_required('ADMIN')(fn)


def trainer_or_admin_required(fn):
    """
    Convenience decorator for trainer or admin routes.
    Equivalent to @role_required('TRAINER', 'ADMIN').
    """
    return role_required('TRAINER', 'ADMIN')(fn)


def user_or_higher_required(fn):
    """
    Convenience decorator allowing any authenticated user.
    All roles (USER, TRAINER, ADMIN) are allowed.
    """
    return role_required('USER', 'TRAINER', 'ADMIN')(fn)
