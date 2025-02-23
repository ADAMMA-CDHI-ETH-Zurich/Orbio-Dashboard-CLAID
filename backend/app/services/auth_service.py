from flask_bcrypt import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from typing import Dict, Any, Optional, Tuple
from app.models.user import User
from app.models.principal_investigator import PrincipalInvestigator
from app.services.user_service import UserService
from app.services.principal_investigator_service import PrincipalInvestigatorService
from app import db


class AuthService:
    @staticmethod
    def signup_user(data: Dict[str, Any]) -> Optional[str]:
        if User.query.filter_by(email=data["email"]).first():
            return None
        hashed_password = generate_password_hash(data["password"]).decode("utf-8")
        user_data = {
            "name": data["name"],
            "surname": data["surname"],
            "email": data["email"],
            "password": hashed_password,
            "weight_in_kg": data["weight_in_kg"],
            "height_in_cm": data["height_in_cm"],
            "birth_date": data["birth_date"],
        }
        user = User(**user_data)
        db.session.add(user)
        db.session.commit()
        return create_access_token(identity=user.id)

    @staticmethod
    def signup_principal_investigator(data: Dict[str, Any]) -> Optional[str]:
        if PrincipalInvestigator.query.filter_by(email=data["email"]).first():
            return None
        hashed_password = generate_password_hash(data["password"]).decode("utf-8")
        pi_data = {
            "name": data["name"],
            "surname": data["surname"],
            "email": data["email"],
            "password": hashed_password,
        }
        pi = PrincipalInvestigator(**pi_data)
        db.session.add(pi)
        db.session.commit()
        return create_access_token(identity=pi.id)

    @staticmethod
    def login(
        email: str, password: str, user_type: str
    ) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        if user_type == "user":
            user = User.query.filter_by(email=email).first()

            if not user or not check_password_hash(user.password, password):
                return None, None

            return create_access_token(
                identity=user.id
            ), UserService.get_user_basic_info(user)

        elif user_type == "principal_investigator":
            pi = PrincipalInvestigator.query.filter_by(email=email).first()

            if not pi or not check_password_hash(pi.password, password):
                return None, None

            return create_access_token(
                identity=pi.id
            ), PrincipalInvestigatorService.get_pi_info(pi)

        return None, None
