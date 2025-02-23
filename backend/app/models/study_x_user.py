from sqlalchemy import Column, ForeignKey, Integer, DateTime, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db
from app.constants import ParticipantStatus
import base64
from app.utils.iso_converter import (
    format_datetime_as_iso_utc,
    parse_iso_utc_datetime,
)


class UserStudy(db.Model):
    __tablename__ = "studies_x_users"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    study_id = Column(UUID(as_uuid=True), ForeignKey("studies.id"), primary_key=True)
    participant_num = Column(Integer, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    signed_informed_consent = Column(
        LargeBinary, nullable=False
    )  # New column to store PDF as BLOB

    @property
    def status(self):
        if self.start_date and self.end_date:
            today = datetime.now()
            if today < self.start_date:
                return ParticipantStatus.NOT_STARTED
            elif self.start_date <= today <= self.end_date:
                return ParticipantStatus.ONGOING
            else:
                return ParticipantStatus.COMPLETED
        return ParticipantStatus.UNDEFINED

    # Many-to-One Relationship
    # study = relationship("Study", back_populates="participants")

    # user = relationship("User", back_populates="studies")

    def to_dict(self):
        return {
            "user_id": str(self.user_id),
            "study_id": str(self.study_id),
            "participant_num": self.participant_num,
            "start_date": format_datetime_as_iso_utc(self.start_date),
            "end_date": format_datetime_as_iso_utc(self.end_date),
            "signed_informed_consent": (
                base64.b64encode(self.signed_informed_consent).decode("utf-8")
            ),
            "status": self.status,
        }

    @staticmethod
    def from_dict(data):
        pdf_bytes = (
            base64.b64decode(data["signed_informed_consent"])
            if data.get("signed_informed_consent")
            else None
        )
        return {
            "user_id": data["user_id"],
            "study_id": data["study_id"],
            "participant_num": data["participant_num"],
            "start_date": (
                parse_iso_utc_datetime(data["start_date"])
                if data.get("start_date")
                else None
            ),
            "end_date": (
                parse_iso_utc_datetime(data["end_date"])
                if data.get("end_date")
                else None
            ),
            "signed_informed_consent": pdf_bytes,
        }
