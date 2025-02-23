from flask_swagger_ui import get_swaggerui_blueprint
from app.routes.home import home_bp
from app.routes.setup import setup_bp
from app.routes.auth import auth_bp
from app.routes.acceleration import acceleration_bp
from app.routes.heartrate import heartrate_bp
from app.routes.user import user_bp
from app.routes.pi_study import pi_study_bp
from app.routes.user_study import user_study_bp
from app.routes.metric import metric_bp
from app.routes.pi import pi_bp
from app.routes.study import study_bp

API_PREFIX = "/api/v1"


def register_blueprints(app):
    SWAGGER_URL = "/api/docs"
    API_URL = "/api/docs/openapi.json"
    swaggerui_bp = get_swaggerui_blueprint(SWAGGER_URL, API_URL)

    app.register_blueprint(swaggerui_bp, url_prefix=SWAGGER_URL)
    app.register_blueprint(home_bp, url_prefix=f"{API_PREFIX}/home")
    app.register_blueprint(setup_bp, url_prefix=f"{API_PREFIX}/setup")
    app.register_blueprint(auth_bp, url_prefix=f"{API_PREFIX}/auth")
    app.register_blueprint(acceleration_bp, url_prefix=f"{API_PREFIX}/acceleration")
    app.register_blueprint(heartrate_bp, url_prefix=f"{API_PREFIX}/heartrate")
    app.register_blueprint(user_bp, url_prefix=f"{API_PREFIX}/users")
    app.register_blueprint(pi_study_bp, url_prefix=f"{API_PREFIX}/pi")
    app.register_blueprint(user_study_bp, url_prefix=f"{API_PREFIX}/user")
    app.register_blueprint(metric_bp, url_prefix=f"{API_PREFIX}/metrics")
    app.register_blueprint(pi_bp, url_prefix=f"{API_PREFIX}/pi")
    app.register_blueprint(study_bp, url_prefix=f"{API_PREFIX}/studies")
