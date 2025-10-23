# python imports
import uuid
from typing import List
from typing import Optional

# Third-party imports
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field
from sqlmodel import Relationship

# Module imports
from pi.app.models.base import BaseModel


class LlmModel(BaseModel, table=True):
    __tablename__ = "llm_models"

    model_config = {"protected_namespaces": ()}

    # Fields
    name: str = Field(nullable=False, max_length=255)
    description: Optional[str] = Field(default=None, nullable=True)
    provider: str = Field(max_length=255)
    model_key: str = Field(nullable=False, max_length=255, unique=True)
    max_tokens: int = Field(nullable=False)
    is_active: bool = Field(default=True)

    # Relationships
    llm_model_pricing: List["LlmModelPricing"] = Relationship(
        back_populates="llm_model",
        sa_relationship_kwargs={"lazy": "selectin"},
    )


class LlmModelPricing(BaseModel, table=True):
    __tablename__ = "llm_model_pricing"

    # Fields
    llm_model_id: uuid.UUID = Field(sa_column=Column(UUID(as_uuid=True), ForeignKey("llm_models.id", name="fk_llm_model_pricing_llm_model_id")))
    text_input_price: Optional[float] = Field(nullable=True, default=None, description="In USD per 1M tokens")
    text_output_price: Optional[float] = Field(nullable=True, default=None, description="In USD per 1M tokens")
    cached_text_input_price: Optional[float] = Field(nullable=True, default=None, description="In USD per 1M tokens")

    # Relationships
    llm_model: "LlmModel" = Relationship(back_populates="llm_model_pricing", sa_relationship_kwargs={"lazy": "selectin"})
