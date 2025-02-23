from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app import db


class PrincipalInvestigatorStudy(db.Model):
    __tablename__ = "studies_x_principal_investigators"

    principal_investigator_id = Column(
        UUID(as_uuid=True), ForeignKey("principal_investigators.id"), primary_key=True
    )
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), primary_key=True)
