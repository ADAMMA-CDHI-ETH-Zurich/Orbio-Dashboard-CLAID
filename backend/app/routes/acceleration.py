from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.acceleration_service import AccelerationService
from app.schemas.auth_token_schemas import AuthorizationToken
from app import spec
from flask_pydantic_spec import Response, Request
from app.schemas.acceleration import GenerateGraphs

acceleration_bp = Blueprint("acceleration", __name__)


@acceleration_bp.route("/xyz", methods=["GET"])
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=None),
    query=GenerateGraphs,
    tags=["User Metric"]
)
@jwt_required()
def get_acceleration_graph_xyz():
    """
    Get Acceleration Graph for X, Y, Z axis for a given timeframe in Unix Timestamps
    """
    user_id = get_jwt_identity()
    from_time = request.args.get("from_time")
    to_time = request.args.get("to_time")
    offset = request.args.get("user_timezone_offset_in_s")
    if not offset:
        offset = 0
    if not from_time or not to_time:
        return jsonify(
            {
                "error": "Provide Timeframe for which to plot the data as 'from' and 'to' in Unix Timestamp"
            },
            400,
        )
    if int(from_time) > int(to_time):
        return jsonify(
            {
                "error": "'from' time should be less than 'to' time"
            },
            400,
        )
    acceleration_graph = AccelerationService.get_acceleration_graph_xyz(
        user_id, from_time, to_time, offset
    )
    return acceleration_graph

@acceleration_bp.route("/vector", methods=["GET"])
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=None),
    query=GenerateGraphs,
    tags=["User Metric"]
)
@jwt_required()
def get_acceleration_graph_vector():
    """
    Get Vector Acceleration Graph for a given timeframe in Unix Timestamps
    """
    user_id = get_jwt_identity()
    from_time = request.args.get("from_time")
    to_time = request.args.get("to_time")
    offset = request.args.get("user_timezone_offset_in_s")
    if not offset:
        offset = 0
    if not from_time or not to_time:
        return jsonify(
            {
                "error": "Provide Timeframe for which to plot the data as 'from' and 'to' in Unix Timestamp"
            },
            400,
        )
    if int(from_time) > int(to_time):
        return jsonify(
            {
                "error": "'from' time should be less than 'to' time"
            },
            400,
        )
    acceleration_graph = AccelerationService.get_acceleration_graph_vector(
        user_id, from_time, to_time, offset
    )
    return acceleration_graph

@acceleration_bp.route("/download", methods=["GET"])
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=None),
    query=GenerateGraphs,
    tags=["User Metric"]
)
@jwt_required()
def get_acceleration_graph_xyz_download():
    """
    Download Acceleration Data for a given timeframe in Unix Timestamps
    """
    user_id = get_jwt_identity()
    from_time = request.args.get("from_time")
    to_time = request.args.get("to_time")
    if not from_time or not to_time:
        return jsonify(
            {
                "error": "Provide Timeframe for which to get the data as 'from' and 'to' in Unix Timestamp"
            },
            400,
        )
    if int(from_time) > int(to_time):
        return jsonify(
            {
                "error": "'from' time should be less than 'to' time"
            },
            400,
        )
    data = AccelerationService.download_data(
        user_id, from_time, to_time
    )
    return data
