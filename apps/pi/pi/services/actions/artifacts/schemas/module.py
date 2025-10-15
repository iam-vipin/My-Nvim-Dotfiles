from typing import List
from typing import Optional

from pydantic import BaseModel


class Module(BaseModel):
    name: str
    project: Optional[str] = None
    project_id: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    status: Optional[str] = None
    lead: Optional[str] = None
    members: Optional[List[str]] = None
    member_ids: Optional[List[str]] = None
