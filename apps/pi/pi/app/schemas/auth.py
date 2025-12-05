from pydantic import UUID4
from pydantic import BaseModel


class User(BaseModel):
    id: UUID4


class AuthResponse(BaseModel):
    is_authenticated: bool
    user: User | None = None
    plane_token: str | None = None
