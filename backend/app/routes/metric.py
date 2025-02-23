from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from flask_pydantic_spec import Response
from app import spec
from app.services.metric_service import MetricService
from app.schemas.auth_token_schemas import AuthorizationToken
from app.schemas.metric import GetMetricsResponseSchema

metric_bp = Blueprint("metric", __name__)


@metric_bp.route("/", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    resp=Response(HTTP_200=GetMetricsResponseSchema),
    tags=["Metric"],
)
def get_metrics():
    """
    Get all available metrics
    """
    metrics = MetricService.get_all_metrics_info()
    return jsonify({"metrics": metrics}), 200
