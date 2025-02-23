from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from flask_pydantic_spec import Response
from app import spec
from app.services.study_service import StudyService
from app.schemas.auth_token_schemas import AuthorizationToken
from app.schemas.study import GetStudyInfoByCodeResponseSchema

study_bp = Blueprint("study", __name__)


@study_bp.route("/<study_code>", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=GetStudyInfoByCodeResponseSchema),
    tags=["Study"],
)
def get_study_info_by_code(study_code: str):
    """
    Get study information by study code
    """
    try:
        study_info = StudyService.get_study_info_by_code(study_code)
        return jsonify(study_info), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
