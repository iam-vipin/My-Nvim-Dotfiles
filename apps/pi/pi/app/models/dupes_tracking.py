# python imports
import uuid
from typing import Optional
from typing import Union

# Third-party imports
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field

# Module imports
from pi.app.models.base import BaseModel


class DupesTracking(BaseModel, table=True):
    __tablename__ = "dupes_tracking"

    # Request details
    workspace_id: uuid.UUID = Field(nullable=False, index=True)
    project_id: Optional[uuid.UUID] = Field(default=None, nullable=True, index=True)
    issue_id: Optional[uuid.UUID] = Field(default=None, nullable=True, index=True)
    user_id: Optional[uuid.UUID] = Field(default=None, nullable=True, index=True)
    workspace_slug: Optional[str] = Field(default=None, nullable=True, max_length=255)

    # Query details
    query_title: Optional[str] = Field(default=None, nullable=True)
    query_description_length: Optional[int] = Field(default=None, nullable=True)

    # Input/Output text storage - using JSONB for better performance and queryability
    # Can store either dict or list (list of work items)
    input_workitems_text: Optional[Union[dict, list]] = Field(
        default=None, sa_column=Column(JSONB, nullable=True), description="JSONB of input work items (id, title, description)"
    )
    output_duplicates_text: Optional[Union[dict, list]] = Field(
        default=None, sa_column=Column(JSONB, nullable=True), description="JSONB of identified duplicates"
    )

    # Vector search results
    vector_candidates_count: Optional[int] = Field(default=None, nullable=True)
    vector_search_duration_ms: Optional[float] = Field(default=None, nullable=True)

    # LLM processing
    llm_candidates_count: Optional[int] = Field(default=None, nullable=True)
    llm_identified_dupes_count: Optional[int] = Field(default=None, nullable=True)
    llm_duration_ms: Optional[float] = Field(default=None, nullable=True)
    llm_success: bool = Field(default=True, nullable=False)
    llm_error: Optional[str] = Field(default=None, nullable=True)

    # Token tracking
    llm_model_id: Optional[uuid.UUID] = Field(
        sa_column=Column(UUID(as_uuid=True), ForeignKey("llm_models.id", name="fk_dupes_tracking_llm_model_id"), nullable=True)
    )
    input_text_tokens: Optional[int] = Field(nullable=True, default=None)
    input_text_price: Optional[float] = Field(nullable=True, default=None, description="In USD")
    output_text_tokens: Optional[int] = Field(nullable=True, default=None)
    output_text_price: Optional[float] = Field(nullable=True, default=None, description="In USD")
    cached_input_text_tokens: Optional[int] = Field(nullable=True, default=None)
    cached_input_text_price: Optional[float] = Field(nullable=True, default=None, description="In USD")
    llm_model_pricing_id: Optional[uuid.UUID] = Field(
        sa_column=Column(UUID(as_uuid=True), ForeignKey("llm_model_pricing.id", name="fk_dupes_tracking_llm_model_pricing_id"), nullable=True)
    )

    # Total duration
    total_duration_ms: Optional[float] = Field(default=None, nullable=True)
