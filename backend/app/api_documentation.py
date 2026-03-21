"""
Flask-RESTX Route Documentation & Handlers
Defines all API endpoints with Swagger documentation.
Works alongside existing Blueprint routes for comprehensive API docs.
"""

from flask_restx import Resource, fields
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.swagger_models import (
    auth_ns, users_ns, workshops_ns, jobs_ns, products_ns, admin_ns,
    create_all_models
)


# Create API models (passed as parameter from __init__)
def setup_api_documentation(api):
    """Setup all namespace routes with documentation."""
    
    # Create all models
    models = create_all_models(api)
    
    # ─── Auth Namespace Documentation ──────────────────────────────────────────
    
    @auth_ns.route('/register')
    class Register(Resource):
        @auth_ns.expect(models['user_register'])
        @auth_ns.response(201, 'User registered successfully', {'user': models['user_response']})
        @auth_ns.response(400, 'Validation error or user already exists', models['validation_error'])
        def post(self):
            """
            Register a new user.
            
            **Role-based signup**:
            - **USER**: Browse jobs, workshops, marketplace
            - **TRAINER**: Create & manage workshops (PENDING → APPROVED flow)
            - **RECRUITER**: Post job listings (PENDING → APPROVED flow)
            - **SELLER**: List products for sale (PENDING → APPROVED flow)
            
            After registration, you'll receive an OTP via email.
            """
            return {
                'success': True,
                'message': 'Check /apidocs to see the actual /api/auth/register endpoint',
                'note': 'This is documentation. Actual registration works via Blueprint routes.'
            }, 201
    
    
    @auth_ns.route('/login')
    class Login(Resource):
        @auth_ns.expect(models['user_login'])
        @auth_ns.response(200, 'Login successful', models['jwt_response'])
        @auth_ns.response(401, 'Invalid credentials', models['error_response'])
        def post(self):
            """
            Login with email and password.
            
            **Returns**:
            - `access_token`: Use this in the Authorization header: `Bearer <token>`
            - `refresh_token`: Use to obtain new access tokens
            
            **Copy your access_token and click "Authorize" button above to test protected endpoints.**
            """
            return {
                'success': True,
                'message': 'Check Bearer token in response',
            }, 200
    
    
    @auth_ns.route('/verify-email')
    class VerifyEmail(Resource):
        @auth_ns.expect(models['otp_verify'])
        @auth_ns.response(200, 'Email verified', models['user_response'])
        @auth_ns.response(400, 'Invalid or expired OTP', models['error_response'])
        def post(self):
            """
            Verify email with OTP sent during registration.
            
            **Process**:
            1. Register → OTP sent to email
            2. Enter OTP here to verify email
            3. After verification → Can login
            """
            return {
                'success': True,
                'message': 'Actual OTP verification via Blueprint route',
            }, 200
    
    
    # ─── Workshops Namespace Documentation ──────────────────────────────────────
    
    @workshops_ns.route('')
    class WorkshopList(Resource):
        @workshops_ns.doc(security='Bearer')
        @workshops_ns.response(200, 'List of approved workshops')
        def get(self):
            """
            **Get approved workshops**.
            
            **Authorization**: JWT required (any authenticated user)
            
            **Visibility**:
            - **Regular users**: Only see APPROVED workshops
            - **Admin users**: See all workshops with status filtering
            
            **Query parameters**:
            - `page`: Page number (default: 1)
            - `per_page`: Items per page (default: 10)
            - `status`: Filter by status [PENDING, APPROVED, REJECTED] (admin only)
            - `skill_category`: Filter by skill [Pottery, Embroidery, Weaving, Painting]
            """
            return {'success': True, 'message': 'Get /api/workshops via Blueprint'}, 200
        
        @workshops_ns.expect(models['workshop_create'])
        @workshops_ns.response(201, 'Workshop created with PENDING status', models['workshop'])
        @workshops_ns.response(403, 'Only TRAINER or ADMIN can create', models['error_response'])
        @workshops_ns.doc(security='Bearer')
        def post(self):
            """
            **Create workshop (TRAINER authority)**.
            
            **Authority**: TRAINER creates workshop
            
            **Workflow**:
            1. TRAINER submits workshop details
            2. System sets status to **PENDING**
            3. Admin reviews in dashboard
            4. Admin clicks "Approve" → Status changes to **APPROVED**
            5. Workshop visible to all users
            
            **Required fields**:
            - `title`: Workshop name (3-255 chars)
            - `skill_category`: Craft type
            - `description`: What participants will learn
            
            **Defaults**:
            - Status: PENDING (awaiting admin approval)
            - Max participants: 20
            """
            return {'success': True, 'message': 'Post /api/workshops via Blueprint'}, 201
    
    
    @workshops_ns.route('/<int:workshop_id>/approve')
    class WorkshopApprove(Resource):
        @workshops_ns.response(200, 'Workshop approved', models['workshop'])
        @workshops_ns.response(404, 'Workshop not found', models['error_response'])
        @workshops_ns.response(403, 'Admin only', models['error_response'])
        @workshops_ns.doc(security='Bearer')
        def patch(self, workshop_id):
            """
            **Approve workshop (ADMIN only)**.
            
            **Authority**: ADMIN only
            
            **Workflow**:
            - Changes status from **PENDING** → **APPROVED**
            - Workshop becomes visible to all users
            - Trainer is notified
            
            **Test in Admin Dashboard**:
            1. Login as ADMIN
            2. Go to /admin/approvals
            3. Click "Approve" on pending workshop
            """
            return {'success': True, 'message': 'Patch /api/workshops/{id}/approve via Blueprint'}, 200
    
    
    # ─── Jobs Namespace Documentation ──────────────────────────────────────────
    
    @jobs_ns.route('')
    class JobList(Resource):
        @jobs_ns.doc(security='Bearer')
        @jobs_ns.response(200, 'List of approved jobs')
        def get(self):
            """
            **Get approved job listings**.
            
            **Authorization**: JWT required (any authenticated user)
            
            **Visibility**:
            - **Regular users**: Only see APPROVED jobs
            - **Admin users**: See all jobs with filtering
            
            **Query parameters**:
            - `page`: Page number (default: 1)
            - `per_page`: Items per page (default: 10)
            - `status`: Filter by status [PENDING, APPROVED, REJECTED] (admin only)
            - `job_category`: Filter by category
            - `location`: Filter by location
            """
            return {'success': True, 'message': 'Get /api/jobs via Blueprint'}, 200
        
        @jobs_ns.expect(models['job_create'])
        @jobs_ns.response(201, 'Job created with PENDING status', models['job'])
        @jobs_ns.response(403, 'Only RECRUITER or ADMIN can create', models['error_response'])
        @jobs_ns.doc(security='Bearer')
        def post(self):
            """
            **Create job listing (RECRUITER authority)**.
            
            **Authority**: RECRUITER creates job
            
            **Workflow**:
            1. RECRUITER posts job details
            2. System sets status to **PENDING**
            3. Admin reviews in dashboard
            4. Admin clicks "Approve" → Status changes to **APPROVED**
            5. Job visible to all users
            
            **Required fields**:
            - `title`: Job title
            - `job_category`: Artisan, Crafts, Retail, Teaching, Other
            
            **Optional fields**:
            - `description`: Job details
            - `location`: Job location (or "Remote")
            - `salary_range`: e.g., "50000-70000"
            
            **Defaults**:
            - Status: PENDING (awaiting admin approval)
            """
            return {'success': True, 'message': 'Post /api/jobs via Blueprint'}, 201
    
    
    @jobs_ns.route('/<int:job_id>/approve')
    class JobApprove(Resource):
        @jobs_ns.response(200, 'Job approved', models['job'])
        @jobs_ns.response(404, 'Job not found', models['error_response'])
        @jobs_ns.response(403, 'Admin only', models['error_response'])
        @jobs_ns.doc(security='Bearer')
        def patch(self, job_id):
            """
            **Approve job listing (ADMIN only)**.
            
            **Authority**: ADMIN only
            
            **Workflow**:
            - Changes status from **PENDING** → **APPROVED**
            - Job becomes visible to all users
            - Recruiter is notified
            
            **Test in Admin Dashboard**:
            1. Login as ADMIN
            2. Go to /admin/approvals
            3. Click "Approve" on pending job
            """
            return {'success': True, 'message': 'Patch /api/jobs/{id}/approve via Blueprint'}, 200
    
    
    # ─── Products Namespace Documentation ──────────────────────────────────────
    
    @products_ns.route('')
    class ProductList(Resource):
        @products_ns.doc(security='Bearer')
        @products_ns.response(200, 'List of approved products')
        def get(self):
            """
            **Get approved products from marketplace**.
            
            **Authorization**: JWT required (any authenticated user)
            
            **Visibility**:
            - **Regular users**: Only see APPROVED products
            - **Admin users**: See all products with filtering
            
            **Query parameters**:
            - `page`: Page number (default: 1)
            - `per_page`: Items per page (default: 10)
            - `status`: Filter by status [PENDING, APPROVED, REJECTED] (admin only)
            - `category`: Filter by category [Pottery, Textiles, Jewelry, Painting, Other]
            - `min_price`: Filter by minimum price
            - `max_price`: Filter by maximum price
            """
            return {'success': True, 'message': 'Get /api/products via Blueprint'}, 200
        
        @products_ns.expect(models['product_create'])
        @products_ns.response(201, 'Product created with PENDING status', models['product'])
        @products_ns.response(403, 'Only SELLER or ADMIN can create', models['error_response'])
        @products_ns.doc(security='Bearer')
        def post(self):
            """
            **Create product listing (SELLER authority)**.
            
            **Authority**: SELLER creates product
            
            **Workflow**:
            1. SELLER lists product details
            2. System sets status to **PENDING**
            3. Admin reviews in dashboard (checks for price anomalies, duplicate listings)
            4. Admin clicks "Approve" → Status changes to **APPROVED**
            5. Product visible in marketplace
            
            **Required fields**:
            - `title`: Product name
            - `price`: Product price in currency units
            - `category`: Pottery, Textiles, Jewelry, Painting, Other
            
            **Optional fields**:
            - `description`: Product details
            - `image_url`: Product image URL
            - `stock_quantity`: Available quantity
            
            **Defaults**:
            - Status: PENDING (awaiting admin approval)
            - Stock: 1 unit
            
            **Trust Score**:
            - Admin sees fraud risk assessment before approving
            - Checks price anomalies and similarity to existing products
            """
            return {'success': True, 'message': 'Post /api/products via Blueprint'}, 201
    
    
    @products_ns.route('/<int:product_id>/approve')
    class ProductApprove(Resource):
        @products_ns.response(200, 'Product approved', models['product'])
        @products_ns.response(404, 'Product not found', models['error_response'])
        @products_ns.response(403, 'Admin only', models['error_response'])
        @products_ns.doc(security='Bearer')
        def patch(self, product_id):
            """
            **Approve product listing (ADMIN only)**.
            
            **Authority**: ADMIN only
            
            **Workflow**:
            - Changes status from **PENDING** → **APPROVED**
            - Product becomes visible in marketplace
            - Seller is notified
            
            **Admin Review Checklist**:
            - Quality of description and images
            - Reasonable pricing (no anomalies)
            - Not a duplicate listing
            - Authentic artisan product
            
            **Test in Admin Dashboard**:
            1. Login as ADMIN
            2. Go to /admin/approvals
            3. Click "Approve" on pending product
            """
            return {'success': True, 'message': 'Patch /api/products/{id}/approve via Blueprint'}, 200
    
    
    # ─── Admin Namespace Documentation ─────────────────────────────────────────
    
    @admin_ns.route('/approvals')
    class AdminApprovals(Resource):
        @admin_ns.response(200, 'All pending items')
        @admin_ns.doc(security='Bearer')
        def get(self):
            """
            **Admin Dashboard: Get all pending approvals**.
            
            **Authority**: ADMIN only
            
            **Returns**:
            - Pending workshops (TRAINER submissions)
            - Pending jobs (RECRUITER submissions)
            - Pending products (SELLER submissions)
            
            **Trust Score Analysis**:
            - Similarity Score: Checks for duplicate listings
            - Price Anomaly: Flags unusual pricing
            - Overall risk assessment: Low, Medium, High
            
            **Actions**:
            - **Approve**: Changes status to APPROVED, makes visible to users
            - **Reject**: Changes status to REJECTED, provides reason
            """
            return {
                'success': True,
                'message': 'Access Admin Dashboard at /admin/approvals (frontend)'
            }, 200
