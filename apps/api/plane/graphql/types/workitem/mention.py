# Python imports
from datetime import datetime
from typing import Optional

# Third Party Imports
import strawberry


@strawberry.type
class WorkItemMentionType:
    id: str
    name: str
    sequence_id: int
    project_id: str
    type_id: Optional[str]
    project_identifier: str
    state_group: str
    state_name: str
    archived_at: Optional[datetime] = None
    is_epic: Optional[bool] = False
