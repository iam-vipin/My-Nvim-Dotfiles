from typing import List
from typing import Optional

from pydantic import BaseModel


class Project(BaseModel):
    name: str
    description: Optional[str] = None
    identifier: Optional[str] = None
    lead: Optional[str] = None
    lead_id: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    members: Optional[List[str]] = None
    member_ids: Optional[List[str]] = None
