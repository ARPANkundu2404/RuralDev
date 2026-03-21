"""
Marshmallow schemas for request/response validation and serialization.
"""

from marshmallow import Schema, fields, validate, ValidationError, pre_load


class UserRegisterSchema(Schema):
    """Schema for user registration."""
    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=80),
        error_messages={"required": "Username is required"}
    )
    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required"}
    )
    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=255),
        error_messages={"required": "Password is required (min 8 characters)"}
    )
    role = fields.Str(
        missing="USER",
        validate=validate.OneOf(["USER", "TRAINER", "RECRUITER", "SELLER", "ADMIN"]),
        error_messages={"invalid": "Invalid role"}
    )


class UserLoginSchema(Schema):
    """Schema for user login."""
    email = fields.Email(required=True, error_messages={"required": "Email is required"})
    password = fields.Str(required=True, error_messages={"required": "Password is required"})


class OtpVerifySchema(Schema):
    """Schema for OTP verification."""
    email = fields.Email(required=True)
    otp_code = fields.Str(
        required=True,
        validate=validate.Length(equal=6),
        error_messages={"required": "OTP is required"}
    )


class OtpRequestSchema(Schema):
    """Schema for OTP request."""
    email = fields.Email(required=True)
    purpose = fields.Str(
        missing="email_verification",
        validate=validate.OneOf(["email_verification", "password_reset"]),
    )


class UserResponseSchema(Schema):
    """Schema for user response data."""
    id = fields.Int()
    username = fields.Str()
    email = fields.Email()
    role = fields.Str()
    is_active = fields.Bool()
    is_verified = fields.Bool()
    is_profile_complete = fields.Bool()
    bio = fields.Str()
    skills = fields.Str()
    location = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class UserUpdateSchema(Schema):
    """Schema for user profile updates."""
    username = fields.Str(validate=validate.Length(min=3, max=80))
    email = fields.Email()
    password = fields.Str(validate=validate.Length(min=8, max=255))


class ProfileCompleteSchema(Schema):
    """Schema for completing user profile."""
    bio = fields.Str(required=True, validate=validate.Length(min=10, max=500))
    skills = fields.Str(required=True, validate=validate.Length(min=3))
    location = fields.Str(required=True, validate=validate.Length(min=3, max=255))


class JwtResponseSchema(Schema):
    """Schema for JWT authentication response."""
    access_token = fields.Str()
    refresh_token = fields.Str()
    token_type = fields.Str()
    user = fields.Nested(UserResponseSchema)


class ErrorResponseSchema(Schema):
    """Schema for error responses."""
    success = fields.Bool()
    error = fields.Str()
    message = fields.Str()
    status_code = fields.Int()


class WorkshopSchema(Schema):
    """Schema for workshop data."""
    id = fields.Int(dump_only=True)
    trainer_id = fields.Int()
    title = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    description = fields.Str()
    skill_category = fields.Str(
        required=True,
        validate=validate.OneOf(["Pottery", "Embroidery", "Weaving", "Painting", "Other"])
    )
    max_participants = fields.Int(missing=20, validate=validate.Range(min=1, max=100))
    status = fields.Str(
        missing="PENDING",
        validate=validate.OneOf(["PENDING", "APPROVED", "REJECTED"])
    )
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class JobSchema(Schema):
    """Schema for job data."""
    id = fields.Int(dump_only=True)
    recruiter_id = fields.Int()
    title = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    description = fields.Str()
    location = fields.Str()
    salary_range = fields.Str()
    job_category = fields.Str(
        required=True,
        validate=validate.OneOf(["Artisan", "Crafts", "Retail", "Teaching", "Other"])
    )
    status = fields.Str(
        missing="PENDING",
        validate=validate.OneOf(["PENDING", "APPROVED", "REJECTED"])
    )
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ProductSchema(Schema):
    """Schema for product data."""
    id = fields.Int(dump_only=True)
    seller_id = fields.Int()
    title = fields.Str(required=True, validate=validate.Length(min=3, max=255))
    description = fields.Str()
    price = fields.Float(required=True, validate=validate.Range(min=0))
    category = fields.Str(
        required=True,
        validate=validate.OneOf(["Pottery", "Textiles", "Jewelry", "Painting", "Other"])
    )
    image_url = fields.Str()
    stock_quantity = fields.Int(missing=1, validate=validate.Range(min=0))
    status = fields.Str(
        missing="PENDING",
        validate=validate.OneOf(["PENDING", "APPROVED", "REJECTED"])
    )
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
