"""Module artifact schema and field definitions."""

from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel

# Field list for modules
MODULE_FIELDS = ["name", "description", "start_date", "target_date", "status", "project_id", "project", "lead", "members"]


class ModuleProperties(BaseModel):
    """Properties specific to module artifacts."""

    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    target_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-16"}
    status: Optional[str] = None
    project_id: Optional[str] = None
    lead: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Lead User"}
    members: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "Member"}]


class ModuleArtifact(BaseModel):
    """Complete module artifact schema."""

    name: str
    description: Optional[str] = None
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[ModuleProperties] = None
