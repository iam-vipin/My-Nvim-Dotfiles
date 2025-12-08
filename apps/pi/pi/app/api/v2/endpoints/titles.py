from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v2.dependencies import cookie_schema
from pi.app.api.v2.dependencies import is_valid_session
from pi.app.schemas.chat import TitleRequest
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.chat.chat import PlaneChatBot
from pi.services.retrievers.pg_store import get_chat_messages

log = logger.getChild("v2.titles")
router = APIRouter()


@router.post("/")
async def create_title(
    data: TitleRequest,
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
    """
    Generate or retrieve a title for a chat conversation.

    This endpoint automatically generates a concise, meaningful title for a chat
    based on its message history. If a title already exists for the chat, it
    returns the existing title. The title generation uses AI to summarize the
    conversation's main topic.

    The endpoint follows RESTful principles by treating the title as a resource
    that can be created (POST) for a given chat.

    Args:
        data: TitleRequest containing:
            - chat_id: UUID of the chat to generate title for
        db: Database session
        session: Session cookie for authentication

    Returns:
        JSONResponse with:
        - Success: {"title": "Generated or existing title"}
        - Error: {"detail": "Error message"}

    Status Codes:
        - 200: Title generated or retrieved successfully
        - 400: Missing or invalid chat_id
        - 401: Invalid or missing authentication
        - 404: Chat not found
        - 500: Internal server error

    Example:
        Request:
            POST /api/v2/titles/
            {"chat_id": "abc-123"}

        Response:
            {"title": "Discussion about API design patterns"}
    """
    try:
        await is_valid_session(session)
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    if not data.chat_id:
        log.warning("Request missing chat_id")
        return JSONResponse(status_code=400, content={"detail": "chat_id is required"})

    try:
        # Get messages for this chat using the utility function
        messages = await get_chat_messages(chat_id=data.chat_id, db=db)

        # Check if messages is a tuple (error case)
        if isinstance(messages, tuple) and len(messages) == 2:
            status_code, content = messages
            return JSONResponse(status_code=status_code, content=content)

        # Generate or get existing title using PlaneChatBot
        chatbot = PlaneChatBot()
        title = await chatbot.get_title(chat_id=data.chat_id, messages=messages, db=db)

        return JSONResponse(content={"title": title})
    except Exception as e:
        log.error(f"An unexpected error occurred: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
