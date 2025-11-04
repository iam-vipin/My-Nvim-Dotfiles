"""Cycle artifact schema and field definitions."""

from typing import Dict
from typing import Optional

from pydantic import BaseModel

# Field list for cycles
CYCLE_FIELDS = ["name", "description", "start_date", "end_date", "project_id", "project"]


class CycleProperties(BaseModel):
    """Properties specific to cycle artifacts."""

    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    end_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-30"}
    project_id: Optional[str] = None


class CycleArtifact(BaseModel):
    """Complete cycle artifact schema."""

    name: str
    description: Optional[str] = None
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[CycleProperties] = None
