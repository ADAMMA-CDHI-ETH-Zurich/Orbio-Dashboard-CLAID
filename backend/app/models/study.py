from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.schema import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app import db
from datetime import datetime
from app.constants import StudyStatus


class Study(db.Model):
    __tablename__ = "studies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(8), unique=True, default=lambda: uuid.uuid4().hex[:8])
    name = Column(String(50), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  # in hours
    description = Column(Text, nullable=False)
    inclusion_criteria = Column(Text, nullable=False)  # Markdown file content
    informed_consent = Column(Text, nullable=False)  # Markdown file content
    num_participants = Column(Integer, default=0)
    participant_counter = Column(
        Integer, default=0
    )  # This is a monotonically increasing counter
    principal_investigator_id = Column(
        UUID(as_uuid=True), ForeignKey("principal_investigators.id")
    )

    # Relationships
    # principal_investigators = relationship(
    #     "PrincipalInvestigator",
    #     secondary="studies_x_principal_investigators",
    #     back_populates="studies",
    # )
    # metrics = relationship(
    #     "Metric", secondary="studies_x_metrics", back_populates="studies"
    # )
    # users = relationship("User", secondary="studies_x_users", back_populates="studies")

    @property
    def status(self):
        if self.start_date and self.end_date:
            today = datetime.now()
            if today < self.start_date:
                return StudyStatus.NOT_STARTED
            elif self.start_date <= today <= self.end_date:
                return StudyStatus.ONGOING
            else:
                return StudyStatus.COMPLETED
        return StudyStatus.UNDEFINED

    # @property
    # def duration_iso(self):
    #     """Get the duration as an ISO 8601 string."""
    #     if self.duration is not None:
    #         return isodate.duration_isoformat(timedelta(seconds=self.duration))
    #     return None

    # @duration_iso.setter
    # def duration_iso(self, iso_duration):
    #     """Set the duration from an ISO 8601 string."""
    #     parsed_duration = isodate.parse_duration(iso_duration)
    #     self.duration = int(parsed_duration.total_seconds())

    # # One-to-Many Relationship
    # users = relationship(
    #     "UserStudy", back_populates="study", cascade="all, delete-orphan"
    # )

    # # Many-to-One Relationship
    # principal_investigators = relationship(
    #     "PrincipalInvestigatorStudy",
    #     back_populates="study",
    #     cascade="all, delete-orphan",
    # )

    # # One-to-Many Relationship
    # metrics = relationship(
    #     "StudyMetric", back_populates="study", cascade="all, delete-orphan"
    # )
