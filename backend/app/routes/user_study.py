from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_pydantic_spec import Response, Request
from app import spec
from app.schemas.auth_token_schemas import AuthorizationToken
from app.schemas.user_study import (
    JoinStudyRequestSchema,
    JoinStudyResponseSchema,
    GetStudyResponseSchema,
    GetStudiesResponseSchema,
    RemoveStudyResponseSchema,
)
from app.services.study_service import StudyService
from typing import List


user_study_bp = Blueprint("user_study", __name__)


@user_study_bp.route("/studies/<study_id>", methods=["POST"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    body=Request(JoinStudyRequestSchema),
    resp=Response(HTTP_201=JoinStudyResponseSchema),
    tags=["User Study"],
)
def join_study(study_id):
    """Join a study"""
    user_id = get_jwt_identity()
    try:
        data = request.get_json(force=True)
        StudyService.join_study(study_id, user_id, data)
        return jsonify({"message": "User joined the study"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_study_bp.route("/studies/<study_id>", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=GetStudyResponseSchema),
    tags=["User Study"],
)
def get_study_info(study_id):
    """
    Get study information for the current user
    """
    user_id = get_jwt_identity()
    try:
        study_info = StudyService.get_study_info_from_user(study_id, user_id)
        return jsonify(study_info), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_study_bp.route("/studies", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=GetStudiesResponseSchema),
    tags=["User Study"],
)
def get_user_studies():
    """Get all studies for the current user"""
    try:
        user_id = get_jwt_identity()
        studies = StudyService.get_joined_studies(user_id)
        return jsonify({"studies": studies}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@user_study_bp.route("/studies/<study_id>", methods=["DELETE"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_204=RemoveStudyResponseSchema),
    tags=["User Study"],
)
def remove_study(study_id):
    """
    Remove current user from study
    """
    user_id = get_jwt_identity()
    try:
        StudyService.remove_user_from_study(study_id, user_id)
        return jsonify({"message": "User has been removed from study"}), 204
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
