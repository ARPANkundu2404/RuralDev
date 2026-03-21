"""
Entry point for RuralDev Flask application.
Run with: python run.py
"""

import os
from app import create_app, db


def main():
    """Initialize and run the Flask app."""
    app = create_app(config_name=os.getenv("FLASK_ENV", "development"))
    
    @app.before_request
    def before_request():
        """Middleware executed before each request."""
        pass
    
    @app.after_request
    def after_request(response):
        """Middleware executed after each request."""
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors."""
        return {
            "success": False,
            "error": "Not Found",
            "message": "The requested resource was not found",
            "status_code": 404
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors."""
        db.session.rollback()
        return {
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred",
            "status_code": 500
        }, 500
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Handle 401 errors."""
        return {
            "success": False,
            "error": "Unauthorized",
            "message": "Authentication required",
            "status_code": 401
        }, 401
    
    @app.errorhandler(403)
    def forbidden(error):
        """Handle 403 errors."""
        return {
            "success": False,
            "error": "Forbidden",
            "message": "Access denied",
            "status_code": 403
        }, 403
    
    print("""
    ╔════════════════════════════════════════╗
    ║       RuralDev - Flask Backend         ║
    ║   Skill → Trust → Income Ecosystem     ║
    ╚════════════════════════════════════════╝
    """)
    
    # Run the app
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("FLASK_ENV") == "development"
    )


if __name__ == "__main__":
    main()
