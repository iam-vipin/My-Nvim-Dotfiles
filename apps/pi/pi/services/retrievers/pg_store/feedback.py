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

from typing import Dict
from typing import Optional
from typing import Tuple

from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models.feedback import Feedback

log = logger.getChild(__name__)


async def create_feedback(
    db: AsyncSession,
    usage_type: str,
    usage_id: Optional[UUID4],
    entity_type: Optional[str],
    entity_id: Optional[UUID4],
    feedback_value: Optional[str],
    feedback_message: Optional[str],
    user_id: UUID4,
    workspace_id: UUID4,
) -> Tuple[int, Dict[str, str]]:
    """
    Creates feedback for an AI feature.

    Args:
        usage_type: Type of AI feature (ai_block, summarize, etc.)
        usage_id: ID of the AI feature instance
        entity_type: Type of entity where feature is used (page, wiki, etc.)
        entity_id: ID of the entity
        feedback_type: Type of feedback
        feedback_value: Feedback value
        feedback_message: Optional feedback message
        user_id: User providing feedback
        workspace_id: Workspace ID

    Returns:
        Tuple of (status_code, response_content)
    """
    try:
        # Create new feedback
        new_feedback = Feedback(
            usage_type=usage_type,
            usage_id=usage_id,
            entity_type=entity_type,
            entity_id=entity_id,
            feedback=feedback_value,
            feedback_message=feedback_message,
            user_id=user_id,
            workspace_id=workspace_id,
        )
        db.add(new_feedback)
        await db.commit()
        return 200, {"detail": "Feedback created successfully"}
    except Exception as e:
        await db.rollback()
        log.error(f"Error creating feedback: {e}")
        return 500, {"detail": "Internal Server Error"}
