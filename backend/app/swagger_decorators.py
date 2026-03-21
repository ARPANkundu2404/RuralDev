"""
Swagger/OpenAPI documentation decorators for Flask-RESTX.
Provides decorators to add API documentation to existing Blueprint routes.
"""

from functools import wraps
from flask_restx import Namespace


# ─── Documentation Decorator Factory ────────────────────────────────────────────
def swagger_doc(namespace: Namespace, model=None, responses=None, security='Bearer'):
    """
    Decorator factory to document a route with Swagger/OpenAPI specs.
    
    Args:
        namespace: Flask-RESTX namespace to register the route
        model: Expected response model (fields.Nested)
        responses: Dict of status codes to response specifications
        security: Authorization type ('Bearer' for JWT)
    
    Usage:
        @swagger_doc(auth_ns, model=user_model, responses={201: 'Created'})
        def create_user():
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs)
        
        # Store metadata on function for later use
        wrapper._swagger_model = model
        wrapper._swagger_responses = responses or {}
        wrapper._swagger_security = security
        wrapper._swagger_namespace = namespace
        
        return wrapper
    return decorator


# ─── Auth Route Documentation ──────────────────────────────────────────────────
def doc_register(ns):
    """Register /auth/register endpoint documentation."""
    def decorator(fn):
        return fn
    return decorator


def doc_login(ns):
    """Register /auth/login endpoint documentation."""
    def decorator(fn):
        return fn
    return decorator


def doc_verify_email(ns):
    """Register /auth/verify-email endpoint documentation."""
    def decorator(fn):
        return fn
    return decorator


# ─── Workshop Route Documentation ──────────────────────────────────────────────
def doc_list_workshops(ns):
    """Register GET /workshops endpoint documentation."""
    def decorator(fn):
        return fn
    return decorator


def doc_create_workshop(ns):
    """
    Register POST /workshops endpoint documentation.
    **Authority**: TRAINER creates workshop → PENDING status → Admin approves.
    """
    def decorator(fn):
        return fn
    return decorator


def doc_approve_workshop(ns):
    """
    Register PATCH /workshops/{id}/approve endpoint documentation.
    **Admin-only**: Changes status from PENDING to APPROVED.
    """
    def decorator(fn):
        return fn
    return decorator


# ─── Job Route Documentation ──────────────────────────────────────────────────
def doc_list_jobs(ns):
    """Register GET /jobs endpoint documentation."""
    def decorator(fn):
        return fn
    return decorator


def doc_create_job(ns):
    """
    Register POST /jobs endpoint documentation.
    **Authority**: RECRUITER creates job → PENDING status → Admin approves.
    """
    def decorator(fn):
        return fn
    return decorator


def doc_approve_job(ns):
    """
    Register PATCH /jobs/{id}/approve endpoint documentation.
    **Admin-only**: Changes status from PENDING to APPROVED.
    """
    def decorator(fn):
        return fn
    return decorator


# ─── Product Route Documentation ──────────────────────────────────────────────
def doc_list_products(ns):
    """Register GET /products endpoint documentation."""
    def decorator(fn):
        return fn
    return decorator


def doc_create_product(ns):
    """
    Register POST /products endpoint documentation.
    **Authority**: SELLER creates product → PENDING status → Admin approves.
    """
    def decorator(fn):
        return fn
    return decorator


def doc_approve_product(ns):
    """
    Register PATCH /products/{id}/approve endpoint documentation.
    **Admin-only**: Changes status from PENDING to APPROVED.
    """
    def decorator(fn):
        return fn
    return decorator
