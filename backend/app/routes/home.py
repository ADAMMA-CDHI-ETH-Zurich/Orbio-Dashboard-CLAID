from flask import Blueprint
from typing import Dict

home_bp = Blueprint("home", __name__)


@home_bp.route("/")
def home() -> Dict[str, str]:
    return {"message": "Welcome to the Flask backend!"}
