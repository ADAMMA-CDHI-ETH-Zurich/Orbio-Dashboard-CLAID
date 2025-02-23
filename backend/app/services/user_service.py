from app.models.user import User
from flask_bcrypt import check_password_hash, generate_password_hash
from typing import Dict, Any, Optional
from app.constants import UserType
from app import db
from app.models.study_x_user import UserStudy
from app.models.acceleration import AccelerationMetric
from app.models.heartrate import HeartrateMetric
from app.models.study import Study


class UserService:
    @staticmethod
    def get_user_info(user: User) -> Optional[Dict[str, Any]]:
        if not user:
            return None
        user_info = user.to_dict()
        return {
            "id": user_info["id"],
            "name": user_info["name"],
            "surname": user_info["surname"],
            "email": user_info["email"],
            "user_type": user_info["user_type"],
            "weight_in_kg": user_info["weight_in_kg"],
            "height_in_cm": user_info["height_in_cm"],
            "birth_date": user_info["birth_date"],
        }

    @staticmethod
    def get_user_basic_info(user: User) -> Optional[Dict[str, Any]]:
        if not user:
            return None
        user_info = user.to_dict()
        return {
            "id": user_info["id"],
            "name": user_info["name"],
            "surname": user_info["surname"],
            "email": user_info["email"],
            "user_type": user_info["user_type"],
        }

    @staticmethod
    def get_user_info_by_id(id: str) -> Optional[Dict[str, Any]]:
        user = User.query.get(id)
        if not user:
            raise ValueError("User not found")
        return UserService.get_user_info(user)

    @staticmethod
    def get_user_info_by_email(email: str) -> Optional[Dict[str, Any]]:
        user = User.query.filter_by(email=email).first()
        if not user:
            raise ValueError("User not found")
        return UserService.get_user_info(user)

    @staticmethod
    def delete_user(user_id: str, password: str):
        user = User.query.filter_by(id=user_id).first()
        if not user:
            raise ValueError("User not found")
        if not check_password_hash(user.password, password):
            raise ValueError("Invalid password")

        # Remove all study associations for the user
        try:
            user_studies = UserStudy.query.filter_by(user_id=user_id)
            for user_study in user_studies:
                study_id = user_study.study_id
                study = Study.query.filter_by(id=study_id).first()
                study.num_participants -= 1
                db.session.delete(user_study)
            AccelerationMetric.query.filter_by(user_id=user_id).delete()
            HeartrateMetric.query.filter_by(user_id=user_id).delete()
        except Exception as e:
            print(e)
            db.session.rollback()
            raise ValueError("Error deleting user")
        # Delete the user
        db.session.delete(user)
        db.session.commit()

    @staticmethod
    def update_user(user_id: str, user_data: Dict[str, Any]):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        if user_data.get("name"):
            user.name = user_data["name"]
        if user_data.get("surname"):
            user.surname = user_data["surname"]
        if user_data.get("email"):
            user.email = user_data["email"]
        if user_data.get("old_password"):
            if not user_data.get("new_password"):
                raise ValueError("New password is required")
            if check_password_hash(user.password, user_data["old_password"]):
                user.password = generate_password_hash(
                    user_data["new_password"]
                ).decode("utf-8")
            else:
                raise ValueError("Old password is incorrect")
        if user_data.get("weight_in_kg"):
            user.weight_in_kg = user_data["weight_in_kg"]
        if user_data.get("height_in_cm"):
            user.height_in_cm = user_data["height_in_cm"]
        if user_data.get("birth_date"):
            user.birth_date = user_data["birth_date"]
        # save changes
        db.session.commit()
        return UserService.get_user_info(user)
