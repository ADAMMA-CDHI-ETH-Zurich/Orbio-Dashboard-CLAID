from sqlalchemy import Column, ForeignKey, Integer, Index, Float, DateTime, String, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from app import db


class HeartrateMetric(db.Model):
    __tablename__ = "heartrate_metrics"
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True, nullable=False
    )
    unix_timestamp = Column(BigInteger, primary_key=True, nullable=False)
    heartrate = Column(Integer, nullable=True)
    status = Column(Integer, nullable=True)

    __table_args__ = (Index("ix_heartrate_user_id_time", "user_id", "unix_timestamp"),)
