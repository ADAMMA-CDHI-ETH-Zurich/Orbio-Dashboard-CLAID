from sqlalchemy import Column, String, ForeignKey, Index, Float, DateTime, Integer, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from app import db


class AccelerationMetric(db.Model):
    __tablename__ = "acceleration_metrics"
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True, nullable=False
    )
    unix_timestamp = Column(BigInteger, primary_key=True, nullable=False)
    acceleration_x = Column(Integer, nullable=True)
    acceleration_y = Column(Integer, nullable=True)
    acceleration_z = Column(Integer, nullable=True)
    vector_magnitude = Column(Float, nullable=True)

    __table_args__ = (Index("ix_acceleration_user_id_time", "user_id", "unix_timestamp"),)
