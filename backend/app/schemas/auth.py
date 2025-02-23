import uuid
from pydantic import BaseModel, EmailStr, Field
from datetime import date
from app.constants import UserType


class SignupUserRequest(BaseModel):
    name: str = Field(..., title="First Name", example="John")
    surname: str = Field(..., title="Last Name", example="Doe")
    email: EmailStr = Field(..., title="Email", example="john.doe@example.com")
    password: str = Field(..., min_length=1, title="Password", example="password")
    weight_in_kg: float = Field(..., gt=0, title="Weight in Kg", example=70.5)
    height_in_cm: float = Field(..., gt=0, title="Height in Cm", example=175.0)
    birth_date: date = Field(..., title="Birth Date", example="1990-01-01")


class SignupPrincipalInvestigatorRequest(BaseModel):
    name: str = Field(..., title="First Name", example="John")
    surname: str = Field(..., title="Last Name", example="Doe")
    email: EmailStr = Field(..., title="Email", example="john.doe@example.com")
    password: str = Field(..., min_length=1, title="Password", example="password")


class UserData(BaseModel):
    id: uuid.UUID = Field(
        ..., title="User ID", example="36840eee-1bd4-400b-9dee-17c6e7decd6e"
    )
    name: str = Field(..., title="First Name", example="John")
    surname: str = Field(..., title="Last Name", example="Doe")
    email: EmailStr = Field(..., title="Email", example="john.doe@gmail.com")
    user_type: str = Field(
        ...,
        title="User Type",
        example=f"{UserType.USER.value}|{UserType.PRINCIPAL_INVESTIGATOR.value}",
    )


class SignupPrincipalInvestigatorResponse(BaseModel):
    message: str = Field(..., title="Message", example="User signed up successfully")
    access_token: str = Field(..., title="Authorization Token", example="access_token")
    data: UserData


class SignupUserResponse(BaseModel):
    message: str = Field(..., title="Message", example="User signed up successfully")
    access_token: str = Field(..., title="Authorization Token", example="access_token")
    data: UserData


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., title="Email", example="john.doe@example.com")
    password: str = Field(..., min_length=1, title="Password", example="password")
    user_type: str = Field(
        ...,
        title="User Type",
        example=f"{UserType.USER.value}|{UserType.PRINCIPAL_INVESTIGATOR.value}",
    )


class LoginResponse(BaseModel):
    message: str = Field(..., title="Message", example="Login successful")
    access_token: str = Field(..., title="Authorization Token", example="access_token")
    data: UserData
