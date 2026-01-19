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

from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.dependencies import get_current_user
from pi.app.schemas.chat import AIFeatureFeedback
from pi.app.schemas.chat import ChatFeedback
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.retrievers.pg_store import update_message_feedback
from pi.services.retrievers.pg_store.feedback import create_feedback

log = logger.getChild("v2.feedback")
router = APIRouter()


@router.post("/")
async def create_chat_feedback(
    feedback_data: ChatFeedback,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user),
):
    """
    Create feedback for a chat message.

    This endpoint allows users to provide feedback (thumbs up/down) on AI responses,
    helping improve the quality of future responses. Feedback can optionally include
    a text message explaining the rating.

    Args:
        feedback_data: ChatFeedback object containing:
            - chat_id: UUID of the chat
            - message_index: Index of the message in the chat
            - feedback: Feedback value (positive/negative)
            - feedback_message: Optional text explanation
        db: Database session
        session: Session cookie for authentication

    Returns:
        JSONResponse with:
        - Success: {"message": "Feedback recorded successfully"}
        - Error: {"detail": "Error message"}

    Status Codes:
        - 200: Feedback successfully recorded
        - 401: Invalid or missing authentication
        - 404: Message not found
        - 500: Internal server error
    """

    result = await update_message_feedback(
        chat_id=feedback_data.chat_id,
        message_index=feedback_data.message_index,
        feedback_value=feedback_data.feedback.value,
        user_id=current_user.id,
        db=db,
        feedback_message=feedback_data.feedback_message,
    )

    # The update_message_feedback function always returns a tuple of (status_code, content)
    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)


@router.post("/{usage_type}/")
async def create_ai_feature_feedback(
    usage_type: str,
    feedback_data: AIFeatureFeedback,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user),
):
    """
    Create feedback for AI-powered features (ai_block, floaty_ai, ask_ai, etc.).

    This endpoint allows users to provide feedback (thumbs up/down) on AI-powered features,
    helping improve the quality of AI-generated content. Feedback can optionally include
    a text message explaining the rating.

    Args:
        usage_type: Type of AI feature from URL path ('ai_block', 'summarize', etc.)
        feedback_data: AIFeatureFeedback object containing:
            - usage_id: UUID of the AI feature instance (e.g., ai_block_id)
            - entity_type: Type of entity where feature is used ('page', 'wiki', etc.)
            - entity_id: UUID of the entity (e.g., page_id)
            - feedback: Feedback value (positive/negative)
            - feedback_message: Optional text explanation
            - workspace_id: Workspace UUID
            - workspace_slug: Optional workspace slug
        db: Database session
        session: Session cookie for authentication

    Returns:
        JSONResponse with:
        - Success: {"detail": "Feedback created successfully"}
        - Error: {"detail": "Error message"}

    Status Codes:
        - 200: Feedback successfully recorded
        - 401: Invalid or missing authentication
        - 500: Internal server error
    """

    result = await create_feedback(
        db=db,
        usage_type=usage_type,
        usage_id=feedback_data.usage_id,
        entity_type=feedback_data.entity_type,
        entity_id=feedback_data.entity_id,
        feedback_value=feedback_data.feedback.value,
        feedback_message=feedback_data.feedback_message,
        user_id=current_user.id,
        workspace_id=feedback_data.workspace_id,
    )

    # The create_feedback function returns a tuple of (status_code, content)
    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)
