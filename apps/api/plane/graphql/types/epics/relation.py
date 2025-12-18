# Python imports
from typing import Optional

# Third-party library imports
import strawberry

# Local imports
from ..issues.relation import WorkItemRelationWorkItemType


@strawberry.type
class EpicRelationType:
    blocking: list[WorkItemRelationWorkItemType]
    blocked_by: list[WorkItemRelationWorkItemType]
    duplicate: list[WorkItemRelationWorkItemType]
    relates_to: list[WorkItemRelationWorkItemType]
    start_after: list[WorkItemRelationWorkItemType]
    start_before: list[WorkItemRelationWorkItemType]
    finish_after: list[WorkItemRelationWorkItemType]
    finish_before: list[WorkItemRelationWorkItemType]
    implements: Optional[list[WorkItemRelationWorkItemType]] = None
    implemented_by: Optional[list[WorkItemRelationWorkItemType]] = None
