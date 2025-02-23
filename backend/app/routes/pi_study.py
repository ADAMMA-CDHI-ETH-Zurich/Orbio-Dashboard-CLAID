from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_pydantic_spec import Response, Request
import io
from app import spec
from app.schemas.auth_token_schemas import AuthorizationToken
from app.schemas.pi_study import (
    CreateStudyRequestSchema,
    DeleteStudyResponseSchema,
    GetPIStudiesResponseSchema,
    GetStudyParticipantsResponseSchema,
    GetPIStudiesStudySchema,
    GetParticipantMetricQuerySchema,
)
from app.services.study_service import StudyService

pi_study_bp = Blueprint("pi_study", __name__)


@pi_study_bp.route("/studies", methods=["POST"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    body=Request(CreateStudyRequestSchema),
    resp=Response(HTTP_201=GetPIStudiesStudySchema),
    tags=["PI Study"],
)
def create_study():
    """
    Create a new study
    """
    try:
        data = request.json
        pi_id = get_jwt_identity()
        study_info = StudyService.create_study(data, pi_id)
        return jsonify(study_info), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pi_study_bp.route("/studies/<study_id>", methods=["DELETE"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_204=DeleteStudyResponseSchema),
    tags=["PI Study"],
)
def delete_study(study_id):
    """
    Delete a study
    """
    try:
        pi_id = get_jwt_identity()
        StudyService.delete_study(study_id, pi_id)
        return jsonify({"message": f"Study with ID {study_id} deleted"}), 204
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pi_study_bp.route("/studies", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=GetPIStudiesResponseSchema),
    tags=["PI Study"],
)
def get_pi_studies():
    """Get all studies for the authenticated PI"""
    try:
        pi_id = get_jwt_identity()
        studies = StudyService.get_pi_studies(pi_id)
        return jsonify({"studies": studies}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pi_study_bp.route("/studies/<study_id>/participants", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=GetStudyParticipantsResponseSchema),
    tags=["PI Study"],
)
def get_study_participants(study_id: str):
    """Get all participants for a study"""
    try:
        pi_id = get_jwt_identity()
        participants = StudyService.get_participants_from_study(study_id, pi_id)
        return jsonify({"participants": participants}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pi_study_bp.route(
    "/studies/<study_id>/participants/<participant_num>", methods=["DELETE"]
)
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_204=None),
    tags=["PI Study"],
)
def remove_participant_from_study(study_id: str, participant_num: int):
    """Remove a participant from a study"""
    try:
        pi_id = get_jwt_identity()
        StudyService.remove_participant_from_study(study_id, pi_id, participant_num)
        return "", 204
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pi_study_bp.route(
    "/studies/<study_id>/participants/<participant_num>/metrics/<metric_name>",
    methods=["GET"],
)
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    query=GetParticipantMetricQuerySchema,
    tags=["PI Study"],
)
def get_participant_metric(study_id: str, participant_num: int, metric_name: str):
    """Get a participant's specific metric for a study"""
    try:
        pi_id = get_jwt_identity()
        from_time = request.args.get("from_time")
        to_time = request.args.get("to_time")
        offset = request.args.get("user_timezone_offset_in_s")
        if not offset:
            offset = 0
        if not from_time or not to_time:
            return jsonify(
                {
                    "error": "Provide Timeframe for which to plot the data as 'from_time' and 'to_time' in Unix Timestamp"
                },
                400,
            )
        if int(from_time) > int(to_time):
            return jsonify(
                {"error": "'from_time' should be less than 'to_time'"},
                400,
            )
        metric_graph = StudyService.get_participant_metric(
            study_id, pi_id, participant_num, metric_name, from_time, to_time, offset
        )
        return metric_graph, 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@pi_study_bp.route(
"/studies/<study_id>/participants/<participant_num>/download_metrics/<metric_id>",
methods=["GET"],
)
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=None),
    tags=["PI Study"],
)
def download_participant_metric(study_id: str, participant_num: int, metric_id: str):
    """Download participant's data for a metric for a study"""
    try:
        pi_id = get_jwt_identity()
        metric_graph = StudyService.download_participant_metric(
            study_id, pi_id, participant_num, metric_id
        )
        return metric_graph, 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pi_study_bp.route("/studies/<study_id>/participants/signed_informed_consent", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=None),
    tags=["PI Study"],
)
def get_signed_informed_consent(study_id: str):
    """Get the signed informed consent of all the participants of a study"""
    try:
        pi_id = get_jwt_identity()
        zipped_signed_informed_consent = StudyService.get_signed_informed_consent(
            study_id, pi_id
        )
        return send_file(
            io.BytesIO(zipped_signed_informed_consent),
            mimetype="application/zip",
            as_attachment=True,
            download_name=f"study_{study_id}_signed_informed_consents.zip",
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500