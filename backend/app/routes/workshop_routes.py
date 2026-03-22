"""
Workshop management routes for RuralDev.
Trainers can propose workshops, users can view, admins approve/reject.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from marshmallow import ValidationError
from app import db
from app.models import Workshop, User
from app.schemas import WorkshopSchema
from app.utils.decorators import admin_required, trainer_or_admin_required, user_or_higher_required

workshop_bp = Blueprint("workshops", __name__, url_prefix="/api/workshops")


@workshop_bp.route("", methods=["GET"])
@jwt_required(optional=True)
def list_workshops():
    """
    List all approved workshops (public access), or all for authenticated admins.
    
    Query Parameters:
    - status: Filter by status (PENDING, APPROVED, REJECTED)
    - skill_category: Filter by skill (Pottery, Embroidery, etc.)
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
    skill_category = request.args.get("skill_category")
    trainer_id = request.args.get("trainer_id", type=int)

    query = Workshop.query

    if user_role == "TRAINER" and trainer_id is None:
        trainer_id = get_jwt_identity()

    if trainer_id is not None:
        query = query.filter_by(trainer_id=trainer_id)

    if user_role != "ADMIN" and user_role != "TRAINER":
        query = query.filter_by(status="APPROVED")
    elif status:
        query = query.filter_by(status=status)

    if skill_category:
        query = query.filter_by(skill_category=skill_category)
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "success": True,
        "data": WorkshopSchema(many=True).dump(paginated.items),
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200


@workshop_bp.route("", methods=["POST"])
@jwt_required()
@trainer_or_admin_required
def create_workshop():
    """
    Create a new workshop (Trainer or Admin).
    
    Request body:
    {
        "title": "Pottery Basics",
        "description": "Learn hand-thrown pottery...",
        "skill_category": "Pottery",
        "max_participants": 20
    }
    
    Response:
    {
        "success": true,
        "workshop": {...}
    }
    """
    trainer_id = get_jwt_identity()
    
    schema = WorkshopSchema()
    
    try:
        data = schema.load(request.get_json())
    except ValidationError as err:
        from flask import current_app
        current_app.logger.warning("Workshop validation failed: %s", err.messages)
        return jsonify({
            "success": False,
            "error": "Validation Error",
            "message": err.messages,
            "status_code": 400
        }), 400
    
    try:
        workshop = Workshop,
            trainer_id=trainer_id,
            title=data["title"],
            description=data.get("description"),
            skill_category=data["skill_category"],
            max_participants=data.get("max_participants", 20),
            status="PENDING"  # New workshops start as pending
        )
        
        db.session.add(workshop)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Workshop created successfully. Awaiting admin approval.",
            "workshop": WorkshopSchema().dump(workshop)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Creation Failed",
            "message": str(e),
            "status_code": 500
        }), 500


@workshop_bp.route("/<int:workshop_id>", methods=["GET"])
@jwt_required()
@user_or_higher_required
def get_workshop(workshop_id):
    """
    Get workshop details.
    
    Response:
    {
        "success": true,
        "workshop": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Workshop not found",
            "status_code": 404
        }), 404
    
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Non-admins can only view approved workshops
    if user_role != "ADMIN" and workshop.status != "APPROVED":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "Workshop not accessible",
            "status_code": 403
        }), 403
    
    return jsonify({
        "success": True,
        "workshop": WorkshopSchema().dump(workshop)
    }), 200


@workshop_bp.route("/<int:workshop_id>", methods=["PUT"])
@jwt_required()
@trainer_or_admin_required
def update_workshop(workshop_id):
    """
    Update workshop (only trainer who created it or admin).
    
    Request body:
    {
        "title": "Advanced Pottery",
        "description": "...",
        "max_participants": 25
    }
    
    Response:
    {
        "success": true,
        "workshop": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Workshop not found",
            "status_code": 404
        }), 404
    
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Check authorization
    if workshop.trainer_id != current_user_id and user_role != "ADMIN":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You can only update your own workshops",
            "status_code": 403
        }), 403
    
    schema = WorkshopSchema()
    
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
            workshop.title = data["title"]
        if "description" in data:
            workshop.description = data["description"]
        if "skill_category" in data:
            workshop.skill_category = data["skill_category"]
        if "max_participants" in data:
            workshop.max_participants = data["max_participants"]
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Workshop updated successfully",
            "workshop": WorkshopSchema().dump(workshop)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Update Failed",
            "message": str(e),
            "status_code": 500
        }), 500


@workshop_bp.route("/<int:workshop_id>/approve", methods=["PATCH"])
@jwt_required()
@admin_required
def approve_workshop(workshop_id):
    """
    Approve workshop (Admin only).
    
    Response:
    {
        "success": true,
        "workshop": {...}
    }
    """
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Workshop not found",
            "status_code": 404
        }), 404
    
    workshop.status = "APPROVED"
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Workshop approved successfully",
        "workshop": WorkshopSchema().dump(workshop)
    }), 200


@workshop_bp.route("/<int:workshop_id>/reject", methods=["PATCH"])
@jwt_required()
@admin_required
def reject_workshop(workshop_id):
    """
    Reject workshop (Admin only).
    
    Request body:
    {
        "reason": "Does not meet quality standards"
    }
    
    Response:
    {
        "success": true,
        "workshop": {...}
    }
    """
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Workshop not found",
            "status_code": 404
        }), 404
    
    workshop.status = "REJECTED"
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Workshop rejected",
        "workshop": WorkshopSchema().dump(workshop)
    }), 200


@workshop_bp.route("/<int:workshop_id>", methods=["DELETE"])
@jwt_required()
@trainer_or_admin_required
def delete_workshop(workshop_id):
    """
    Delete workshop (trainer or admin).
    
    Response:
    {
        "success": true,
        "message": "Workshop deleted successfully"
    }
    """
    workshop = Workshop.query.get(workshop_id)
    
    if not workshop:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Workshop not found",
            "status_code": 404
        }), 404
    
    current_user_id = get_jwt_identity()
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Check authorization
    if workshop.trainer_id != current_user_id and user_role != "ADMIN":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You can only delete your own workshops",
            "status_code": 403
        }), 403
    
    db.session.delete(workshop)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Workshop deleted successfully"
    }), 200
