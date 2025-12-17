import uuid
from typing import Any
from typing import Optional

from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlmodel import Field

from pi.app.models.base import BaseModel


class ActionArtifact(BaseModel, table=True):
    __tablename__ = "action_artifacts"

    # Fields
    sequence: int = Field(default=1, nullable=False)  # order within the message

    entity: str = Field(nullable=False, max_length=64)  # "issue", "project", "cycle", ...
    entity_id: Optional[uuid.UUID] = Field(nullable=True)

    action: str = Field(nullable=False, max_length=32)  # "create", "update", "delete", "link", ...

    data: dict[str, Any] = Field(sa_column=Column(JSONB, nullable=False))
    is_executed: bool = Field(default=False, nullable=False)
    success: bool = Field(default=False, nullable=False)  # Whether the action succeeded

    # Foreign keys
    message_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("messages.id", name="fk_action_artifacts_message_id"),
            nullable=True,
            index=True,
        ),
    )
    chat_id: uuid.UUID = Field(
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("chats.id", name="fk_action_artifacts_chat_id"),
            nullable=False,
            index=True,
        ),
    )


class ActionArtifactVersion(BaseModel, table=True):
    __tablename__ = "action_artifact_versions"

    # Fields
    version_number: int = Field(nullable=False)
    data: dict[str, Any] = Field(sa_column=Column(JSONB, nullable=False))
    change_type: str = Field(nullable=False, max_length=50)  # "initial", "manual_edit", "sub_chat"
    is_latest: bool = Field(default=True, nullable=False)
    is_executed: bool = Field(default=False, nullable=False)
    success: bool = Field(default=False, nullable=False)

    # Foreign keys
    artifact_id: uuid.UUID = Field(
        default=None,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("action_artifacts.id", name="fk_action_artifact_versions_artifact_id"),
            nullable=True,
            index=True,
        ),
    )
    # Foreign keys
    message_id: Optional[uuid.UUID] = Field(
        default=None,
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("messages.id", name="fk_action_artifact_versions_message_id"),
            nullable=True,
            index=True,
        ),
    )
    chat_id: uuid.UUID = Field(
        sa_column=Column(
            PG_UUID(as_uuid=True),
            ForeignKey("chats.id", name="fk_action_artifact_versions_chat_id"),
            nullable=False,
            index=True,
        ),
    )
