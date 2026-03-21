"""
Swagger/OpenAPI models and schemas for RuralDev API.
Defines all request/response models for flask-restx documentation.
"""

from flask_restx import fields, Namespace


# ─── Namespace Definitions ─────────────────────────────────────────────────────
auth_ns = Namespace('auth', description='Authentication & User Management')
users_ns = Namespace('users', description='User Profile Management')
workshops_ns = Namespace('workshops', description='Workshop Management (TRAINER)')
jobs_ns = Namespace('jobs', description='Job Listings (RECRUITER)')
products_ns = Namespace('products', description='Product Marketplace (SELLER)')
admin_ns = Namespace('admin', description='Admin Controls & Approvals')


# ─── Shared Response Model ─────────────────────────────────────────────────────
def create_success_response_model(api, name, data_model):
    """Factory function to create standard success response models."""
    return api.model(name, {
        'success': fields.Boolean(required=True, description='Success flag'),
        'message': fields.String(description='Response message'),
        'data': fields.Nested(data_model, description='Response data'),
    })


# ─── User Models ───────────────────────────────────────────────────────────────
def create_user_models(api):
    """Create all user-related models."""
    
    user_response = api.model('UserResponse', {
        'id': fields.Integer(required=True),
        'username': fields.String(required=True),
        'email': fields.Email(required=True),
        'role': fields.String(enum=['USER', 'TRAINER', 'RECRUITER', 'SELLER', 'ADMIN'], required=True),
        'is_active': fields.Boolean(required=True),
        'is_verified': fields.Boolean(required=True),
        'created_at': fields.DateTime(),
        'updated_at': fields.DateTime(),
    })
    
    user_register = api.model('UserRegister', {
        'username': fields.String(required=True, description='Min 3, max 80 characters'),
        'email': fields.Email(required=True),
        'password': fields.String(required=True, description='Min 8 characters'),
        'role': fields.String(enum=['USER', 'TRAINER', 'RECRUITER', 'SELLER'], description='Defaults to USER'),
    })
    
    user_login = api.model('UserLogin', {
        'email': fields.Email(required=True),
        'password': fields.String(required=True),
    })
    
    otp_verify = api.model('OtpVerify', {
        'email': fields.Email(required=True),
        'otp_code': fields.String(required=True, description='6-digit code'),
    })
    
    jwt_response = api.model('JwtResponse', {
        'access_token': fields.String(required=True),
        'refresh_token': fields.String(required=True),
        'token_type': fields.String(required=True, description='Bearer'),
        'expires_in': fields.Integer(description='Seconds'),
        'user': fields.Nested(user_response),
    })
    
    return {
        'user_response': user_response,
        'user_register': user_register,
        'user_login': user_login,
        'otp_verify': otp_verify,
        'jwt_response': jwt_response,
    }


# ─── Workshop Models ──────────────────────────────────────────────────────────
def create_workshop_models(api):
    """Create all workshop-related models."""
    
    workshop = api.model('Workshop', {
        'id': fields.Integer(required=True),
        'trainer_id': fields.Integer(required=True),
        'title': fields.String(required=True, description='3-255 characters'),
        'description': fields.String(description='Workshop details'),
        'skill_category': fields.String(
            required=True,
            enum=['Pottery', 'Embroidery', 'Weaving', 'Painting', 'Other']
        ),
        'max_participants': fields.Integer(description='Defaults to 20'),
        'status': fields.String(enum=['PENDING', 'APPROVED', 'REJECTED'], description='Defaults to PENDING'),
        'created_at': fields.DateTime(),
        'updated_at': fields.DateTime(),
    })
    
    workshop_create = api.model('WorkshopCreate', {
        'title': fields.String(required=True, description='Workshop title'),
        'description': fields.String(description='Detailed description'),
        'skill_category': fields.String(required=True, enum=['Pottery', 'Embroidery', 'Weaving', 'Painting', 'Other']),
        'max_participants': fields.Integer(description='Max participants allowed'),
    })
    
    return {
        'workshop': workshop,
        'workshop_create': workshop_create,
    }


