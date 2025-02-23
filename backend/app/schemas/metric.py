from pydantic import BaseModel, Field
from uuid import UUID


class MetricSchema(BaseModel):
    id: UUID = Field(
        ..., example="123e4567-e89b-12d3-a456-426614174000", description="Metric ID"
    )
    name: str = Field(..., example="Metric 1", description="Name of the metric")


class GetMetricsResponseSchema(BaseModel):
    metrics: list[MetricSchema]

    class Config:
        json_schema_extra = {
            "example": {
                "metrics": [
                    {"id": "123e4567-e89b-12d3-a456-426614174000", "name": "Metric 1"}
                ]
            }
        }
