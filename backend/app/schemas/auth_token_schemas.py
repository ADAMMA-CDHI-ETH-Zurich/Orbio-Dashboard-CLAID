from pydantic import BaseModel, Field


class AuthorizationToken(BaseModel):
    Authorization: str = Field(
        ..., title="Bearer Auth Token", description="Bearer Auth Token"
    )
