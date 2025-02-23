from app.models.user import User
from flask_bcrypt import check_password_hash, generate_password_hash
from typing import Dict, Any, Optional
from app.constants import UserType
from app import db
from app.models.principal_investigator import PrincipalInvestigator
from app.models.study import Study
from app.models.study_x_user import UserStudy
from app.models.study_x_metric import StudyMetric


class PiService:
    @staticmethod
    def get_pi_info(pi: PrincipalInvestigator) -> Dict[str, Any]:
        return {
            "id": pi.id,
            "name": pi.name,
            "surname": pi.surname,
            "email": pi.email,
            "user_type": UserType.PRINCIPAL_INVESTIGATOR,
        }

    @staticmethod
    def get_pi_info_by_id(id: str) -> Optional[Dict[str, Any]]:
        pi = PrincipalInvestigator.query.get(id)
        if not pi:
            raise ValueError("PI not found")
        return PiService.get_pi_info(pi)

    @staticmethod
    def get_pi_info_by_email(email: str) -> Optional[Dict[str, Any]]:
        pi = PrincipalInvestigator.query.filter_by(email=email).first()
        if not pi:
            raise ValueError("PI not found")
        return PiService.get_pi_info(pi)

    @staticmethod
    def delete_pi(pi_id: str, password: str):
        pi = PrincipalInvestigator.query.filter_by(id=pi_id).first()
        if not pi:
            raise ValueError("PI not found")
        if not check_password_hash(pi.password, password):
            raise ValueError("Invalid password")

        # Remove all studies for the PI
        studies = Study.query.filter_by(principal_investigator_id=pi_id)
        for study in studies:
            UserStudy.query.filter_by(study_id=study.id).delete()
            StudyMetric.query.filter_by(study_id=study.id).delete()
            db.session.delete(study)
            db.session.commit()
        # Delete the PI
        db.session.delete(pi)
        db.session.commit()

    @staticmethod
    def update_pi(pi_id: str, pi_data: Dict[str, Any]):
        pi = PrincipalInvestigator.query.get(pi_id)
        if not pi:
            raise ValueError("PI not found")
        if pi_data.get("name"):
            pi.name = pi_data["name"]
        if pi_data.get("surname"):
            pi.surname = pi_data["surname"]
        if pi_data.get("email"):
            pi.email = pi_data["email"]
        if pi_data.get("old_password"):
            if not pi_data.get("new_password"):
                raise ValueError("New password is required")
            if check_password_hash(pi.password, pi_data["old_password"]):
                pi.password = generate_password_hash(pi_data["new_password"]).decode('utf-8')
            else:
                raise ValueError("Old password is incorrect")
        # save changes
        db.session.commit()
        return PiService.get_pi_info(pi)
