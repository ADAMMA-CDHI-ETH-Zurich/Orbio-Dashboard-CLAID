from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from app.constants import StudyStatus
from typing import List
from uuid import UUID
from app.schemas.metric import MetricSchema
from app.constants import ParticipantStatus


class CreateStudyRequestSchema(BaseModel):
    name: str = Field(
        ..., example="COVID-19 Vaccine Study", description="Name of the study"
    )
    start_date: datetime = Field(
        ...,
        example="2024-01-01T00:00:00",
        description="Start date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
    )
    end_date: datetime = Field(
        ...,
        example="2024-12-31T23:59:59",
        description="End date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
    )
    duration: timedelta = Field(
        ...,
        example="P3DT3H",
        description="Duration in ISO 8601 format (e.g., P3DT3H for 3 days and 3 hours)",
    )
    description: str = Field(
        ...,
        example="A study to evaluate the efficacy of a new vaccine for COVID-19.",
        description="Description of the study",
    )
    inclusion_criteria: str = Field(
        ...,
        example="### Inclusion Criteria\\n- Age 18-60\\n- No underlying conditions",
        description="Markdown content for inclusion criteria",
    )
    informed_consent: str = Field(
        ...,
        example="### Informed Consent\\nParticipants must agree to the terms outlined.",
        description="Markdown content for informed consent",
    )
    metrics: list[UUID] = Field(
        ...,
        description="List of metric IDs to be associated with the study",
    )


class GetPIStudiesStudySchema(BaseModel):
    id: UUID = Field(
        ..., example="123e4567-e89b-12d3-a456-426614174000", description="Study ID"
    )
    code: str = Field(..., example="1234abcd", description="Unique code for the study")
    name: str = Field(
        ..., example="COVID-19 Vaccine Study", description="Name of the study"
    )
    start_date: datetime = Field(
        ...,
        example="2024-01-01T00:00:00",
        description="Start date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
    )
    end_date: datetime = Field(
        ...,
        example="2024-12-31T23:59:59",
        description="End date in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
    )
    duration: timedelta = Field(
        ...,
        example="P3DT3H",
        description="Duration in ISO 8601 format (e.g., P3DT3H for 3 days and 3 hours)",
    )
    description: str = Field(
        ...,
        example="A study to evaluate the efficacy of a new vaccine for COVID-19.",
        description="Description of the study",
    )
    inclusion_criteria: str = Field(
        ...,
        example="### Inclusion Criteria\\n- Age 18-60\\n- No underlying conditions",
        description="Markdown content for inclusion criteria",
    )
    informed_consent: str = Field(
        ...,
        example="### Informed Consent\\nParticipants must agree to the terms outlined.",
        description="Markdown content for informed consent",
    )
    num_participants: int = Field(
        ..., example=0, description="Number of participants in the study"
    )
    status: str = Field(
        ...,
        example=f"{StudyStatus.NOT_STARTED.value}|{StudyStatus.ONGOING.value}|{StudyStatus.COMPLETED.value}",
        description="Status of the study",
    )
    metrics: list[MetricSchema] = Field(
        ..., description="List of metrics associated with the study"
    )


class GetPIStudiesResponseSchema(BaseModel):
    studies: List[GetPIStudiesStudySchema]


class DeleteStudyResponseSchema(BaseModel):
    message: str = Field(..., example="Study deleted")


class ParticipantSchema(BaseModel):
    participant_num: int = Field(..., example=1)
    start_date: datetime = Field(
        ..., example="2024-01-01T00:00:00", description="Start date of participation"
    )
    end_date: datetime = Field(
        ..., example="2024-12-31T23:59:59", description="End date of participation"
    )
    status: ParticipantStatus = Field(
        ...,
        example=f"{ParticipantStatus.ONGOING.value}|{ParticipantStatus.COMPLETED.value}",
    )
    signed_informed_consent: str = Field(
        ..., 
        description="Base64 encoded PDF of the signed informed consent"
    )
    last_updated: int = Field(
        ..., example=1718534400, description="Unix timestamp of when this participant's metric data was last updated"
    )


class GetStudyParticipantsResponseSchema(BaseModel):
    participants: List[ParticipantSchema]


class GetParticipantMetricQuerySchema(BaseModel):
    from_time: int = Field(
        ..., example=1718534400, description="Start date of data to be retrieved"
    )
    to_time: int = Field(
        ..., example=1718534400, description="End date of data to be retrieved"
    )
