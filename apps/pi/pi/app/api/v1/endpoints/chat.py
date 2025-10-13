import asyncio
import json
from typing import Any
from typing import AsyncGenerator
from typing import Optional
from uuid import UUID
from uuid import uuid4

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Query
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
from pydantic import UUID4
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v1.dependencies import cookie_schema
from pi.app.api.v1.dependencies import is_valid_session
from pi.app.api.v1.helpers.batch_execution_helpers import execute_batch_actions
from pi.app.api.v1.helpers.batch_execution_helpers import format_execution_response
from pi.app.api.v1.helpers.batch_execution_helpers import prepare_execution_data
from pi.app.api.v1.helpers.batch_execution_helpers import update_assistant_message_with_execution_results
from pi.app.api.v1.helpers.batch_execution_helpers import validate_session_and_get_user
from pi.app.api.v1.helpers.plane_sql_queries import resolve_workspace_id_from_project_id
from pi.app.models.enums import FlowStepType
from pi.app.models.enums import UserTypeChoices
from pi.app.models.message import MessageFlowStep
from pi.app.schemas.chat import ActionBatchExecutionRequest
from pi.app.schemas.chat import ChatFeedback
from pi.app.schemas.chat import ChatInitializationRequest
from pi.app.schemas.chat import ChatRequest
from pi.app.schemas.chat import ChatSearchResponse
from pi.app.schemas.chat import ChatSuggestionTemplate
from pi.app.schemas.chat import DeleteChatRequest
from pi.app.schemas.chat import FavoriteChatRequest
from pi.app.schemas.chat import GetThreadsPaginatedResponse
from pi.app.schemas.chat import ModelsResponse
from pi.app.schemas.chat import RenameChatRequest
from pi.app.schemas.chat import TitleRequest
from pi.app.schemas.chat import UnfavoriteChatRequest
from pi.app.utils import validate_chat_initialization
from pi.app.utils import validate_chat_request
from pi.app.utils.background_tasks import schedule_chat_deletion
from pi.app.utils.background_tasks import schedule_chat_rename
from pi.app.utils.background_tasks import schedule_chat_search_upsert
from pi.app.utils.exceptions import SQLGenerationError
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.core.db.plane_pi.lifecycle import get_streaming_db_session
from pi.services.chat.chat import PlaneChatBot
from pi.services.chat.helpers.batch_execution_helpers import get_original_user_query
from pi.services.chat.helpers.batch_execution_helpers import get_planned_actions_for_execution
from pi.services.chat.helpers.tool_utils import format_clarification_as_text
from pi.services.chat.search import ChatSearchService
from pi.services.chat.templates import tiles_factory
from pi.services.chat.utils import initialize_new_chat
from pi.services.chat.utils import resolve_workspace_slug
from pi.services.retrievers.pg_store import favorite_chat
from pi.services.retrievers.pg_store import get_active_models
from pi.services.retrievers.pg_store import get_chat_messages
from pi.services.retrievers.pg_store import get_favorite_chats
from pi.services.retrievers.pg_store import get_user_chat_threads
from pi.services.retrievers.pg_store import get_user_chat_threads_paginated
from pi.services.retrievers.pg_store import rename_chat_title
from pi.services.retrievers.pg_store import retrieve_chat_history
from pi.services.retrievers.pg_store import soft_delete_chat
from pi.services.retrievers.pg_store import unfavorite_chat
from pi.services.retrievers.pg_store import update_message_feedback
from pi.services.retrievers.pg_store.message import upsert_message
from pi.services.retrievers.pg_store.message import upsert_message_flow_steps

log = logger.getChild("v1/chat")
router = APIRouter()


# Constants for batch execution
BATCH_EXECUTION_ERRORS = {
    "NO_PLANNED_ACTIONS": "No planned actions found for this message",
    "NO_ORIGINAL_QUERY": "Original user query not found",
    "OAUTH_REQUIRED": "No valid OAuth token found. Please complete OAuth authentication for this workspace first.",
    "WORKSPACE_NOT_FOUND": "Workspace not found",
    "INVALID_SESSION": "Invalid Session",
    "INTERNAL_ERROR": "Internal server error",
}


