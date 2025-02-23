from flask import Blueprint, request, jsonify
from flask_pydantic_spec import Request, Response
from app import spec
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.principal_investigator_service import PrincipalInvestigatorService
from app.schemas.auth import (
    SignupUserRequest,
    SignupUserResponse,
    SignupPrincipalInvestigatorRequest,
    SignupPrincipalInvestigatorResponse,
    LoginRequest,
    LoginResponse,
)
import logging

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


def create_response(
    data=None, access_token=None, message=None, error=None, status_code=200
):
    response = {
        "data": data,
        "access_token": access_token,
        "message": message,
        "error": error,
    }
    return jsonify({k: v for k, v in response.items() if v is not None}), status_code


@auth_bp.route("/signup/user", methods=["POST"])
@spec.validate(
    body=Request(SignupUserRequest),
    resp=Response(HTTP_201=SignupUserResponse),
    tags=["Authentication"],
)
def signup_user():
    """
    Sign up a new user
    """
    try:
        data = request.json
        logger.info(f"Signup attempt for email: {data['email']}")

        access_token = AuthService.signup_user(data)
        if not access_token:
            return create_response(
                error="A user with this email already exists.",
                status_code=409,
            )
        user_info = UserService.get_user_info_by_email(data["email"])
        return create_response(
            data={
                "id": user_info["id"],
                "name": user_info["name"],
                "surname": user_info["surname"],
                "email": user_info["email"],
                "user_type": "user",
            },
            access_token=access_token,
            message="User signed up successfully.",
            status_code=201,
        )
    except ValueError as e:
        logger.warning(f"ValueError during signup: {str(e)}")
        return create_response(error=str(e), status_code=400)
    except Exception as e:
        logger.error(f"Unexpected error during signup: {str(e)}", exc_info=True)
        return create_response(error="An unexpected error occurred", status_code=500)


@auth_bp.route("/signup/principal_investigator", methods=["POST"])
@spec.validate(
    body=Request(SignupPrincipalInvestigatorRequest),
    resp=Response(HTTP_201=SignupPrincipalInvestigatorResponse),
    tags=["Authentication"],
)
def signup_principal_investigator():
    """
    Sign up a new principal investigator
    """
    data = request.json
    logger.info(f"Signup attempt for email: {data['email']}")

    access_token = AuthService.signup_principal_investigator(data)

    if not access_token:
        return create_response(
            error="A principal investigator with this email already exists.",
            status_code=409,
        )
    pi_info = PrincipalInvestigatorService.get_pi_info_by_email(data["email"])
    return create_response(
        data={
            "id": pi_info["id"],
            "name": pi_info["name"],
            "surname": pi_info["surname"],
            "email": pi_info["email"],
            "user_type": "principal_investigator",
        },
        access_token=access_token,
        message="Principal investigator signed up successfully.",
        status_code=201,
    )


@auth_bp.route("/login", methods=["POST"])
@spec.validate(
    body=Request(LoginRequest),
    resp=Response(HTTP_200=LoginResponse),
    tags=["Authentication"],
)
def login():
    """
    Login as any type of user
    """
    data = request.json
    email = data["email"]
    password = data["password"]
    user_type = data["user_type"]
    logger.info(f"Login attempt for email: {email} as {user_type}")

    access_token, data = AuthService.login(email, password, user_type)
    if not access_token:
        return create_response(error="Invalid email or password", status_code=401)
    return create_response(
        data=data,
        access_token=access_token,
        message="Login successful",
    )
