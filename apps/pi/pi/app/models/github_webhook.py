# python imports
from typing import Optional

# Third-party imports
from sqlmodel import Field

from pi.app.models.base import BaseModel


class GitHubWebhook(BaseModel, table=True):
    __tablename__ = "github_webhooks"

    commit_id: str = Field(nullable=False, max_length=255)
    source: str = Field(nullable=False, max_length=255)  # repo_name
    branch_name: str = Field(nullable=False, max_length=255)
    processed: bool = Field(nullable=False, default=False)
    files_processed: Optional[int] = Field(nullable=True, default=0)
    error_message: Optional[str] = Field(nullable=True)