@router.post("/get-answer/")
async def get_answer(data: ChatRequest, session: str = Depends(cookie_schema)):
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    data.user_id = user_id

    # Validate request data
    validation_error = validate_chat_request(data)
    if validation_error:
        return JSONResponse(status_code=validation_error["status_code"], content={"detail": validation_error["detail"]})

    chatbot = PlaneChatBot(llm=data.llm)

    async def stream_response() -> AsyncGenerator[str, None]:
        token_id = None
        try:
            pending_backticks = ""
            # Open a short-lived session for the duration of the streaming work
            async with get_streaming_db_session() as stream_db:
                async for chunk in chatbot.process_query_stream(data, db=stream_db):
                    if chunk.startswith("πspecial reasoning blockπ: "):
                        reasoning_content = chunk.replace("πspecial reasoning blockπ: ", "")
                        # JSON-encode reasoning payload
                        payload = {"reasoning": reasoning_content}
                        yield f"event: reasoning\ndata: {json.dumps(payload)}\n\n"
                    elif chunk.startswith("πspecial actions blockπ: "):
                        # Extract the actions data and send as separate actions event
                        actions_content = chunk.replace("πspecial actions blockπ: ", "")
                        try:
                            # Parse the JSON content to validate it
                            actions_data = json.loads(actions_content)
                            yield f"event: actions\ndata: {json.dumps(actions_data)}\n\n"
                        except json.JSONDecodeError:
                            # If JSON parsing fails, fall back to delta event
                            log.warning(f"Failed to parse actions JSON: {actions_content}")
                            payload = {"chunk": chunk}
                            yield f"event: delta\ndata: {json.dumps(payload)}\n\n"
                    elif chunk.startswith("πspecial clarification blockπ: "):
                        # Dedicated event to ask user for clarifications
                        clarification_content = chunk.replace("πspecial clarification blockπ: ", "")
                        try:
                            clarification_data = json.loads(clarification_content)

                            # Format clarification as natural language text for frontend display
                            formatted_text = format_clarification_as_text(clarification_data)
                            payload = {"chunk": formatted_text}
                            yield f"event: delta\ndata: {json.dumps(payload)}\n\n"
                        except json.JSONDecodeError:
                            log.warning(f"Failed to parse clarification JSON: {clarification_content}")
                            # Fallback to raw content if JSON parsing fails
                            payload = {"chunk": "I'm sorry, I can't understand your request in your workspace context. Can you be more specific?"}
                            yield f"event: delta\ndata: {json.dumps(payload)}\n\n"
                    else:
                        # Handle code block formatting
                        if chunk.startswith("```"):
                            # Triple backticks indicate code block - send as-is
                            # First, yield any accumulated backticks if they exist
                            if pending_backticks:
                                payload = {"chunk": pending_backticks}
                                yield f"event: delta\ndata: {json.dumps(payload)}\n\n"
                                pending_backticks = ""
                            payload = {"chunk": chunk}
                            yield f"event: delta\ndata: {json.dumps(payload)}\n\n"
                        elif chunk in ["`", "``"]:  # Only pure backticks, no other content
                            # Accumulate backticks - don't overwrite, append
                            pending_backticks += chunk
                            continue
                        else:
                            # Regular chunk - prepend any pending backticks
                            if pending_backticks:
                                chunk = pending_backticks + chunk
                                pending_backticks = ""
                            # JSON-encode delta payload
                            payload = {"chunk": chunk}
                            yield f"event: delta\ndata: {json.dumps(payload)}\n\n"

            # Handle any remaining pending backticks at the end of stream
            if pending_backticks:
                payload = {"chunk": pending_backticks}
                yield f"event: delta\ndata: {json.dumps(payload)}\n\n"

            # Extract token_id from data.context if available for background task
            if hasattr(data, "context") and isinstance(data.context, dict):
                token_id = data.context.get("token_id")

            # Explicitly signal completion so EventSource clients don't interpret
            # the socket close as an error.  Use a custom "done" event.
            # The [DONE] sentinel can be JSON-wrapped or left raw; we use message event
            payload = {"done": "true"}
            yield f"event: done\ndata: {json.dumps(payload)}\n\n"
            yield 'event: cta_available\ndata: {"type": "create_page"}\n\n'
        except asyncio.CancelledError:
            # This is expected if the client disconnects, so log as info and let it propagate
            log.info("Stream cancelled by client disconnect.")
        except Exception as e:
            log.error(f"Error streaming response: {e!s}")
            yield "error: 'An unexpected error occurred. Please try again'"
        finally:
            # Schedule Celery task to upsert chat search index after streaming completes
            if token_id:
                schedule_chat_search_upsert(token_id)

    try:
        return StreamingResponse(stream_response(), media_type="text/event-stream")
    except SQLGenerationError as e:
        log.error(f"SQL generation error: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
    except Exception as e:
        log.error(f"Unexpected error: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@router.delete("/delete-chat/")
async def delete_chat(data: DeleteChatRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    try:
        await is_valid_session(session)
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    result = await soft_delete_chat(chat_id=data.chat_id, db=db)

    # Schedule Celery task to mark chat as deleted in search index
    schedule_chat_deletion(str(data.chat_id))

    # The soft_delete_chat function always returns a tuple of (status_code, content)
    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)


@router.post("/feedback/")
async def handle_feedback(
    feedback_data: ChatFeedback,
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
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


@router.post("/generate-title/")
async def get_title(data: TitleRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
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


@router.get("/get-recent-user-threads/")
async def get_recent_user_threads(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    is_project_chat: Optional[bool] = False,
    session: str = Depends(cookie_schema),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    results = await get_user_chat_threads(user_id=user_id, db=db, workspace_id=workspace_id, is_project_chat=is_project_chat, is_latest=True)

    # Check if results is a tuple (error case)
    if isinstance(results, tuple) and len(results) == 2:
        status_code_val, content = results  # type: ignore[assignment]
        status_code_int: int = int(status_code_val) if isinstance(status_code_val, int) else 500
        return JSONResponse(status_code=status_code_int, content=content)

    # Success case
    return JSONResponse(content={"results": results})


@router.get("/get-chat-history/")  # deprecated. To be removed
async def get_chat_history(
    chat_id: UUID4,
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    session: str = Depends(cookie_schema),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})
    try:
        log.info(f"chat history retrieve request received for chat_id: {chat_id}")
        results: dict[str, Any] = await retrieve_chat_history(chat_id=chat_id, db=db, user_id=user_id)

        error_type = results.get("error")
        if error_type == "not_found":
            return JSONResponse(
                status_code=404,
                content={
                    "detail": results["detail"],
                    "results": {
                        "title": results.get("title", ""),
                        "dialogue": results.get("dialogue", []),
                        "llm": results.get("llm", ""),
                        "feedback": results.get("feedback", ""),
                        "reasoning": results.get("reasoning", ""),
                        "is_focus_enabled": results.get("is_focus_enabled", False),
                        "focus_project_id": results.get("focus_project_id", None),
                        "focus_workspace_id": results.get("focus_workspace_id", None),
                    },
                },
            )
        elif error_type == "unauthorized":
            return JSONResponse(
                status_code=403,
                content={
                    "detail": results["detail"],
                    "results": {
                        "title": results.get("title", ""),
                        "dialogue": results.get("dialogue", []),
                        "llm": results.get("llm", ""),
                        "feedback": results.get("feedback", ""),
                        "reasoning": results.get("reasoning", ""),
                        "is_focus_enabled": results.get("is_focus_enabled", False),
                        "focus_project_id": results.get("focus_project_id", None),
                        "focus_workspace_id": results.get("focus_workspace_id", None),
                    },
                },
            )

        return JSONResponse(
            content={
                "results": {
                    "title": results["title"],
                    "dialogue": results["dialogue"],
                    "llm": results["llm"],
                    "feedback": results["feedback"],
                    "reasoning": results.get("reasoning", ""),
                    "is_focus_enabled": results.get("is_focus_enabled", False),
                    "focus_project_id": results.get("focus_project_id", None),
                    "focus_workspace_id": results.get("focus_workspace_id", None),
                }
            }
        )

    except ValueError as ve:
        log.error(f"An error occurred during retrieval: {ve!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

    except Exception as e:
        log.error(f"An error occurred during retrieval: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@router.get("/get-chat-history-object/")
async def get_chat_history_object(
    chat_id: UUID4,
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    session: str = Depends(cookie_schema),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    try:
        log.info(f"chat history retrieve request received for chat_id: {chat_id}")
        results: dict[str, Any] = await retrieve_chat_history(chat_id=chat_id, dialogue_object=True, db=db, user_id=user_id)
        error_type = results.get("error")
        if error_type == "not_found":
            return JSONResponse(status_code=404, content={"detail": results["detail"]})
        elif error_type == "unauthorized":
            return JSONResponse(status_code=403, content={"detail": results["detail"]})

        results["dialogue"]

        return JSONResponse(
            content={
                "results": {
                    "title": results["title"],
                    "dialogue": results["dialogue"],
                    "llm": results["llm"],
                    "feedback": results["feedback"],
                    "reasoning": results.get("reasoning", ""),
                    "is_focus_enabled": results.get("is_focus_enabled", False),
                    "focus_project_id": results.get("focus_project_id", None),
                    "focus_workspace_id": results.get("focus_workspace_id", None),
                }
            }
        )

    except ValueError as ve:
        log.error(f"An error occurred during retrieval: {ve!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

    except Exception as e:
        log.error(f"An error occurred during retrieval: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@router.get("/get-models/", response_model=ModelsResponse)
async def get_model_list(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    if not workspace_slug:
        if workspace_id:
            resolved_workspace_slug = await resolve_workspace_slug(workspace_id, workspace_slug)
        else:
            log.warning("get-models: No workspace_id to resolve workspace_slug from")
            resolved_workspace_slug = None
    else:
        resolved_workspace_slug = workspace_slug
    # Convert user_id to string and provide default workspace_slug if None
    models_list = await get_active_models(db=db, user_id=str(user_id), workspace_slug=resolved_workspace_slug or "")

    # Check if models_list is a tuple (error case)
    if isinstance(models_list, tuple) and len(models_list) == 2:
        status_code, content = models_list
        return JSONResponse(status_code=status_code, content=content)

    # Success case
    model_dict = {"models": models_list}
    return JSONResponse(content=model_dict)


@router.get("/get-templates/", response_model=ChatSuggestionTemplate)
async def get_chat_template_suggestion(
    workspace_id: Optional[UUID4] = None, workspace_slug: Optional[str] = None, session: str = Depends(cookie_schema)
):
    try:
        await is_valid_session(session)
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    try:
        suggestions = tiles_factory()
        return ChatSuggestionTemplate(templates=suggestions)
    except Exception as e:
        log.error(f"An unexpected error occurred: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@router.post("/initialize-chat/")
async def initialize_chat(data: ChatInitializationRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    """Initialize a new chat and return the chat_id immediately."""
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    # Validate request data
    validation_error = validate_chat_initialization(data)
    if validation_error:
        return JSONResponse(status_code=validation_error["status_code"], content={"detail": validation_error["detail"]})

    # Initialize chat using standalone function (workspace details backfilled later in queue_answer)
    result = await initialize_new_chat(
        user_id=user_id,
        db=db,
        chat_id=data.chat_id,
        is_project_chat=data.is_project_chat,
        workspace_in_context=data.workspace_in_context,
        workspace_id=data.workspace_id,
    )

    # Handle result from service layer
    if result["success"]:
        return JSONResponse(content={"chat_id": result["chat_id"]})
    else:
        # Map service error codes to HTTP status codes
        status_code = 500  # default
        if result.get("error_code") == "CHAT_EXISTS":
            status_code = 409
        elif result.get("error_code") == "CHAT_CREATION_FAILED":
            status_code = 500
        elif result.get("error_code") == "UNEXPECTED_ERROR":
            status_code = 500

        return JSONResponse(status_code=status_code, content={"detail": result["message"]})


@router.post("/favorite-chat/")
async def favorite_user_chat(data: FavoriteChatRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    try:
        await is_valid_session(session)
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    result = await favorite_chat(chat_id=data.chat_id, db=db)

    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)


@router.post("/unfavorite-chat/")
async def unfavorite_user_chat(data: UnfavoriteChatRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    try:
        await is_valid_session(session)
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    result = await unfavorite_chat(chat_id=data.chat_id, db=db)

    # The unfavorite_chat function always returns a tuple of (status_code, content)
    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)


@router.get("/get-favorite-chats/")
async def get_user_favorite_chats(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    session: str = Depends(cookie_schema),
):
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id

    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    result = await get_favorite_chats(user_id=user_id, db=db, workspace_id=workspace_id)

    # The get_favorite_chats function always returns a tuple of (status_code, content)
    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)


@router.post("/rename-chat/")
async def rename_chat(data: RenameChatRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    try:
        await is_valid_session(session)
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    result = await rename_chat_title(chat_id=data.chat_id, new_title=data.title, db=db)

    # Schedule Celery task to update chat title in search index
    schedule_chat_rename(str(data.chat_id), data.title)

    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)


# New paginated endpoints for web
@router.get("/get-user-threads/", response_model=GetThreadsPaginatedResponse)
async def get_user_threads(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    is_project_chat: Optional[bool] = False,
    cursor: Optional[str] = None,
    per_page: int = Query(default=30, ge=1, le=100),
    session: str = Depends(cookie_schema),
    db: AsyncSession = Depends(get_async_session),
):
    """Get user chat threads with cursor-based pagination for web interface."""
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    results = await get_user_chat_threads_paginated(
        user_id=user_id, db=db, workspace_id=workspace_id, is_project_chat=is_project_chat, cursor=cursor, per_page=per_page
    )

    # Check if results is a tuple (error case)
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


@router.post("/queue-answer/")
async def queue_answer(data: ChatRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    """First phase of two-step streaming flow.
    Persists the ChatRequest payload and returns a one-time stream token.
    The token is simply the UUID of a freshly created *user* Message row so we
    don't need a new table.  The rest of the ChatRequest fields are stored in
    a MessageFlowStep (tool_name="QUEUE", step_order=0) until the client
    later redeems the token via /stream-answer/{token}."""
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    validation_error = validate_chat_request(data)
    if validation_error:
        return JSONResponse(status_code=validation_error["status_code"], content={"detail": validation_error["detail"]})

    # 1. Create a new USER message that will serve as the token
    if data.chat_id is None:
        return JSONResponse(status_code=400, content={"detail": "chat_id is required. Call /initialize-chat/ first."})

    ## need to resolve ws id and slug from project id if it's project chat

    if not data.workspace_id:
        if data.is_project_chat and data.project_id:
            log.info(f"Queue-answer: Resolving workspace_id from project_id: {data.project_id}")
            resolved_workspace_id = await resolve_workspace_id_from_project_id(str(data.project_id))
            # The DB may return an asyncpg UUID object. Convert safely to a standard uuid.UUID.
            workspace_id_to_use = UUID(str(resolved_workspace_id)) if resolved_workspace_id else None
            log.info(f"Queue-answer: Resolved workspace_id: {workspace_id_to_use}")
    else:
        workspace_id_to_use = data.workspace_id
    if not data.workspace_slug:
        if workspace_id_to_use:
            resolved_workspace_slug = await resolve_workspace_slug(workspace_id_to_use, data.workspace_slug)
        else:
            log.warning("Queue-answer: No workspace_id to resolve workspace_slug from")
            resolved_workspace_slug = None
    else:
        resolved_workspace_slug = data.workspace_slug

    token_id = uuid4()
    user_message_res = await upsert_message(
        message_id=token_id,
        chat_id=data.chat_id,  # type: ignore[arg-type]
        content=data.query,
        parsed_content=None,
        user_type=UserTypeChoices.USER.value,
        llm_model=data.llm,
        workspace_slug=resolved_workspace_slug,
        db=db,
    )

    if user_message_res.get("message") != "success":
        return JSONResponse(status_code=500, content={"detail": "Failed to create message"})

    # 2. Stash the full ChatRequest inside a flow-step row
    from fastapi.encoders import jsonable_encoder

    flow_step_payload = {
        "step_order": 0,
        "step_type": FlowStepType.TOOL.value,
        "tool_name": "QUEUE",
        "content": "queued chat request",
        # Use FastAPI's encoder to turn UUIDs/datetimes into JSON-serialisable primitives
        "execution_data": jsonable_encoder(data),
        "is_planned": False,  # QUEUE is not a planned action, it's an internal tool
        "is_executed": False,  # QUEUE is not executed by user
    }
    flow_res = await upsert_message_flow_steps(message_id=token_id, chat_id=data.chat_id, db=db, flow_steps=[flow_step_payload])

    if flow_res.get("message") != "success":
        return JSONResponse(status_code=500, content={"detail": "Failed to queue request"})

    # Backfill chat record with workspace details (after successful message creation)
    try:
        from sqlalchemy import select

        from pi.app.models.chat import Chat

        # Get the current chat record to preserve existing data
        chat_stmt = select(Chat).where(Chat.id == data.chat_id)  # type: ignore[arg-type]
        chat_result = await db.execute(chat_stmt)
        existing_chat = chat_result.scalar_one_or_none()

        if existing_chat:
            # Update the chat with workspace details
            if workspace_id_to_use is not None:
                existing_chat.workspace_id = workspace_id_to_use
            if resolved_workspace_slug is not None:
                existing_chat.workspace_slug = resolved_workspace_slug
            # Always update workspace_in_context as it's a required field in ChatRequest
            existing_chat.workspace_in_context = data.workspace_in_context
            await db.commit()
        else:
            log.warning(f"Chat {data.chat_id} not found for backfill")
    except Exception as e:
        log.error(f"Error backfilling chat workspace details: {e}")
        # Don't fail the request if backfill fails

    return {"stream_token": str(token_id)}


@router.get("/stream-answer/{token}")
async def stream_answer(token: UUID4, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    """Second phase of two-step flow.
    Looks up the queued ChatRequest by token (message_id), deletes the queue
    entry, and then re-uses the existing /get-answer/ logic to start the SSE
    stream via a pure GET endpoint."""
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception:
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    # Locate the queued flow step
    stmt = (
        select(MessageFlowStep)
        .where(MessageFlowStep.message_id == token)  # type: ignore[arg-type]
        .where(MessageFlowStep.tool_name == "QUEUE")  # type: ignore[arg-type]
    )
    res = await db.execute(stmt)
    flow_step: MessageFlowStep | None = res.scalar_one_or_none()

    if not flow_step:
        return JSONResponse(status_code=404, content={"detail": "Unknown or expired stream token"})

    # Parse the stored ChatRequest
    try:
        raw_data = flow_step.execution_data or {}
        # Check if this is an OAuth message (has oauth_required field)
        if flow_step.oauth_required:
            # This is an OAuth message - check if OAuth is now complete
            # by looking at the oauth_completed column
            if flow_step.oauth_completed:
                # OAuth is now complete! Process the request normally
                log.info(f"OAuth completed for message {token}. Processing request.")

                # Control continues to the normal processing code below
            else:
                # OAuth is still required
                return JSONResponse(
                    status_code=401,
                    content={
                        "detail": "OAuth authorization still required. Please complete OAuth authentication first.",
                        "error_code": "OAUTH_REQUIRED",
                    },
                )

        # Convert empty-string UUIDs to None so pydantic validation passes
        for field in ["project_id", "workspace_id", "chat_id"]:
            if field in raw_data and raw_data[field] == "":
                raw_data[field] = None
        raw_data["user_id"] = user_id
        queued_request = ChatRequest.parse_obj(raw_data)

    except Exception as e:
        log.error(f"Malformed execution_data for token {token}: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Corrupted queued request"})

    # Consume the queue entry so the token is single-use
    await db.delete(flow_step)
    await db.commit()

    # Pass the token/message_id forward so downstream processing reuses the same Message row
    try:
        queued_request.context["token_id"] = str(token)
    except Exception as e:
        log.warning(f"Failed to attach token_id to queued request context: {e!s}")

    # Delegate to existing get_answer for streaming
    return await get_answer(data=queued_request, session=session)


@router.post("/execute-action/")
async def execute_action(request: ActionBatchExecutionRequest, db: AsyncSession = Depends(get_async_session), session: str = Depends(cookie_schema)):
    """Execute all planned actions in a message as a batch using LLM orchestration."""

    # EXECUTION STATUS TRACKING:
    # The system tracks whether planned actions were executed by users:
    # 1. When actions are planned, they are marked with is_executed=False in MessageFlowStep
    # 2. When execute-action is called, actions are marked with is_executed=True
    # 3. Assistant messages are updated with execution results and entity information
    # 4. Conversation history includes explicit text about executed vs. not executed actions
    # This ensures complete context for follow-up questions and LLM understanding.
    try:
        # Validate session and get user
        user_id = await validate_session_and_get_user(session)
        if not user_id:
            return JSONResponse(status_code=401, content={"detail": BATCH_EXECUTION_ERRORS["INVALID_SESSION"]})

        # Validate and prepare execution data
        execution_data = await prepare_execution_data(request, user_id, db)
        if not execution_data:
            # Determine the specific error based on what failed
            if not await get_planned_actions_for_execution(request.message_id, request.chat_id, db):
                return JSONResponse(status_code=404, content={"detail": BATCH_EXECUTION_ERRORS["NO_PLANNED_ACTIONS"]})
            elif not await get_original_user_query(request.message_id, db):
                return JSONResponse(status_code=404, content={"detail": BATCH_EXECUTION_ERRORS["NO_ORIGINAL_QUERY"]})
            else:
                # OAuth or workspace issue
                return JSONResponse(
                    status_code=401,
                    content={
                        "detail": BATCH_EXECUTION_ERRORS["OAUTH_REQUIRED"],
                        "error_code": "OAUTH_REQUIRED",
                        "workspace_id": str(request.workspace_id),
                        "user_id": str(user_id),
                    },
                )

        # Execute batch actions
        context = await execute_batch_actions(execution_data, db)

        # Update the assistant message with execution results
        await update_assistant_message_with_execution_results(request.message_id, request.chat_id, context, db)

        # Return appropriate response based on execution status
        return JSONResponse(content=format_execution_response(context))

    except Exception as e:
        log.error(f"Error in execute_action: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": BATCH_EXECUTION_ERRORS["INTERNAL_ERROR"]})


@router.get("/search/", response_model=ChatSearchResponse)
async def search_chats(
    query: str = Query(..., description="Search query text"),
    workspace_id: UUID4 = Query(..., description="Workspace ID to filter by"),
    is_project_chat: Optional[bool] = Query(False, description="Filter by project chat flag"),
    cursor: Optional[str] = Query(None, description="Cursor for pagination"),
    session: str = Depends(cookie_schema),
    db: AsyncSession = Depends(get_async_session),
):
    """Search chats by title and message content with cursor-based pagination."""
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    # Validate query parameters
    if not query or not query.strip():
        return JSONResponse(status_code=400, content={"detail": "Search query cannot be empty"})

    try:
        # Initialize search service
        search_service = ChatSearchService()

        try:
            results, pagination = await search_service.search_chats(
                query=query.strip(),
                user_id=user_id,
                workspace_id=workspace_id,
                is_project_chat=is_project_chat,
                cursor=cursor,
                per_page=30,  # Hardcoded for performance
            )

            # Prepare response - use model_dump with mode='json' to handle UUID serialization
            response_data = pagination.model_dump(mode="json")
            response_data["results"] = [result.model_dump(mode="json") for result in results]

            return JSONResponse(content=response_data)

        finally:
            # Ensure search service is properly closed
            await search_service.close()

    except Exception as e:
        log.error(f"Error searching chats: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
