# Python Imports
from enum import Enum
from typing import Optional

# Third Party Imports
import strawberry

# Django Imports
from django.db.models import Q


class TeamspaceProjectQueryPathEnum(Enum):
    """
    ORM paths for teamspace project queries.

    Values:
        DIRECT: Query Project model directly.
        SINGLE_FK: Models with ForeignKey to Project.
        MANY_TO_MANY: Models with M2M to Projects.
    """

    DIRECT = "project_projectmember"
    SINGLE_FK = "project__project_projectmember"
    MANY_TO_MANY = "projects__project_projectmember"


@strawberry.type
class TeamspaceHelperObjectType:
    id: Optional[str]
    project_ids: Optional[list[str]]


@strawberry.type
class TeamspaceHelperType:
    is_teamspace_enabled: bool
    is_teamspace_feature_flagged: bool
    query: Q
    teamspace_project_ids: Optional[list[str]] = None
    teamspace_ids: Optional[list[str]] = None
    teamspaces: Optional[list[TeamspaceHelperObjectType]] = None
