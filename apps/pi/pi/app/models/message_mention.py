import uuid

from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field

from pi.app.models.base import BaseModel


class MessageMention(BaseModel, table=True):
    """
    Tracks mentions of entities (issues, cycles, modules, etc.) in messages.

    This model stores references to Plane entities that are mentioned in chat messages,
    allowing for tracking what entities are being discussed.
    """

    __tablename__ = "message_mentions"

    # Fields
    mention_type: str = Field(
        nullable=False,
        description="Type of entity mentioned (issues, cycles, modules, etc.)",
    )
    mention_id: uuid.UUID = Field(
        nullable=False,
        description="ID of the associated entity ",
    )
    workspace_id: uuid.UUID = Field(
        nullable=False,
    )

    # Foreign keys
    message_id: uuid.UUID = Field(
        sa_column=Column(UUID(as_uuid=True), ForeignKey("messages.id", name="fk_message_mentions_message_id"), nullable=False)
    )
