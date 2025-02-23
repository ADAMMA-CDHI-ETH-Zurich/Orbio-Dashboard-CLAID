from pydantic import BaseModel, EmailStr, Field
from app.constants import UserType


class PiInfo(BaseModel):
    id: str = Field(..., title="ID", example="123e4567-e89b-12d3-a456-426614174000")
    name: str = Field(..., title="First Name", example="John")
    surname: str = Field(..., title="Last Name", example="Doe")
    email: EmailStr = Field(..., title="Email", example="john.doe@gmail.com")
    user_type: UserType = Field(..., title="User Type", example=UserType.PRINCIPAL_INVESTIGATOR.value)

class DeletePiRequestSchema(BaseModel):
    password: str = Field(..., title="Password", example="password")

class UpdatePiRequestSchema(BaseModel):
    name: str = Field(None, title="First Name", example="John")
    surname: str = Field(None, title="Last Name", example="Doe")
    email: EmailStr = Field(None, title="Email", example="john.doe@gmail.com")
    old_password: str = Field(None, title="Old Password", example="old_password")
    new_password: str = Field(None, title="New Password", example="new_password")
