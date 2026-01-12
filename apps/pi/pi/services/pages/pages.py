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

import asyncio
from uuid import UUID

from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.services.llm.llms import get_chat_llm
from pi.services.llm.token_tracker import TokenTracker
from pi.services.pages.utils import construct_messages
from pi.services.pages.utils import get_entity_context
from pi.services.pages.utils import is_valid_revision_type
from pi.services.retrievers.pg_store.pages import get_page_ai_block_by_id
from pi.services.retrievers.pg_store.pages import update_page_ai_block_generated_content

log = logger.getChild(__name__)


async def generate_page_ai_block_content(
    block,
    db: AsyncSession,
    user_id: UUID,
    model_key: str = "gpt-4.1",
) -> str | None:
    """
    Generate content for a Page AI Block.

    Args:
        block: The PageAIBlock instance containing configuration.
        db: Database session for tracking and updates.
        user_id: ID of the user triggering the generation.
        model_key: LLM model to use (default: "gpt-4.1").

    Returns:
        The generated content string, or ``None`` if generation fails or is not supported.
    """
    try:
        # 1 & 2. Fetch Context and Initialize LLM in parallel
        context_task = get_entity_context(block.entity_type, str(block.entity_id))
        llm_task = asyncio.to_thread(get_chat_llm, model_key)

        context_text, llm = await asyncio.gather(context_task, llm_task)

        if not context_text or not context_text.strip():
            context_text = "(This page is currently empty)"

        # 3. Construct Messages
        messages = construct_messages(block_type=block.block_type, context_text=context_text, user_input=block.content)
        if not messages:
            log.error(f"Unsupported AI block type for generation: {block.block_type}")
            return None

        # 4. Call LLM
        response = await llm.ainvoke(messages)
        generated_content = response.content

        # 4. Update Block Content
        result = await update_page_ai_block_generated_content(
            db=db,
            block_id=block.id,
            generated_content=generated_content,
            user_id=user_id,
        )

        # Check if update succeeded
        if not result.get("success"):
            error_msg = result.get("error", "Unknown error")
            log.error(f"Failed to update generated content for block {block.id}: {error_msg}")
            return None

        # 6. Track Token Usage
        await TokenTracker(db).track_entity_llm_usage(
            llm_response=response,
            model_key=model_key,
            entity_type=block.entity_type,
            entity_id=block.entity_id,
            workspace_id=block.workspace_id,
            user_id=user_id,
            usage_type="ai_block",
            usage_id=block.id,
        )

        return generated_content
    except Exception as e:
        log.error(f"Failed to generate page AI block content: {e}")
        return None


async def generate_page_ai_block_revision(
    revision_request,
    db: AsyncSession,
    user_id: UUID,
    model_key: str = "gpt-4.1",
) -> str | None:
    """
    Generate a revision for a Page AI Block.
    """
    try:
        # 0. Validate revision_type
        if not is_valid_revision_type(revision_request.revision_type):
            log.error(f"Invalid revision_type: {revision_request.revision_type}")
            return None

        # 1. Fetch Block
        block = await get_page_ai_block_by_id(db, revision_request.block_id)
        if not block:
            return None

        block_id = revision_request.block_id
        current_content = block.generated_content
        revision_type = revision_request.revision_type
        if not current_content or not str(current_content).strip():
            log.error(f"Cannot generate revision for empty generated_content. block_id={block_id}")
            return None

        # 2. Fetch Context and Initialize LLM in parallel
        context_task = get_entity_context(block.entity_type, str(block.entity_id))
        llm_task = asyncio.to_thread(get_chat_llm, model_key)

        context_text, llm = await asyncio.gather(context_task, llm_task)

        if not context_text or not context_text.strip():
            context_text = "(This page is currently empty)"

        # 3. Construct Messages
        messages = construct_messages(block_type=revision_type, context_text=context_text, current_content=current_content)
        if not messages:
            log.error(f"Unsupported revision type for generation: {revision_type}")
            return None

        # 4. Call LLM
        response = await llm.ainvoke(messages)
        generated_content = response.content

        # 5. Update Block Content
        result = await update_page_ai_block_generated_content(
            db=db,
            block_id=block_id,
            generated_content=generated_content,
            user_id=user_id,
        )

        # Check if update succeeded
        if not result.get("success"):
            error_msg = result.get("error", "Unknown error")
            log.error(f"Failed to update generated content for block {block_id}: {error_msg}")
            return None

        # 6. Track Token Usage
        await TokenTracker(db).track_entity_llm_usage(
            llm_response=response,
            model_key=model_key,
            entity_type=block.entity_type,
            entity_id=block.entity_id,
            workspace_id=block.workspace_id,
            user_id=user_id,
            usage_id=block_id,
            usage_type="ai_block_revision",
        )

        return generated_content
    except Exception as e:
        log.error(f"Failed to generate page AI block revision: {e}")
        return None
