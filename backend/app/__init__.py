"""
RuralDev Flask Application Factory
Initializes the Flask app with all extensions and blueprints.
Uses Flask Blueprints for RESTful API with JWT security.
Note: See MIGRATION_GUIDE.md for upgrading to flask-smorest for Swagger UI.
"""

import os
import logging
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_migrate import Migrate

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()


def create_app(config_name="development"):
    """Application factory function."""
    # Load environment variables from .env file BEFORE creating app config
    load_dotenv()
    
    app = Flask(__name__)
    
    # Load configuration
    if config_name == "testing":
        from config import TestingConfig
        app.config.from_object(TestingConfig)
    elif config_name == "production":
        from config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
    
    # Log database configuration (safe - without password)
    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "Not configured")
    if db_uri and db_uri != "Not configured":
        masked_uri = _mask_db_password(db_uri)
        logger.info(f"Database configured: {masked_uri}")
    else:
        logger.warning("DATABASE_URL not set - will use SQLite fallback")
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Configure CORS for development and production
    if app.config.get("DEBUG"):
        # Development: Allow requests from Vite dev server and local origins
        CORS(
            app,
            resources={
                r"/api/*": {
                    "origins": [
                        "http://localhost:5173",  # Vite dev server
                        "http://localhost:3000",  # Alternative dev port
                        "http://127.0.0.1:5173",
                        "http://127.0.0.1:3000",
                    ],
                    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                    "allow_headers": ["Content-Type", "Authorization"],
                    "supports_credentials": True,
                }
            }
        )
    else:
        # Production: Use environment variable for allowed origins
        allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
        CORS(
            app,
            resources={
                r"/api/*": {
                    "origins": allowed_origins,
                    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                    "allow_headers": ["Content-Type", "Authorization"],
                    "supports_credentials": True,
                }
            }
        )
    
    # Register blueprints for API routes
    # All endpoints are available at /api/<resource>
    # Full documentation available at: see MIGRATION_GUIDE.md for Swagger UI setup
    
    # Register blueprints (existing routes continue to work)
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.workshop_routes import workshop_bp
    from app.routes.job_routes import job_bp
    from app.routes.product_routes import product_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(workshop_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(product_bp)
    
    # Create tables with error handling
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Failed to create database tables: {str(e)}")
            logger.warning("Continuing startup without database - check DATABASE_URL config")
    
    # JWT callback handlers
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        from app.models import User
        identity = jwt_data["sub"]
        user = User.query.filter_by(id=identity).first()
        return user
    
    return app


def _mask_db_password(db_uri):
    """
    Mask the password in database URI for safe logging.
    Converts 'postgresql://user:password@host:port/db' to 'postgresql://user:***@host:port/db'
    """
    if not db_uri:
        return "Not configured"
    
    if "@" not in db_uri:
        return db_uri
    
    try:
        protocol, rest = db_uri.split("://", 1)
        if "@" in rest:
            credentials, hostdb = rest.split("@", 1)
            if ":" in credentials:
                user, _ = credentials.split(":", 1)
                return f"{protocol}://{user}:***@{hostdb}"
        return db_uri
    except Exception:
        return db_uri
