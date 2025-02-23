from flask import Flask
from flask_cors import CORS
from flask_pydantic_spec import FlaskPydanticSpec
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, upgrade
from dotenv import load_dotenv
from app.config import Config
from flask_bcrypt import Bcrypt
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
spec = FlaskPydanticSpec("flask", title="Orbio API", version="v1.0", path="/api/docs")


def initialize_database(app):
    """Automatically apply migrations and seed the database."""
    with app.app_context():
        app.logger.info("Applying database migrations...")
        try:
            upgrade()
            app.logger.info("Database migrations applied successfully.")
        except Exception as e:
            app.logger.error(f"Error applying migrations: {e}")

        from app.services.default_service import DefaultService

        try:
            app.logger.info("Seeding database with default data...")
            DefaultService.create_default_data()
            app.logger.info("Database seeded successfully.")
        except Exception as e:
            app.logger.error(f"Error seeding database: {e}")


def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    jwt.init_app(app)
    spec.register(app)
    bcrypt.init_app(app)
    
    try:
        app.logger.info("Connecting to PostgreSQL")
        db.init_app(app)
        app.logger.info("Successfully connected to PostgreSQL")
    except Exception as e:
        app.logger.error(f"Failed to connect to PostgreSQL: {e}")

    migrate.init_app(app, db)

    from app.routes import register_blueprints

    # Include all the routes
    register_blueprints(app)

    initialize_database(app)

    return app
