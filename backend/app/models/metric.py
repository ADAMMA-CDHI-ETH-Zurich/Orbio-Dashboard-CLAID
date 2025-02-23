from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app import db


class Metric(db.Model):
    __tablename__ = "metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
