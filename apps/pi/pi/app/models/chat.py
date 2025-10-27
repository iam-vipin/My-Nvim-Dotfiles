# models/chat.py
import uuid
from typing import Any
from typing import Dict
from typing import Optional

from sqlalchemy import JSON
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field

from pi.app.models.base import BaseModel


class Chat(BaseModel, table=True):
    __tablename__ = "chats"

    # Fields
    title: Optional[str] = Field(default=None, nullable=True, max_length=255)
    description: Optional[str] = Field(default=None, nullable=True)
    icon: Optional[Dict[str, Any]] = Field(sa_type=JSON, default_factory=dict)
    user_id: uuid.UUID = Field(default=None, nullable=False, index=True)
    workspace_id: uuid.UUID = Field(default=None, nullable=True)
    workspace_slug: Optional[str] = Field(default=None, nullable=True, max_length=255)
    is_favorite: bool = Field(default=False, nullable=False, sa_column_kwargs={"server_default": text("false")})
    is_project_chat: bool = Field(default=False, nullable=False, sa_column_kwargs={"server_default": text("false")})
    workspace_in_context: Optional[bool] = Field(default=None, nullable=True)


class UserChatPreference(BaseModel, table=True):
    __tablename__ = "user_chat_preferences"

    # Fields
    is_focus_enabled: bool = Field(default=True, nullable=False)
    focus_project_id: Optional[uuid.UUID] = Field(default=None, nullable=True)
    focus_workspace_id: Optional[uuid.UUID] = Field(default=None, nullable=True)
    user_id: uuid.UUID = Field(default=None, nullable=False)

    # Foreign keys
    chat_id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), ForeignKey("chats.id", name="fk_user_chat_preferences_chat_id"), nullable=False))
