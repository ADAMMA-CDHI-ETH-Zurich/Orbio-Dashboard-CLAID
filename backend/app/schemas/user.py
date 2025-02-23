from pydantic import BaseModel, EmailStr, Field
from datetime import date
from app.constants import UserType


class UserInfo(BaseModel):
    name: str = Field(..., title="First Name", example="John")
    surname: str = Field(..., title="Last Name", example="Doe")
    email: EmailStr = Field(..., title="Email", example="john.doe@gmail.com")
    weight_in_kg: float = Field(..., gt=0, title="Weight in Kg", example=70.5)
    height_in_cm: float = Field(..., gt=0, title="Height in Cm", example=175.0)
    birth_date: date = Field(..., title="Birth Date", example="1990-01-01")


class DeleteUserRequestSchema(BaseModel):
    password: str = Field(..., title="Password", example="password")


class UpdateUserRequestSchema(BaseModel):
    name: str = Field(None, title="First Name", example="John")
    surname: str = Field(None, title="Last Name", example="Doe")
    email: EmailStr = Field(None, title="Email", example="john.doe@gmail.com")
    old_password: str = Field(None, title="Old Password", example="password")
    new_password: str = Field(None, title="New Password", example="password")
    weight_in_kg: float = Field(None, gt=0, title="Weight in Kg", example=70.5)
    height_in_cm: float = Field(None, gt=0, title="Height in Cm", example=175.0)
    birth_date: date = Field(None, title="Birth Date", example="1990-01-01")


class UpdateUserResponseSchema(BaseModel):
    name: str = Field(..., title="First Name", example="John")
    surname: str = Field(..., title="Last Name", example="Doe")
    email: EmailStr = Field(..., title="Email", example="john.doe@gmail.com")
    weight_in_kg: float = Field(..., gt=0, title="Weight in Kg", example=70.5)
    height_in_cm: float = Field(..., gt=0, title="Height in Cm", example=175.0)
    birth_date: date = Field(..., title="Birth Date", example="1990-01-01")
    user_type: UserType = Field(..., title="User Type", example=UserType.USER)
