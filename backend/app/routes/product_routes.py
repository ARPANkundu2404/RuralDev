"""
Product management routes for RuralDev.
Sellers can post products, users can view, admins approve/reject.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required
from marshmallow import ValidationError
from app import db
from app.models import Product, User
from app.schemas import ProductSchema
from app.utils.decorators import admin_required, user_or_higher_required

product_bp = Blueprint("products", __name__, url_prefix="/api/products")


@product_bp.route("", methods=["GET"])
@jwt_required(optional=True)
def list_products():
    """
    List all approved products (public access), or all for authenticated admins.
    
    Query Parameters:
    - status: Filter by status (PENDING, APPROVED, REJECTED)
    - category: Filter by category (Pottery, Textiles, etc.)
    - min_price: Minimum price filter
    - max_price: Maximum price filter
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
    category = request.args.get("category")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    
    query = Product.query
    
    # Non-admins only see approved products
    if user_role != "ADMIN":
        query = query.filter_by(status="APPROVED")
    elif status:
        query = query.filter_by(status=status)
    
    if category:
        query = query.filter_by(category=category)
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        "success": True,
        "data": ProductSchema(many=True).dump(paginated.items),
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    }), 200


@product_bp.route("", methods=["POST"])
@jwt_required()
def create_product():
    """
    Create a new product listing (Seller or Admin).
    
    Request body:
    {
        "title": "Handmade Ceramic Vase",
        "description": "Beautiful handcrafted ceramic vase...",
        "price": 45.99,
        "category": "Pottery",
        "image_url": "https://...",
        "stock_quantity": 5
    }
    
    Response:
    {
        "success": true,
        "product": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Only SELLER or ADMIN can create products
    if user_role not in ["SELLER", "ADMIN"]:
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "Only sellers can post products",
            "status_code": 403
        }), 403
    
    seller_id = get_jwt_identity()
    
    schema = ProductSchema()
    
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
        product = Product(
            seller_id=seller_id,
            title=data["title"],
            description=data.get("description"),
            price=data["price"],
            category=data["category"],
            image_url=data.get("image_url"),
            stock_quantity=data.get("stock_quantity", 1),
            status="PENDING"  # New products start as pending
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Product created successfully. Awaiting admin approval.",
            "product": ProductSchema().dump(product)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Creation Failed",
            "message": str(e),
            "status_code": 500
        }), 500


@product_bp.route("/<int:product_id>", methods=["GET"])
@jwt_required()
@user_or_higher_required
def get_product(product_id):
    """
    Get product details.
    
    Response:
    {
        "success": true,
        "product": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Product not found",
            "status_code": 404
        }), 404
    
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Non-admins can only view approved products
    if user_role != "ADMIN" and product.status != "APPROVED":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "Product not accessible",
            "status_code": 403
        }), 403
    
    return jsonify({
        "success": True,
        "product": ProductSchema().dump(product)
    }), 200


@product_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    """
    Update product (only seller who created it or admin).
    
    Request body:
    {
        "title": "Premium Ceramic Vase",
        "description": "...",
        "price": 49.99,
        "stock_quantity": 8
    }
    
    Response:
    {
        "success": true,
        "product": {...}
    }
    """
    from flask_jwt_extended import get_jwt
    
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Product not found",
            "status_code": 404
        }), 404
    
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Check authorization
    if product.seller_id != current_user_id and user_role != "ADMIN":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You can only update your own products",
            "status_code": 403
        }), 403
    
    schema = ProductSchema()
    
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
            product.title = data["title"]
        if "description" in data:
            product.description = data["description"]
        if "price" in data:
            product.price = data["price"]
        if "category" in data:
            product.category = data["category"]
        if "image_url" in data:
            product.image_url = data["image_url"]
        if "stock_quantity" in data:
            product.stock_quantity = data["stock_quantity"]
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Product updated successfully",
            "product": ProductSchema().dump(product)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Update Failed",
            "message": str(e),
            "status_code": 500
        }), 500


@product_bp.route("/<int:product_id>/approve", methods=["PATCH"])
@jwt_required()
@admin_required
def approve_product(product_id):
    """
    Approve product (Admin only).
    
    Response:
    {
        "success": true,
        "product": {...}
    }
    """
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Product not found",
            "status_code": 404
        }), 404
    
    product.status = "APPROVED"
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Product approved successfully",
        "product": ProductSchema().dump(product)
    }), 200


@product_bp.route("/<int:product_id>/reject", methods=["PATCH"])
@jwt_required()
@admin_required
def reject_product(product_id):
    """
    Reject product (Admin only).
    
    Request body:
    {
        "reason": "Does not meet quality standards"
    }
    
    Response:
    {
        "success": true,
        "product": {...}
    }
    """
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Product not found",
            "status_code": 404
        }), 404
    
    product.status = "REJECTED"
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Product rejected",
        "product": ProductSchema().dump(product)
    }), 200


@product_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    """
    Delete product (seller or admin).
    
    Response:
    {
        "success": true,
        "message": "Product deleted successfully"
    }
    """
    from flask_jwt_extended import get_jwt
    
    product = Product.query.get(product_id)
    
    if not product:
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "Product not found",
            "status_code": 404
        }), 404
    
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role")
    
    # Check authorization
    if product.seller_id != current_user_id and user_role != "ADMIN":
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You can only delete your own products",
            "status_code": 403
        }), 403
    
    try:
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Product deleted successfully"
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Deletion Failed",
            "message": str(e),
            "status_code": 500
        }), 500
