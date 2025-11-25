"""Workitem artifact schema and field definitions."""

from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel

# Field list for workitems
WORKITEM_FIELDS = [
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
    "cycle_ids",
    "cycles",
    "module_ids",
    "modules",
    "parent",
]


class WorkitemProperties(BaseModel):
    """Properties specific to workitem artifacts."""

    state: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Done", "group": "completed"}
    priority: Optional[Dict[str, str]] = None  # {"name": "high"}
    assignees: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "user"}]
    labels: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "bug"}]
    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    target_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-16"}
    cycles: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "Sprint 1"}]
    modules: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "Auth"}]
    parent: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Parent Issue"}

    # ID fields (for backward compatibility)
    assignee_ids: Optional[List[str]] = None
    label_ids: Optional[List[str]] = None
    cycle_ids: Optional[List[str]] = None
    module_ids: Optional[List[str]] = None


class WorkitemArtifact(BaseModel):
    """Complete workitem artifact schema."""

    name: str
    description: Optional[str] = None
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[WorkitemProperties] = None
