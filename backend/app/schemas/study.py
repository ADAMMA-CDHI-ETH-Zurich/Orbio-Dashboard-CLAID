from pydantic import BaseModel, Field
from typing import List
from datetime import datetime, timedelta
from uuid import UUID
from app.schemas.metric import MetricSchema


class GetStudyInfoByCodeResponseSchema(BaseModel):
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
    num_participants: int = Field(..., example=100)
    status: str = Field(..., example="ongoing")
    metrics: List[MetricSchema] = Field(...)
