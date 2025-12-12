from pydantic import UUID4
from pydantic import BaseModel


class SearchAsYouTypeRequest(BaseModel):
    query: str
    workspace_id: UUID4 | None = None
    project_id: UUID4 | None = None


class SearchResult(BaseModel):
    type: str
    id: str
    title: str
