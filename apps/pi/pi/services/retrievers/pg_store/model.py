# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

import uuid
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple
from typing import Union
from uuid import UUID

from pydantic import UUID4
from sqlalchemy import desc
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models import LlmModel
from pi.app.models import LlmModelPricing
from pi.app.models.llm import LlmModelUsageTracking
from pi.config import settings
from pi.core.db.fixtures.llms import LLMS_DATA

log = logger.getChild(__name__)


async def get_active_models(db: AsyncSession, user_id: str, workspace_slug: str) -> Union[List[Dict[str, Any]], Tuple[int, Dict[str, str]]]:
    """
    Retrieves all active LLM models.
    Returns either a list of models (success) or a tuple of (status_code, response_content) for errors
    """
    try:
        models_list = []

        statement = select(LlmModel).where(LlmModel.is_active.is_(True))  # type: ignore[attr-defined]
        execution = await db.execute(statement)
        db_models = execution.scalars().all()

        # Visible models for users (extendable via feature flags later)
        # NOTE: Hide gpt-5-standard from user selection to reduce latency
        user_visible_models = ["gpt-4.1", "gpt-5-fast", "gpt-5.2", "claude-sonnet-4-0", "claude-sonnet-4-5"]

        # Define desired display order
        model_order = ["gpt-5.2", "gpt-5-fast", "gpt-4.1", "claude-sonnet-4-5", "claude-sonnet-4-0"]

        default_found = False
        for db_model in db_models:
            # Only include models that should be visible to users
            if db_model.model_key not in user_visible_models:
                continue
            # Map database model to frontend format
            model_entry = {
                "id": db_model.model_key,
                "name": db_model.name,
                "description": db_model.description or "",
                "type": "language_model",
                # Set default model based on config
                "is_default": (db_model.model_key == settings.llm_model.DEFAULT and not default_found),
            }
            if model_entry["is_default"]:
                default_found = True

            models_list.append(model_entry)

        # Sort models_list based on the defined order
        # Models not in model_order will appear at the end in their original order
        models_list.sort(key=lambda x: model_order.index(x["id"]) if x["id"] in model_order else len(model_order))

        return models_list
    except Exception as e:
        log.error(f"Error retrieving active models: {e}")
        return 500, {"detail": "Internal Server Error"}


async def get_llm_model_id_from_key(model_key: str, db: Optional[AsyncSession] = None) -> Optional[UUID]:
    """
    Get LLM model UUID from model key.

    Args:
        model_key: The model key (e.g., "gpt-4o", "gpt-4.1", "claude-sonnet-4")
        db: Database session (optional, will use local mapping if not provided)

    Returns:
        UUID of the LLM model or None if not found
    """
    try:
        # First try local mapping for common models
        for model in LLMS_DATA:
            if model["model_key"] == model_key:
                return uuid.UUID(str(model["id"]))

        # Fallback to database lookup if session provided
        if db:
            stmt = select(LlmModel).where(LlmModel.model_key == model_key)  # type: ignore[var-annotated,arg-type]
            result = await db.execute(stmt)
            llm_model = result.scalar_one_or_none()
            return llm_model.id if llm_model else None

        log.warning(f"No LLM model ID found for model key: {model_key}")
        return None

    except Exception as e:
        log.error(f"Error getting LLM model ID for key {model_key}: {e}")
        return None


