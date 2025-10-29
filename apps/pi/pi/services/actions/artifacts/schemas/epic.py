"""Epic artifact schema and field definitions."""

from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel

# Field list for epics
EPIC_FIELDS = [
    "name",
    "description",
    "state",
    "priority",
    "assignee_ids",
    "assignees",
    "label_ids",
    "labels",
    "start_date",
    "target_date",
    "parent_id",
    "parent",
    # Note: Epics don't have cycle_ids/module_ids typically
]


class EpicProperties(BaseModel):
    """Properties specific to epic artifacts."""

    state: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Done", "group": "completed"}
    priority: Optional[Dict[str, str]] = None  # {"name": "high"}
    assignees: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "user"}]
    labels: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "bug"}]
    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    target_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-16"}

    # ID fields (for backward compatibility)
    assignee_ids: Optional[List[str]] = None
    label_ids: Optional[List[str]] = None


class EpicArtifact(BaseModel):
    """Complete epic artifact schema."""

    name: str
    description: Optional[str] = None
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[EpicProperties] = None
