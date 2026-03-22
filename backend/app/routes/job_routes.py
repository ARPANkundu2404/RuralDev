"""
Job management routes for RuralDev.
Recruiters can post jobs, users can view, admins approve/reject.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required
from marshmallow import ValidationError
from app import db
from app.models import Job, User
from app.schemas import JobSchema
from app.utils.decorators import admin_required, user_or_higher_required

job_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")


@job_bp.route("", methods=["GET"])
@jwt_required(optional=True)
def list_jobs():
    """
    List all approved jobs (public access), or all for authenticated admins.
    
    Query Parameters:
    - status: Filter by status (PENDING, APPROVED, REJECTED)
    - job_category: Filter by category (Artisan, Crafts, etc.)
    - location: Filter by location
    - page: Page number (default: 1)
    - per_page: Items per page (default: 10)
    
    Response:
    {
        "success": true,
        "data": [...],
        "total": 50,
        "pages": 5,
        "current_page": 1
    }
    """
    claims = get_jwt()
    user_role = claims.get("role") if claims else None
    
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status = request.args.get("status")
    job_category = request.args.get("job_category")
    location = request.args.get("location")
    
    query = Job.query
    
    # Non-admins only see approved jobs
    if user_role != "ADMIN":
        query = query.filter_by(status="APPROVED")
    elif status:
        query = query.filter_by(status=status)
    
    if job_category:
        query = query.filter_by(job_category=job_category)
    
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "success": True,
        "data": JobSchema(many=True).dump(paginated.items),
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200


@job_bp.route("", methods=["POST"])
@jwt_required()
def create_job():
    """
    Create a new job listing (Recruiter or Admin).
    
    Request body:
    {
        "title": "Pottery Instructor",
        "description": "Looking for experienced pottery instructor...",
        "location": "New York, NY",
        "salary_range": "50000-70000",
        "job_category": "Artisan"
    }
    
    Response:
    {
        "success": true,
        "job": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Only RECRUITER or ADMIN can create jobs
    if user_role not in ["RECRUITER", "ADMIN"]:
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "Only recruiters can post jobs",
            "status_code": 403
        }), 403
    
    recruiter_id = get_jwt_identity()
    
    schema = JobSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    try:
        job = Job(
            recruiter_id=recruiter_id,
            title=data["title"],
            description=data.get("description"),
            location=data.get("location"),
            salary_range=data.get("salary_range"),
            job_category=data["job_category"],
            status="PENDING"  # New jobs start as pending
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Job created successfully. Awaiting admin approval.",
            "job": JobSchema().dump(job)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Creation Failed",
            "message": str(e),
            "status_code": 500
        }), 500


@job_bp.route("/<int:job_id>", methods=["GET"])
@jwt_required()
@user_or_higher_required
def get_job(job_id):
    """
    Get job details.
    
    Response:
    {
        "success": true,
        "job": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Job not found",
            "status_code": 404
        }), 404
    
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Non-admins can only view approved jobs
    if user_role != "ADMIN" and job.status != "APPROVED":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "Job not accessible",
            "status_code": 403
        }), 403
    
    return jsonify({
        "success": True,
        "job": JobSchema().dump(job)
    }), 200


@job_bp.route("/<int:job_id>", methods=["PUT"])
@jwt_required()
def update_job(job_id):
    """
    Update job (only recruiter who created it or admin).
    
    Request body:
    {
        "title": "Senior Pottery Instructor",
        "description": "...",
        "salary_range": "60000-80000"
    }
    
    Response:
    {
        "success": true,
        "job": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Job not found",
            "status_code": 404
        }), 404
    
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Check authorization
    if job.recruiter_id != current_user_id and user_role != "ADMIN":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You can only update your own jobs",
            "status_code": 403
        }), 403
    
    schema = JobSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    try:
        if "title" in data:
            job.title = data["title"]
        if "description" in data:
            job.description = data["description"]
        if "location" in data:
            job.location = data["location"]
        if "salary_range" in data:
            job.salary_range = data["salary_range"]
        if "job_category" in data:
            job.job_category = data["job_category"]
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Job updated successfully",
            "job": JobSchema().dump(job)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Update Failed",
            "message": str(e),
            "status_code": 500
        }), 500


@job_bp.route("/<int:job_id>/approve", methods=["PATCH"])
@jwt_required()
@admin_required
def approve_job(job_id):
    """
    Approve job (Admin only).
    
    Response:
    {
        "success": true,
        "job": {...}
    }
    """
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Job not found",
            "status_code": 404
        }), 404
    
    job.status = "APPROVED"
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Job approved successfully",
        "job": JobSchema().dump(job)
    }), 200


@job_bp.route("/<int:job_id>/reject", methods=["PATCH"])
@jwt_required()
@admin_required
def reject_job(job_id):
    """
    Reject job (Admin only).
    
    Request body:
    {
        "reason": "Does not meet quality standards"
    }
    
    Response:
    {
        "success": true,
        "job": {...}
    }
    """
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Job not found",
            "status_code": 404
        }), 404
    
    job.status = "REJECTED"
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Job rejected",
        "job": JobSchema().dump(job)
    }), 200


@job_bp.route("/<int:job_id>", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
    """
    Delete job (recruiter or admin).
    
    Response:
    {
        "success": true,
        "message": "Job deleted successfully"
    }
    """
    from flask_jwt_extended import get_jwt
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Job not found",
            "status_code": 404
        }), 404
    
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Check authorization
    if job.recruiter_id != current_user_id and user_role != "ADMIN":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You can only delete your own jobs",
            "status_code": 403
        }), 403
    
    try:
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Job deleted successfully"
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Deletion Failed",
            "message": str(e),
            "status_code": 500
        }), 500
