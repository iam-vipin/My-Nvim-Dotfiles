"""Structured schemas for artifact response formatting."""

# Import all schema modules for easy access
from .base import BaseArtifactSchema
from .base import BaseProperties
from .base import get_base_fields_for_entity
from .base import get_required_response_structure
from .base import should_include_field_in_response
from .comment import COMMENT_FIELDS
from .comment import CommentArtifact
from .comment import CommentProperties
from .cycle import CYCLE_FIELDS
from .cycle import CycleArtifact
from .cycle import CycleProperties
from .epic import EPIC_FIELDS
from .epic import EpicArtifact
from .epic import EpicProperties
from .module import MODULE_FIELDS
from .module import ModuleArtifact
from .module import ModuleProperties
from .page import PAGE_FIELDS
from .page import PageArtifact
from .page import PageProperties
from .project import PROJECT_FIELDS
from .project import ProjectArtifact
from .project import ProjectProperties
from .workitem import WORKITEM_FIELDS
from .workitem import WorkitemArtifact
from .workitem import WorkitemProperties

__all__ = [
    # Base schemas
    "BaseArtifactSchema",
    "BaseProperties",
    "get_base_fields_for_entity",
    "should_include_field_in_response",
    "get_required_response_structure",
    # Workitem schemas
    "WorkitemArtifact",
    "WorkitemProperties",
    "WORKITEM_FIELDS",
    # Epic schemas
    "EpicArtifact",
    "EpicProperties",
    "EPIC_FIELDS",
    # Project schemas
    "ProjectArtifact",
    "ProjectProperties",
    "PROJECT_FIELDS",
    # Cycle schemas
    "CycleArtifact",
    "CycleProperties",
    "CYCLE_FIELDS",
    # Module schemas
    "ModuleArtifact",
    "ModuleProperties",
    "MODULE_FIELDS",
    # Page schemas
    "PageArtifact",
    "PageProperties",
    "PAGE_FIELDS",
    # Comment schemas
    "CommentArtifact",
    "CommentProperties",
    "COMMENT_FIELDS",
]
