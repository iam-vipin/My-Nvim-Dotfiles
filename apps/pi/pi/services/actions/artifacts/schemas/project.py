"""Project artifact schema and field definitions."""

from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel

# Field list for projects
PROJECT_FIELDS = ["name", "description", "identifier", "priority", "start_date", "target_date", "state", "lead", "members"]


class ProjectProperties(BaseModel):
    """Properties specific to project artifacts."""

    identifier: Optional[str] = None
    priority: Optional[Dict[str, str]] = None  # {"name": "high"}
    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    target_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-16"}
    state: Optional[str] = None
    lead: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Lead User"}
    members: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "Member"}]


class ProjectArtifact(BaseModel):
    """Complete project artifact schema."""

    name: str
    description: Optional[str] = None
    properties: Optional[ProjectProperties] = None
