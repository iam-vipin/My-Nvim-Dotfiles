from typing import Optional

from pydantic import BaseModel


class Cycle(BaseModel):
    name: str
    project: Optional[str] = None
    project_id: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
