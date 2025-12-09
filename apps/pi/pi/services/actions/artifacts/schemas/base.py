"""Base schema definitions for artifact response formatting."""

from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel


class BaseArtifactSchema(BaseModel):
    """Base schema for all artifact types."""

    name: str
    description: Optional[str] = None
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}


class BaseProperties(BaseModel):
    """Base properties that can appear in artifact responses."""

    priority: Optional[Dict[str, str]] = None  # {"name": "high"}
    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    target_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-16"}


def get_base_fields_for_entity(entity_type: str) -> List[str]:
    """Get base fields for any entity type."""
    from .comment import COMMENT_FIELDS
    from .cycle import CYCLE_FIELDS
    from .epic import EPIC_FIELDS
    from .module import MODULE_FIELDS
    from .page import PAGE_FIELDS
    from .project import PROJECT_FIELDS
    from .workitem import WORKITEM_FIELDS

    field_map = {
        "workitem": WORKITEM_FIELDS,
        "epic": EPIC_FIELDS,
        "project": PROJECT_FIELDS,
        "cycle": CYCLE_FIELDS,
        "module": MODULE_FIELDS,
        "page": PAGE_FIELDS,
        "comment": COMMENT_FIELDS,
    }

    return field_map.get(entity_type, ["name", "description"])


def should_include_field_in_response(field_name: str, entity_type: str, action: str) -> bool:
    """Determine if a field should be included in the artifact response."""
    base_fields = get_base_fields_for_entity(entity_type)

    # Always include base fields for the entity type
    if field_name in base_fields:
        return True

    # Always include core fields
    core_fields = ["project", "project_id", "entity_info"]
    if field_name in core_fields:
        return True

    return False


def get_required_response_structure(entity_type: str, action: str) -> Dict[str, Any]:
    """Get the required response structure for an entity type and action."""
    base_fields = get_base_fields_for_entity(entity_type)

    structure: Dict[str, Any] = {
        # Top-level fields that should always be present
        "name": None,
        "description": None,
        "project": {"id": None, "identifier": None},
        "properties": {},
    }

    # Add entity-specific property fields
    properties = structure["properties"]
    for field in base_fields:
        if field not in ["name", "description", "project", "project_id"]:
            properties[field] = None

    return structure
