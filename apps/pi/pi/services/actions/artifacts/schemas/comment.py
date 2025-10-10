from typing import List
from typing import Optional

from pydantic import BaseModel


class Comment(BaseModel):
    name: str
    project: Optional[str] = None
    state: Optional[str] = None
    state_id: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    assignees: Optional[List[str]] = None
    assignee_ids: Optional[List[str]] = None
    labels: Optional[List[str]] = None
    label_ids: Optional[List[str]] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    cycle: Optional[str] = None
    cycle_id: Optional[str] = None
    module: Optional[str] = None
    module_id: Optional[str] = None
    parent: Optional[str] = None
    parent_id: Optional[str] = None
    comments: Optional[List[str]] = None
    comment_ids: Optional[List[str]] = None
