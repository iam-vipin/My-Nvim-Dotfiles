from typing import Optional

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Query
from fastapi.responses import JSONResponse
from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v2.dependencies import cookie_schema
from pi.app.api.v2.dependencies import is_valid_session
from pi.app.schemas.chat import GetThreadsPaginatedResponse
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.retrievers.pg_store import get_user_chat_threads
from pi.services.retrievers.pg_store import get_user_chat_threads_paginated

log = logger.getChild("v2.conversations")
router = APIRouter()


@router.get("/")
async def list_conversations(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    is_project_chat: Optional[bool] = False,
    session: str = Depends(cookie_schema),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List recent conversations for the authenticated user.

    This endpoint retrieves the user's chat conversations (threads), optionally
    filtered by workspace. It returns the most recent conversations, making it
    ideal for displaying chat history in the UI.

    Conversations can be filtered by:
    - Workspace (using workspace_id or workspace_slug)
    - Type (project-specific chats vs general chats)

    Args:
        workspace_id: Optional UUID of workspace to filter conversations
        workspace_slug: Optional slug of workspace to filter conversations
        is_project_chat: Optional flag to filter project-specific conversations
        session: Session cookie for authentication
        db: Database session

    Returns:
        JSONResponse with:
        - results: List of conversation objects containing:
            - chat_id: Unique identifier for the conversation
            - title: Conversation title
            - created_at: Timestamp when conversation was created
            - updated_at: Timestamp of last message
            - message_count: Number of messages in conversation
            - workspace_id: Associated workspace

    Status Codes:
        - 200: Conversations retrieved successfully
        - 401: Invalid or missing authentication
        - 404: No conversations found / workspace not found
        - 500: Internal server error

    Example Response:
        {
            "results": [
                {
                    "chat_id": "abc-123",
                    "title": "API Design Discussion",
                    "created_at": "2025-01-15T10:30:00Z",
                    "updated_at": "2025-01-15T14:20:00Z",
                    "message_count": 12,
                    "workspace_id": "workspace-456"
                },
                ...
            ]
        }
    """
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    results = await get_user_chat_threads(
        user_id=user_id,
        db=db,
        workspace_id=workspace_id,
        is_project_chat=is_project_chat,
        is_latest=True,
    )

    # Check if results is a tuple (error case)
    if isinstance(results, tuple) and len(results) == 2:
        status_code_val, content = results  # type: ignore[assignment]
        status_code_int: int = int(status_code_val) if isinstance(status_code_val, int) else 500
        return JSONResponse(status_code=status_code_int, content=content)

    # Success case
    return JSONResponse(content={"results": results})


@router.get("/paginated/", response_model=GetThreadsPaginatedResponse)
async def list_conversations_paginated(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    is_project_chat: Optional[bool] = False,
    cursor: Optional[str] = None,
    per_page: int = Query(default=30, ge=1, le=100),
    session: str = Depends(cookie_schema),
    db: AsyncSession = Depends(get_async_session),
):
    """
    List conversations with cursor-based pagination.

    This endpoint provides efficient pagination for large conversation lists using
    cursor-based pagination instead of offset-based. This approach is more performant
    and provides consistent results even when the underlying data changes.

    Cursor-based pagination benefits:
    - More efficient for large datasets
    - Consistent results during data changes
    - Better performance than offset/limit
    - No page drift issues

    Args:
        workspace_id: Optional UUID of workspace to filter conversations
        workspace_slug: Optional slug of workspace to filter conversations
        is_project_chat: Optional flag to filter project-specific conversations
        cursor: Optional cursor for pagination (use next_cursor/prev_cursor from response)
        per_page: Number of results per page (1-100, default 30)
        session: Session cookie for authentication
        db: Database session

    Returns:
        JSONResponse with:
        - results: List of conversation objects
        - next_cursor: Cursor for next page (null if last page)
        - prev_cursor: Cursor for previous page (null if first page)
        - count: Total number of results in current page

    Status Codes:
        - 200: Conversations retrieved successfully
        - 401: Invalid or missing authentication
        - 404: No conversations found / workspace not found
        - 500: Internal server error

    Example Response:
        {
            "results": [
                {
                    "chat_id": "abc-123",
                    "title": "API Design Discussion",
                    "created_at": "2025-01-15T10:30:00Z",
                    "updated_at": "2025-01-15T14:20:00Z",
                    "message_count": 12,
                    "workspace_id": "workspace-456"
                }
            ],
            "next_cursor": "eyJpZCI6MTIzfQ==",
            "prev_cursor": null,
            "count": 30
        }

    Pagination Example:
        # First page
        GET /api/v2/conversations/paginated/?per_page=20

        # Next page (use next_cursor from previous response)
        GET /api/v2/conversations/paginated/?per_page=20&cursor=eyJpZCI6MTIzfQ==
    """
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    results = await get_user_chat_threads_paginated(
        user_id=user_id,
        db=db,
        workspace_id=workspace_id,
        is_project_chat=is_project_chat,
        cursor=cursor,
        per_page=per_page,
    )

    # Check if results is a tuple (error case or success case)
    if isinstance(results, tuple) and len(results) == 2:
        # Check if it's an error tuple (status_code, error_dict) or success tuple (results, pagination)
        if isinstance(results[0], int):
            status_code_val, content = results
            status_code: int = status_code_val  # type: ignore[assignment]
            return JSONResponse(status_code=status_code, content=content)
        else:
            # Success case - (results, pagination_response)
            chat_results, pagination_response = results
            response_data = pagination_response.model_dump()  # type: ignore[attr-defined]
            response_data["results"] = chat_results
            return JSONResponse(content=response_data)