async def get_llm_pricing(llm_model_id: UUID, db: AsyncSession) -> Optional[LlmModelPricing]:
    """
    Get LLM pricing data for a given model ID.

    Args:
        llm_model_id: The LLM model UUID
        db: Database session

    Returns:
        LlmModelPricing object or None if not found
    """
    try:
        pricing_stmt = (
            select(LlmModelPricing)
            .where(LlmModelPricing.llm_model_id == llm_model_id)  # type: ignore[var-annotated,arg-type]
            .where(LlmModelPricing.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .order_by(desc(LlmModelPricing.created_at))  # type: ignore[arg-type]
            .limit(1)
        )
        result = await db.execute(pricing_stmt)
        pricing = result.scalar_one_or_none()
        return pricing

    except Exception as e:
        log.error(f"Error getting LLM pricing for model ID {llm_model_id}: {e}")
        return None


async def add_llm_pricing_by_id(
    llm_model_id: UUID,
    db: AsyncSession,
    text_input_price: Optional[float] = None,
    text_output_price: Optional[float] = None,
    cached_text_input_price: Optional[float] = None,
) -> Tuple[bool, str]:
    """
    Add LLM pricing data for a specific model ID.

    Args:
        llm_model_id: The LLM model UUID
        db: Database session
        text_input_price: Text input price in USD per 1M tokens (optional)
        text_output_price: Text output price in USD per 1M tokens (optional)
        cached_text_input_price: Cached text input price in USD per 1M tokens (optional)

    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        # Validate that at least one pricing option is provided
        if text_input_price is None and text_output_price is None and cached_text_input_price is None:
            return False, "At least one pricing option must be provided"

        # Create new pricing entry
        new_pricing = LlmModelPricing(
            id=uuid.uuid4(),
            llm_model_id=llm_model_id,
            text_input_price=text_input_price,
            text_output_price=text_output_price,
            cached_text_input_price=cached_text_input_price,
        )

        db.add(new_pricing)
        await db.commit()

        return True, "Successfully added LLM pricing"

    except Exception as e:
        await db.rollback()
        log.error(f"Error adding LLM pricing for model ID {llm_model_id}: {e}")
        return False, f"Error adding LLM pricing: {e}"


async def add_llm_pricing(
    model_key: str, text_input_price: float, text_output_price: float, db: AsyncSession
) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Add LLM pricing data for a specific model.

    Args:
        model_key: The model key (e.g., "gpt-4o", "gpt-4.1")
        text_input_price: Text input price in USD per 1M tokens
        text_output_price: Text output price in USD per 1M tokens
        db: Database session

    Returns:
        Tuple of (success: bool, message: str, model_data: Optional[Dict])
    """
    try:
        # Find the LLM model by model_key
        stmt = select(LlmModel).where(LlmModel.model_key == model_key)  # type: ignore[var-annotated,arg-type]
        result = await db.execute(stmt)
        llm_model = result.scalar_one_or_none()

        if not llm_model:
            return False, f"No model found with key '{model_key}'", None

        # Create new pricing entry
        new_pricing = LlmModelPricing(
            id=uuid.uuid4(),
            llm_model_id=llm_model.id,
            text_input_price=text_input_price,
            text_output_price=text_output_price,
        )

        db.add(new_pricing)
        await db.commit()

        model_data = {
            "model_key": model_key,
            "model_name": llm_model.name,
            "text_input_price": text_input_price,
            "text_output_price": text_output_price,
        }

        return True, f"Successfully added pricing for '{model_key}'", model_data

    except Exception as e:
        await db.rollback()
        log.error(f"Error adding LLM pricing for model key {model_key}: {e}")
        return False, f"Error adding LLM pricing: {e}", None


async def upsert_llm_model_usage_tracking(
    db: AsyncSession,
    entity_type: str,
    entity_id: UUID4,
    workspace_id: UUID4,
    user_id: UUID4,
    usage_type: Optional[str] = None,
    usage_id: Optional[UUID4] = None,
    llm_model_id: Optional[UUID4] = None,
    input_text_tokens: Optional[int] = None,
    input_text_price: Optional[float] = None,
    output_text_tokens: Optional[int] = None,
    output_text_price: Optional[float] = None,
    cached_input_text_tokens: Optional[int] = None,
    cached_input_text_price: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Create or update a Page AI tracking record using LlmModelUsageTracking.
    Currently always creates a new record for each usage event.

    Args:
        db: Database session
        entity_type: Type of entity (e.g., 'page', 'wiki')
        entity_id: ID of the entity (page/wiki)
        usage_type: Type of usage (e.g., 'ai_block')
        usage_id: ID of the referenced entity (e.g., block_id)
        workspace_id: Workspace ID
        user_id: User ID
        llm_model_id: ID of the LLM model used
        input_text_tokens: Number of input tokens
        input_text_price: Cost of input tokens
        output_text_tokens: Number of output tokens
        output_text_price: Cost of output tokens
        cached_input_text_tokens: Number of cached input tokens
        cached_input_text_price: Cost of cached input tokens

    Returns:
        Dictionary with success status and tracking object or error details
    """
    try:
        tracking_record = LlmModelUsageTracking(
            entity_type=entity_type,
            entity_id=entity_id,
            usage_type=usage_type,
            usage_id=usage_id,
            workspace_id=workspace_id,
            user_id=user_id,
            llm_model_id=llm_model_id,
            input_text_tokens=input_text_tokens,
            input_text_price=input_text_price,
            output_text_tokens=output_text_tokens,
            output_text_price=output_text_price,
            cached_input_text_tokens=cached_input_text_tokens,
            cached_input_text_price=cached_input_text_price,
        )

        db.add(tracking_record)
        await db.commit()
        await db.refresh(tracking_record)

        return {"success": True, "tracking_record": tracking_record}

    except Exception as e:
        await db.rollback()
        log.error(f"Error creating LLM model usage tracking record: {str(e)}")
        return {"success": False, "error": str(e)}
