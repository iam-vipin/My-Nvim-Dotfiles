"""Comment artifact schema and field definitions."""

from typing import Dict
from typing import Optional

from pydantic import BaseModel

# Field list for comments
COMMENT_FIELDS = ["name", "description", "project_id", "project", "issue_id", "issue", "actor", "created_at", "updated_at"]


class CommentProperties(BaseModel):
    """Properties specific to comment artifacts."""

    project_id: Optional[str] = None
    issue_id: Optional[str] = None
    issue: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Issue Name"}
    actor: Optional[Dict[str, str]] = None  # {"id": "...", "name": "User Name"}
    created_at: Optional[Dict[str, str]] = None  # {"name": "2025-10-15T10:30:00Z"}
    updated_at: Optional[Dict[str, str]] = None  # {"name": "2025-10-15T10:30:00Z"}


class CommentArtifact(BaseModel):
    """Complete comment artifact schema."""

    name: str  # Usually the comment content or summary
    description: Optional[str] = None  # Full comment content
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[CommentProperties] = None
