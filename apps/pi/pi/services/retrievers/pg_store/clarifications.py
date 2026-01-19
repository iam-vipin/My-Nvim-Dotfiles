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
from datetime import datetime
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from sqlmodel.ext.asyncio.session import AsyncSession

from pi.app.models.message_clarification import MessageClarification


async def create_clarification(
    db: AsyncSession,
    *,
    chat_id: uuid.UUID,
    message_id: uuid.UUID,
    kind: str,
    original_query: str,
    payload: Dict[str, Any],
    categories: List[str],
    method_tool_names: List[str],
    bound_tool_names: List[str],
) -> uuid.UUID:
    clarification = MessageClarification(
        chat_id=chat_id,
        message_id=message_id,
        pending=True,
        kind=kind,
        original_query=original_query,
        payload=payload,
        categories=categories,
        method_tool_names=method_tool_names,
        bound_tool_names=bound_tool_names,
    )
    db.add(clarification)
    await db.commit()
    await db.refresh(clarification)
    return clarification.id


async def get_latest_pending_for_chat(db: AsyncSession, *, chat_id: uuid.UUID) -> Optional[MessageClarification]:
    from sqlmodel import select

    from pi import logger

    log = logger.getChild(__name__)

    result = await db.exec(
        select(MessageClarification)
        .where(MessageClarification.chat_id == chat_id)
        .where(MessageClarification.pending)
        .order_by(MessageClarification.created_at.desc())  # type: ignore[attr-defined]
        .limit(1)
    )
    clar = result.first()

    if clar:
        log.info(f"ChatID: {chat_id} - Found pending clarification: id={clar.id}, kind={clar.kind}, message_id={clar.message_id}")
    else:
        log.info(f"ChatID: {chat_id} - No pending clarification found")

    return clar


async def resolve_clarification(
    db: AsyncSession,
    *,
    clarification_id: uuid.UUID,
    answer_text: Optional[str],
    resolved_by_message_id: uuid.UUID,
) -> None:
    from sqlmodel import select

    result = await db.exec(select(MessageClarification).where(MessageClarification.id == clarification_id))
    row = result.first()
    if not row:
        return
    row.pending = False
    row.answer_text = answer_text
    row.resolved_by_message_id = resolved_by_message_id
    row.resolved_at = datetime.utcnow()
    await db.commit()
    await db.refresh(row)
