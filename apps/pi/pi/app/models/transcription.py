import uuid
from typing import Optional

from sqlmodel import Field

from .base import SoftDeleteModel
from .base import TimeAuditModel
from .base import UUIDModel


class Transcription(TimeAuditModel, SoftDeleteModel, UUIDModel, table=True):
    __tablename__ = "transcriptions"

    # Fields
    transcription_text: str = Field(nullable=False)
    transcription_id: str = Field(nullable=False)
    audio_duration: int = Field(nullable=False)  # Seconds
    speech_model: str = Field(nullable=False)
    processing_time: float = Field(nullable=False)
    user_id: uuid.UUID = Field(nullable=False)
    workspace_id: uuid.UUID = Field(nullable=False)
    chat_id: Optional[uuid.UUID] = Field(nullable=True)

    # Add pricing field
    transcription_cost_usd: Optional[float] = Field(nullable=True, description="Cost in USD")
