from sqlalchemy import Column, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app import db


class StudyMetric(db.Model):
    __tablename__ = "studies_x_metrics"

    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), primary_key=True)
    metric_id = Column(UUID(as_uuid=True), ForeignKey("metrics.id"), primary_key=True)

    # Many-to-One Relationship
    # study = relationship("Study", back_populates="metrics")