# ─── Job Models ───────────────────────────────────────────────────────────────
def create_job_models(api):
    """Create all job-related models."""
    
    job = api.model('Job', {
        'id': fields.Integer(required=True),
        'recruiter_id': fields.Integer(required=True),
        'title': fields.String(required=True),
        'description': fields.String(),
        'location': fields.String(description='Job location'),
        'salary_range': fields.String(description='e.g., 50000-70000'),
        'job_category': fields.String(
            required=True,
            enum=['Artisan', 'Crafts', 'Retail', 'Teaching', 'Other']
        ),
        'status': fields.String(enum=['PENDING', 'APPROVED', 'REJECTED'], description='Defaults to PENDING'),
        'created_at': fields.DateTime(),
        'updated_at': fields.DateTime(),
    })
    
    job_create = api.model('JobCreate', {
        'title': fields.String(required=True, description='Job title'),
        'description': fields.String(description='Job details'),
        'location': fields.String(description='Job location'),
        'salary_range': fields.String(description='Salary range e.g., 50000-70000'),
        'job_category': fields.String(required=True, enum=['Artisan', 'Crafts', 'Retail', 'Teaching', 'Other']),
    })
    
    return {
        'job': job,
        'job_create': job_create,
    }


# ─── Product Models ────────────────────────────────────────────────────────────
def create_product_models(api):
    """Create all product-related models."""
    
    product = api.model('Product', {
        'id': fields.Integer(required=True),
        'seller_id': fields.Integer(required=True),
        'title': fields.String(required=True),
        'description': fields.String(),
        'price': fields.Float(required=True, description='Product price in currency units'),
        'category': fields.String(
            required=True,
            enum=['Pottery', 'Textiles', 'Jewelry', 'Painting', 'Other']
        ),
        'image_url': fields.String(description='Product image URL'),
        'stock_quantity': fields.Integer(description='Available stock'),
        'status': fields.String(enum=['PENDING', 'APPROVED', 'REJECTED'], description='Defaults to PENDING'),
        'created_at': fields.DateTime(),
        'updated_at': fields.DateTime(),
    })
    
    product_create = api.model('ProductCreate', {
        'title': fields.String(required=True, description='Product name'),
        'description': fields.String(description='Product description'),
        'price': fields.Float(required=True, description='Product price'),
        'category': fields.String(required=True, enum=['Pottery', 'Textiles', 'Jewelry', 'Painting', 'Other']),
        'image_url': fields.String(description='Product image URL'),
        'stock_quantity': fields.Integer(description='Stock quantity'),
    })
    
    return {
        'product': product,
        'product_create': product_create,
    }


# ─── Error Models ──────────────────────────────────────────────────────────────
def create_error_models(api):
    """Create error response models."""
    
    error_response = api.model('ErrorResponse', {
        'success': fields.Boolean(default=False),
        'error': fields.String(required=True, description='Error type'),
        'message': fields.String(required=True, description='Error message'),
        'status_code': fields.Integer(required=True),
    })
    
    validation_error = api.model('ValidationError', {
        'success': fields.Boolean(default=False),
        'error': fields.String(default='Validation Error'),
        'message': fields.Raw(description='Field-level error messages'),
        'status_code': fields.Integer(default=400),
    })
    
    return {
        'error_response': error_response,
        'validation_error': validation_error,
    }


# ─── Pagination Models ─────────────────────────────────────────────────────────
def create_pagination_models(api):
    """Create pagination wrapper models."""
    
    pagination_meta = api.model('PaginationMeta', {
        'total': fields.Integer(description='Total items'),
        'pages': fields.Integer(description='Total pages'),
        'current_page': fields.Integer(description='Current page'),
        'per_page': fields.Integer(description='Items per page'),
    })
    
    return {
        'pagination_meta': pagination_meta,
    }


# ─── Factory Function ──────────────────────────────────────────────────────────
def create_all_models(api):
    """Create and return all models organized by domain."""
    models = {}
    models.update(create_user_models(api))
    models.update(create_workshop_models(api))
    models.update(create_job_models(api))
    models.update(create_product_models(api))
    models.update(create_error_models(api))
    models.update(create_pagination_models(api))
    return models
