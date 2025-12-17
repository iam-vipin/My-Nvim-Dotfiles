from enum import Enum
from typing import Any
from typing import Dict

from pydantic import UUID4
from pydantic import BaseModel
from pydantic import Field
from pydantic import field_validator


class ArtifactUpdateType(Enum):
    MANUAL = "manual"
    PROMPT = "prompt"


class ArtifactUpdateRequest(BaseModel):
    """Request schema for prompt-based artifact updates only (manual edits use execute-action)"""

    query: str = Field(description="User prompt for LLM-based artifact updates")
    workspace_id: UUID4 = Field(description="Workspace ID for the artifact")
    chat_id: UUID4 = Field(description="Chat ID where the artifact belongs")
    artifact_id: UUID4 = Field(description="Artifact ID to update")
    current_artifact_data: Dict[str, Any] = Field(description="Current artifact data from UI (may include unsaved user edits)")
    user_message_id: UUID4 = Field(description="User message ID for MessageFlowStep tracking")
    entity_type: str = Field(description="Entity type of the artifact")
    project_id: UUID4 | None = None

    @field_validator("project_id", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        """Convert empty string to None for optional UUID fields (project creation followups)."""
        if v == "" or v is None:
            return None
        return v


class ArtifactUpdateResponse(BaseModel):
    """Response schema for prompt-based artifact updates"""

    artifact_data: Dict[str, Any] = Field(description="Updated artifact data after applying prompt")
    success: bool = Field(description="Whether the update was successful")
    change_summary: str = Field(description="Summary of changes made to the artifact")
