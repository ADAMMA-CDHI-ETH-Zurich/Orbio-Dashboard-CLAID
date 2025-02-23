from sqlalchemy import (
    Column,
    String,
    Float,
    Date,
)
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app import db
from app.constants import UserType


class User(db.Model):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    weight_in_kg = Column(Float, nullable=False)
    height_in_cm = Column(Float, nullable=False)
    birth_date = Column(Date, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "surname": self.surname,
            "email": self.email,
            "password": self.password,
            "user_type": UserType.USER,
            "weight_in_kg": self.weight_in_kg,
            "height_in_cm": self.height_in_cm,
            "birth_date": self.birth_date.isoformat(),
        }
