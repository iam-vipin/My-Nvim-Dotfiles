from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column
from sqlalchemy import String
from sqlmodel import Field

from .base import BaseModel


class VectorizationStatus(str, Enum):
    queued = "queued"
    running = "running"
    success = "success"
    failed = "failed"


class WorkspaceVectorization(BaseModel, table=True):
    __tablename__ = "workspace_vectorizations"
    workspace_id: str = Field(index=True, nullable=False)

    status: VectorizationStatus = Field(sa_column=Column(String(50), nullable=False, default=VectorizationStatus.queued.value, index=True))

    # caller-supplied knobs
    feed_issues: bool = Field(default=True)
    feed_pages: bool = Field(default=True)
    feed_slices: int = Field(default=4)
    batch_size: int = Field(default=32)

    live_sync_enabled: bool = Field(default=True)

    # audit / progress
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    progress_pct: int = 0
    last_error: Optional[str] = None
