"""
Schemas package for RuralDev.
Exports all Marshmallow schema classes for request/response validation.
"""

from app.schemas.user_schema import (
    UserRegisterSchema,
    UserLoginSchema,
    OtpVerifySchema,
    OtpRequestSchema,
    UserResponseSchema,
    UserUpdateSchema,
    JwtResponseSchema,
    ErrorResponseSchema,
    WorkshopSchema,
    JobSchema,
    ProductSchema,
    ProfileCompleteSchema,
)

__all__ = [
    "UserRegisterSchema",
    "UserLoginSchema",
    "OtpVerifySchema",
    "OtpRequestSchema",
    "UserResponseSchema",
    "UserUpdateSchema",
    "JwtResponseSchema",
    "ErrorResponseSchema",
    "WorkshopSchema",
    "JobSchema",
    "ProductSchema",
    ProfileCompleteSchema,
]
