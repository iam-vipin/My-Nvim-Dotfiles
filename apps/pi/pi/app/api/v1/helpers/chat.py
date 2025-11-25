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
from pi import logger
from pi.app.models import Chat

log = logger.getChild(__name__)


async def _get_chat(chat_id: UUID4, db: AsyncSession, user_id: Optional[UUID4] = None, filters: Optional[Union[List, Any]] = None) -> Optional[Chat]:
    conditions = [Chat.id == chat_id]

    if user_id:
        conditions.append(Chat.user_id == user_id)

    if filters:
        if isinstance(filters, list):
            conditions.extend(filters)
        else:
            conditions.append(filters)

    statement = Chat.objects().where(and_(*conditions))  # type: ignore[arg-type]
    execution = await db.exec(statement)
    return execution.first()
