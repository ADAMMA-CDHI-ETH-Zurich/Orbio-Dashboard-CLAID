from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timedelta
from app.schemas.metric import MetricSchema
from uuid import UUID
from app.constants import ParticipantStatus


class JoinStudyRequestSchema(BaseModel):
    signed_informed_consent: str = Field(..., description="Base64 encoded PDF content")

    class Config:
        json_schema_extra = {
            "example": {"signed_informed_consent": "base64_encoded_string_here"}
        }


class JoinStudyResponseSchema(BaseModel):
    message: str


class UserStudyDataSchema(BaseModel):
    user_id: str
    study_id: str
    participant_num: int
    start_date: datetime
    end_date: datetime
    signed_informed_consent: bytes

    class Config:
        schema_extra = {
            "example": {
                "user_id": "12345",
                "study_id": "67890",
                "participant_num": 1,
                "start_date": "2024-12-14T15:30:00",
                "end_date": "2024-12-15T16:00:00",
                "signed_informed_consent": b"%PDF-1.4 binary content",
            }
        }


class GetStudiesStudySchema(BaseModel):
    study_id: str = Field(..., example="55fa3a95-1f70-4685-bc3c-a135f2e9daa7")
    study_name: str = Field(..., example="study")
    start_date: str = Field(..., example="2024-01-01T00:00:00")
    end_date: str = Field(..., example="2024-12-31T00:00:00")
    status: str = Field(..., example="ongoing")
    description: str = Field(
        ..., example="A study to evaluate the efficacy of a new vaccine for COVID-19"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "study_id": "55fa3a95-1f70-4685-bc3c-a135f2e9daa7",
                "study_name": "study",
                "start_date": "2024-01-01T00:00:00",
                "end_date": "2024-12-31T00:00:00",
                "status": "ongoing",
                "description": "A study to evaluate the efficacy of a new vaccine for COVID-19",
            }
        }


class StudyDataSchema(BaseModel):
    id: UUID = Field(..., example="123e4567-e89b-12d3-a456-426614174000")
    code: str = Field(..., example="1234abcd")
    name: str = Field(..., example="COVID-19 Vaccine Study")
    start_date: datetime = Field(..., example="2024-01-01T00:00:00")
    end_date: datetime = Field(..., example="2024-12-31T23:59:59")
    duration: timedelta = Field(..., example="P3DT3H")
    organizer_name: str = Field(..., example="John Doe")
    description: str = Field(
        "A study to evaluate the efficacy of a new vaccine for COVID-19"
    )
    inclusion_criteria: str = Field(
        "### Inclusion Criteria\n- Age 18-60\n- No underlying conditions"
    )
    informed_consent: str = Field(
        "### Informed Consent\nParticipants must agree to the terms outlined"
    )
    metrics: List[MetricSchema] = Field(...)


class UserStudyDataSchema(BaseModel):
    study_id: str = Field(..., example="123e4567-e89b-12d3-a456-426614174000")
    participant_num: int = Field(..., example=1)
    start_date: datetime = Field(..., example="2024-01-01T00:00:00")
    end_date: datetime = Field(..., example="2024-12-31T23:59:59")
    signed_informed_consent: bytes = Field("PDF binary content")
    status: ParticipantStatus = Field(
        ...,
        example=f"{ParticipantStatus.ONGOING.value}|{ParticipantStatus.COMPLETED.value}",
    )


class GetStudyResponseSchema(BaseModel):
    study_data: StudyDataSchema
    user_study_data: UserStudyDataSchema


class GetStudiesResponseSchema(BaseModel):
    studies: List[GetStudiesStudySchema]

    class Config:
        json_schema_extra = {
            "example": {
                "studies": [
                    {
                        "study_id": "55fa3a95-1f70-4685-bc3c-a135f2e9daa7",
                        "study_name": "study",
                        "start_date": "2024-01-01T00:00:00",
                        "end_date": "2024-12-31T00:00:00",
                        "status": "ongoing",
                    }
                ]
            }
        }


class RemoveStudyResponseSchema(BaseModel):
    message: str = Field(..., example="User has been removed from study")
