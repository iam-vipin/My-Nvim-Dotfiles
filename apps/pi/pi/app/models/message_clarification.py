import uuid
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field

from pi.app.models.base import BaseModel


class MessageClarification(BaseModel, table=True):
    __tablename__ = "message_clarifications"

    chat_id: uuid.UUID = Field(nullable=False, foreign_key="chats.id")
    message_id: uuid.UUID = Field(nullable=False, unique=True, foreign_key="messages.id")

    pending: bool = Field(default=True, nullable=False)
    # Store enum as VARCHAR (not DB enum) per project convention
    kind: str = Field(sa_column=sa.Column(sa.String(16), nullable=False), description="action|retrieval")

    original_query: str = Field(nullable=False)

    # JSON fields
    payload: dict = Field(sa_column=sa.Column(JSONB, nullable=False))
    categories: list[str] = Field(sa_column=sa.Column(JSONB, nullable=False))
    method_tool_names: list[str] = Field(sa_column=sa.Column(JSONB, nullable=False))
    bound_tool_names: list[str] = Field(sa_column=sa.Column(JSONB, nullable=False))

    # Resolution
    answer_text: Optional[str] = Field(default=None, nullable=True)
    resolved_by_message_id: Optional[uuid.UUID] = Field(default=None, nullable=True, foreign_key="messages.id")
    resolved_at: Optional[datetime] = Field(default=None, nullable=True)
