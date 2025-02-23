from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_pydantic_spec import Response, Request
from app import spec
from app.services.user_service import UserService
from app.schemas.auth_token_schemas import AuthorizationToken
from app.schemas.user import UserInfo, DeleteUserRequestSchema, UpdateUserRequestSchema

user_bp = Blueprint("user", __name__)


@user_bp.route("/me", methods=["GET"])
@jwt_required()
@spec.validate(
    resp=Response(HTTP_200=UserInfo),
    headers=AuthorizationToken,
    tags=["User"],
)
def get_user_info():
    """
    Get current user's information
    """
    try:
        user_id = get_jwt_identity()
        user_info = UserService.get_user_info_by_id(user_id)
        if not user_info:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user_info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route("/me", methods=["DELETE"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    body=Request(DeleteUserRequestSchema),
    resp=Response(HTTP_204=None),
    tags=["User"],
)
def delete_user():
    """
    Delete current user
    """
    try:
        user_id = get_jwt_identity()
        UserService.delete_user(user_id, request.json["password"])
        return "", 204
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_bp.route("/me", methods=["PUT"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    body=Request(UpdateUserRequestSchema),
    resp=Response(HTTP_200=UserInfo),
    tags=["User"],
)
def update_user():
    """
    Update current user's information
    """
    try:
        user_id = get_jwt_identity()
        user_info = UserService.update_user(user_id, request.json)
        return jsonify(user_info), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
