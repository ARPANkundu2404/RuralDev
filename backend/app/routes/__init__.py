"""Routes module for RuralDev."""

from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.routes.workshop_routes import workshop_bp

__all__ = ["auth_bp", "user_bp", "workshop_bp"]
