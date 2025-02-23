from app.models.principal_investigator import PrincipalInvestigator
from typing import Dict, Any, Optional
from app.constants import UserType


class PrincipalInvestigatorService:
    @staticmethod
    def get_pi_info(pi: PrincipalInvestigator) -> Dict[str, Any]:
        return {
            "id": str(pi.id),
            "name": pi.name,
            "surname": pi.surname,
            "email": pi.email,
            "user_type": UserType.PRINCIPAL_INVESTIGATOR,
        }

    @staticmethod
    def get_pi_info_by_id(id: str) -> Optional[Dict[str, Any]]:
        pi = PrincipalInvestigator.query.get(id)
        if not pi:
            return None
        return PrincipalInvestigatorService.get_pi_info(pi)

    @staticmethod
    def get_pi_info_by_email(email: str) -> Optional[Dict[str, Any]]:
        pi = PrincipalInvestigator.query.filter_by(email=email).first()
        if not pi:
            return None
        return PrincipalInvestigatorService.get_pi_info(pi)
