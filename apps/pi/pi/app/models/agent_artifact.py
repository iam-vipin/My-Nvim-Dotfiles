# python imports
import uuid
from typing import Optional

# Third-party imports
from sqlalchemy import Column
from sqlalchemy import String
from sqlmodel import Field

from pi.app.models.base import BaseModel
from pi.app.models.enums import AgentArtifactContentType
from pi.app.models.enums import AgentsType


class AgentArtifact(BaseModel, table=True):
    __tablename__ = "agent_artifacts"

    agent_name: AgentsType = Field(sa_column=Column(String(255), nullable=False))
    workspace_id: Optional[uuid.UUID] = Field(nullable=True)
    project_id: Optional[uuid.UUID] = Field(nullable=True)
    issue_id: Optional[uuid.UUID] = Field(nullable=True)
    content: str = Field(nullable=False)
    content_type: AgentArtifactContentType = Field(sa_column=Column(String(50), nullable=False, default=AgentArtifactContentType.MARKDOWN.value))
    version: Optional[int] = Field(nullable=True, default=1)
