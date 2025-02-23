from pydantic import BaseModel, Field


class GenerateGraphs(BaseModel):
    from_time: int = Field(
        description="Unix Timestamp from when on to generate the graph in sec if data is available", example=False
    )
    to_time: int = Field(
        description="Unix Timestamp till when to generate the graph in sec if data is available", example=False   
    )
    user_timezone_offset_in_s: int = Field(
        description="User's timezone offset from UTC in seconds - gets added to the UNIX timestamps in the backend to display the graphs correctly", example=False, default=0   
    )
