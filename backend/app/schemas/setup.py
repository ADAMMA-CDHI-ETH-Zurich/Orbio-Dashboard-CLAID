from pydantic import BaseModel, Field


class GenerateConfigQuery(BaseModel):
    battery: bool = Field(
        default=True, 
        description="Enable battery collection module", 
        example=False
    )
    acceleration: bool = Field(
        default=True,
        description="Enable acceleration collection module",
        example=False,
    )
    heartrate: bool = Field(
        default=True, 
        description="Enable heart rate collection module", 
        example=False
    )
    oxygen: bool = Field(
        default=True,
        description="Enable oxygen saturation collection module",
        example=False,
    )
