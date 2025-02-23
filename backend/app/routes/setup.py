from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
import logging
from app import spec
from app.services.setup_service import generate_config, generate_MyApplication, get_project
from app.schemas.setup import (
    GenerateConfigQuery,
)
from app.schemas.auth_token_schemas import AuthorizationToken

setup_bp = Blueprint("setup", __name__)
logger = logging.getLogger(__name__)


@setup_bp.route("/config", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    query=GenerateConfigQuery,
    tags=["Setup"],
)
def g_config():
    """
    Get configuration file to setup watch
    """
    try:
        battery = request.args.get("battery", default="true").lower() == "true"
        acceleration = (
            request.args.get("acceleration", default="true").lower() == "true"
        )
        heartrate = request.args.get("heartrate", default="true").lower() == "true"
        oxygen = request.args.get("oxygen", default="true").lower() == "true"

        config = generate_config(
            battery=battery,
            acceleration=acceleration,
            heartrate=heartrate,
            oxygen=oxygen,
        )
        return config
    except Exception as e:
        logger.error(
            f"Unexpected error during generating config: {str(e)}", exc_info=True
        )
        return jsonify({"error": str(e)}), 500


@setup_bp.route("/app", methods=["GET"])
@jwt_required()
@spec.validate(
    headers=AuthorizationToken,
    tags=["Setup"],
)
def g_myApp():
    """
    Get application file to setup watch
    """
    try:
        user_id = get_jwt_identity()
        myApplication = generate_MyApplication(user_id)
        return myApplication
    except Exception as e:
        logger.error(
            f"Unexpected error during generating MyApplication: {str(e)}", exc_info=True
        )
        return jsonify({"error": str(e)}), 500


@setup_bp.route("/project", methods=["GET"])
def g_project():
    """
    Get project folder to setup watch
    """
    try:
        projectFolder = get_project()
        return projectFolder
    except Exception as e:
        logger.error(
            f"Unexpected error during fetching project folder: {str(e)}", exc_info=True
        )
        return jsonify({"error": str(e)}), 500
