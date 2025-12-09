# Python imports
from typing import Any
from typing import List
from typing import Optional
from typing import Union

# External imports
from pydantic import UUID4
from sqlalchemy import and_
from sqlmodel.ext.asyncio.session import AsyncSession

# Module imports
from pi.app.models import Message


async def _get_last_message(db: AsyncSession, user_id: Optional[UUID4] = None, filters: Optional[Union[List, Any]] = None) -> Optional[Message]:
    conditions = []

    if user_id:
        conditions.extend([Message.user_id == user_id])  # type: ignore[attr-defined]

    if filters:
        if isinstance(filters, list):
            conditions.extend(filters)
        else:
            conditions.append(filters)

    statement = Message.objects().where(and_(*conditions)).order_by(Message.sequence.desc())  # type: ignore[attr-defined]
    execution = await db.exec(statement)
    return execution.first()


async def _get_message(
    db: AsyncSession, message_id: Optional[UUID4] = None, user_id: Optional[UUID4] = None, filters: Optional[Union[List, Any]] = None
) -> Optional[Message]:
    conditions = []
    if message_id:
        conditions.append(Message.id == message_id)

    if user_id:
        conditions.append(Message.user_id == user_id)  # type: ignore[attr-defined]

    if filters:
        if isinstance(filters, list):
            conditions.extend(filters)
        else:
            conditions.append(filters)

    statement = Message.objects().where(and_(*conditions))  # type: ignore[arg-type]
    execution = await db.exec(statement)
    return execution.first()
