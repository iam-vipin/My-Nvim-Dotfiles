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
from pi.app.api.v2.dependencies import cookie_schema
from pi.app.api.v2.dependencies import is_valid_session
from pi.app.schemas.chat import ChatFeedback
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.retrievers.pg_store import update_message_feedback

log = logger.getChild("v2.feedback")
router = APIRouter()


@router.post("/")
async def create_feedback(
    feedback_data: ChatFeedback,
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
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
    try:
        # Get user_id from session
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    result = await update_message_feedback(
        chat_id=feedback_data.chat_id,
        message_index=feedback_data.message_index,
        feedback_value=feedback_data.feedback.value,
        user_id=user_id,
        db=db,
        feedback_message=feedback_data.feedback_message,
    )

    # The update_message_feedback function always returns a tuple of (status_code, content)
    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)
