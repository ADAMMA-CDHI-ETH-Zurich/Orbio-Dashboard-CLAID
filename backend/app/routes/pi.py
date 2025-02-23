from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_pydantic_spec import Response, Request
from app import spec
from app.services.pi_service import PiService
from app.schemas.auth_token_schemas import AuthorizationToken
from app.schemas.pi import PiInfo, DeletePiRequestSchema, UpdatePiRequestSchema

pi_bp = Blueprint("pi", __name__)


@pi_bp.route("/me", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=PiInfo),
    tags=["PI"],
)
def get_pi_info():
    """
    Get current PI's information
    """
    try:
        pi_id = get_jwt_identity()
        pi_info = PiService.get_pi_info_by_id(pi_id)
        return jsonify(pi_info), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@pi_bp.route("/me", methods=["DELETE"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    body=Request(DeletePiRequestSchema),
    resp=Response(HTTP_204=None),
    tags=["PI"],
)
def delete_pi():
    """
    Delete current PI
    """
    try:
        pi_id = get_jwt_identity()
        PiService.delete_pi(pi_id, request.json["password"])
        return "", 204
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@pi_bp.route("/me", methods=["PUT"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    body=Request(UpdatePiRequestSchema),
    resp=Response(HTTP_200=PiInfo),
    tags=["PI"],
)
def update_pi():
    """
    Update current PI's information
    """
    try:
        pi_id = get_jwt_identity()
        pi_info = PiService.update_pi(pi_id, request.json)
        return jsonify(pi_info), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
