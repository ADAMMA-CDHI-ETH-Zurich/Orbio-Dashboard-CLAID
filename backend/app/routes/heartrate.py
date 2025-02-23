from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.heartrate_service import HeartrateService
from app.schemas.auth_token_schemas import AuthorizationToken
from app import spec
from flask_pydantic_spec import Response, Request
from app.schemas.heartrate import GenerateGraphs

heartrate_bp = Blueprint("heartrate", __name__)


@heartrate_bp.route("/graph", methods=["GET"])
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=None),
    query=GenerateGraphs,
    tags=["User Metric"]
)
@jwt_required()
def get_heartrate_graph():
    """
    Get Heartrate Graph for a given timeframe in Unix Timestamps
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
    heartrate_graph = HeartrateService.get_heartrate_graph(
        user_id, from_time, to_time, offset
    )
    return heartrate_graph

@heartrate_bp.route("/download", methods=["GET"])
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=None),
    query=GenerateGraphs,
    tags=["User Metric"]
)
@jwt_required()
def get_heartrate_graph_download():
    """
    Download Heartrate Data for a given timeframe in Unix Timestamps
    """
    user_id = get_jwt_identity()
    from_time = request.args.get("from_time")
    to_time = request.args.get("to_time")
    if not from_time or not to_time:
        return jsonify(
            {
                "error": "Provide Timeframe for which to download the data as 'from' and 'to' in Unix Timestamp"
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
    heartrate_graph = HeartrateService.download_data(
        user_id, from_time, to_time
    )
    return heartrate_graph