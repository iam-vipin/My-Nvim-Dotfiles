# pi/app/api/v1/endpoints/mobile/chat.py
import asyncio
import contextlib
import json
import uuid
from typing import Coroutine
from typing import Optional
from typing import cast

from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v1.dependencies import jwt_schema
from pi.app.api.v1.dependencies import validate_jwt_token
from pi.app.api.v1.helpers.plane_sql_queries import resolve_workspace_id_from_project_id
from pi.app.models.enums import FlowStepType
from pi.app.models.enums import UserTypeChoices
from pi.app.models.message import MessageFlowStep
from pi.app.schemas.mobile.chat import ChatFeedbackMobile
from pi.app.schemas.mobile.chat import ChatInitializationRequestMobile
from pi.app.schemas.mobile.chat import ChatRequestMobile
from pi.app.schemas.mobile.chat import ChatSearchResponseMobile
from pi.app.schemas.mobile.chat import ChatStartResponseMobile
from pi.app.schemas.mobile.chat import ChatSuggestionMobile
from pi.app.schemas.mobile.chat import ChatSuggestionTemplateMobile
from pi.app.schemas.mobile.chat import DeleteChatRequestMobile
from pi.app.schemas.mobile.chat import FavoriteChatRequestMobile
from pi.app.schemas.mobile.chat import GetThreadsMobile
from pi.app.schemas.mobile.chat import ModelsResponseMobile
from pi.app.schemas.mobile.chat import RenameChatRequestMobile
from pi.app.schemas.mobile.chat import TitleRequestMobile
from pi.app.schemas.mobile.chat import UnfavoriteChatRequestMobile
from pi.app.utils import validate_chat_initialization
from pi.app.utils import validate_chat_request
from pi.app.utils.background_tasks import schedule_chat_deletion
from pi.app.utils.background_tasks import schedule_chat_rename
from pi.app.utils.background_tasks import schedule_chat_search_upsert
from pi.app.utils.exceptions import SQLGenerationError
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.core.db.plane_pi.lifecycle import get_streaming_db_session
from pi.services.chat.chat import PlaneChatBot
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
from pi.services.retrievers.pg_store import rename_chat_title
from pi.services.retrievers.pg_store import retrieve_chat_history
from pi.services.retrievers.pg_store import soft_delete_chat
from pi.services.retrievers.pg_store import unfavorite_chat
from pi.services.retrievers.pg_store import update_message_feedback
from pi.services.retrievers.pg_store.message import get_message_by_id
from pi.services.retrievers.pg_store.message import mark_assistant_response_as_replaced
from pi.services.retrievers.pg_store.message import reconstruct_chat_request_from_message
from pi.services.retrievers.pg_store.message import upsert_message
from pi.services.retrievers.pg_store.message import upsert_message_flow_steps

log = logger.getChild("v1/mobile/chat")
mobile_router = APIRouter()


@mobile_router.post("/get-answer/")
async def get_answer(
    data: ChatRequestMobile,
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
    db: AsyncSession = Depends(get_async_session),
):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    # Pre-validate required fields
    if data.workspace_in_context and not (data.workspace_id or data.project_id):
        # currently mobile not providing focus. so, set project_id as None
        data.project_id = None
        return JSONResponse(status_code=400, content={"detail": "Either project_id or workspace_id must be provided"})

    # Constructing query_id to insert into index, can be removed after shiting to web flow (queue_answer, stream_answer)
    query_id = uuid.uuid4()
    data.context["token_id"] = str(query_id)

    llm = data.llm
    log.info(f"Processing mobile chat request for chat_id={data.chat_id}, llm={llm}")
    chatbot = PlaneChatBot(llm=llm)

    async def stream_response():
        token_id = None
        try:
            async with get_streaming_db_session() as stream_db:
                # Heartbeat mechanism that only emits after 10s of inactivity
                heartbeat_stop = asyncio.Event()
                heartbeat_task: Optional[asyncio.Task[None]] = None

                async def heartbeat_emitter() -> None:
                    """Sleep for 10s, then complete (heartbeat fires)."""
                    with contextlib.suppress(asyncio.CancelledError):
                        await asyncio.sleep(10)

                base_iter = chatbot.process_query_stream(data, stream_db)
                next_chunk_task: asyncio.Task[str] = asyncio.create_task(cast(Coroutine[None, None, str], base_iter.__anext__()))

                # Start initial heartbeat timer
                heartbeat_task = asyncio.create_task(heartbeat_emitter())

                try:
                    while True:
                        # Race the next chunk against the heartbeat timer
                        done, _pending = await asyncio.wait({next_chunk_task, heartbeat_task}, return_when=asyncio.FIRST_COMPLETED)

                        # If heartbeat timer completed first, emit heartbeat and restart timer
                        if heartbeat_task in done and not heartbeat_stop.is_set():
                            yield "event: reasoning\ndata: ⏳ Still working...\n\n"
                            # Restart heartbeat timer
                            heartbeat_task = asyncio.create_task(heartbeat_emitter())

                        if next_chunk_task in done:
                            try:
                                chunk = next_chunk_task.result()
                            except StopAsyncIteration:
                                break
                            except Exception as _e:
                                log.error(f"Error reading mobile stream chunk: {_e!s}")
                                break

                            # Cancel and restart heartbeat timer since we got a chunk (activity detected)
                            if heartbeat_task and not heartbeat_task.done():
                                heartbeat_task.cancel()
                                with contextlib.suppress(asyncio.CancelledError):
                                    await heartbeat_task
                            heartbeat_task = asyncio.create_task(heartbeat_emitter())

                            if chunk.startswith("πspecial reasoning blockπ: "):
                                reasoning_content = chunk.replace("πspecial reasoning blockπ: ", "")
                                yield f"event: reasoning\ndata: {reasoning_content}\n\n"
                            elif chunk.startswith("πspecial clarification blockπ: "):
                                clarification_content = chunk.replace("πspecial clarification blockπ: ", "")
                                try:
                                    clarification_data = json.loads(clarification_content)
                                    formatted_text = format_clarification_as_text(clarification_data)
                                    yield f"event: delta\ndata: {formatted_text}\n\n"
                                except json.JSONDecodeError:
                                    log.warning(f"Failed to parse clarification JSON: {clarification_content}")
                                    formatted_text = "I'm sorry, I can't understand your request in your workspace context. Can you be more specific?"
                                    yield f"event: delta\ndata: {formatted_text}\n\n"
                            elif chunk.startswith("πspecial actions blockπ: "):
                                actions_content = chunk.replace("πspecial actions blockπ: ", "")
                                try:
                                    actions_data = json.loads(actions_content)
                                    yield f"event: actions\ndata: {json.dumps(actions_data)}\n\n"
                                except json.JSONDecodeError:
                                    log.warning(f"Failed to parse actions JSON: {actions_content}")
                                    yield f"event: delta\ndata: {chunk}\n\n"
                            else:
                                yield f"event: delta\ndata: {chunk}\n\n"

                            # Prepare next iteration
                            next_chunk_task = asyncio.create_task(cast(Coroutine[None, None, str], base_iter.__anext__()))
                finally:
                    heartbeat_stop.set()
                    if heartbeat_task and not heartbeat_task.done():
                        heartbeat_task.cancel()
                        with contextlib.suppress(asyncio.CancelledError):
                            await heartbeat_task

            # Extract token_id from data.context if available for background task (Fix #2: Remove duplicate)
            if hasattr(data, "context") and isinstance(data.context, dict):
                token_id = data.context.get("token_id")

        except Exception as e:
            log.error(f"Error processing chat request: {e!s}")
            # Fix #3: Add missing double newline for SSE spec compliance
            yield "event: error\ndata: An unexpected error occurred. Please try again\n\n"
        finally:
            # Schedule Celery task to upsert chat search index after streaming completes
            if token_id:
                schedule_chat_search_upsert(token_id)

    try:
        return StreamingResponse(stream_response(), media_type="text/event-stream")

    except SQLGenerationError:
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
    except Exception:
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@mobile_router.post("/initialize-chat/")
async def initialize_chat(
    data: ChatInitializationRequestMobile,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    """Initialize a new chat and return the chat_id immediately."""
    try:
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

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


@mobile_router.post("/queue-answer/")
async def queue_answer(
    data: ChatRequestMobile,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    """First phase of two-step streaming flow.
    Persists the ChatRequest payload and returns a one-time stream token.
    The token is simply the UUID of a freshly created *user* Message row so we
    don't need a new table.  The rest of the ChatRequest fields are stored in
    a MessageFlowStep (tool_name="QUEUE", step_order=0) until the client
    later redeems the token via /stream-answer/{token}."""
    try:
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    validation_error = validate_chat_request(data)
    if validation_error:
        return JSONResponse(status_code=validation_error["status_code"], content={"detail": validation_error["detail"]})

    # 1. Create a new USER message that will serve as the token
    if data.chat_id is None:
        return JSONResponse(status_code=400, content={"detail": "chat_id is required. Call /initialize-chat/ first."})

    ## need to resolve ws id and slug from project id if it's project chat

    if not data.workspace_id:
        if data.is_project_chat and data.project_id:
            log.info(f"Mobile Queue-answer: Resolving workspace_id from project_id: {data.project_id}")
            resolved_workspace_id = await resolve_workspace_id_from_project_id(str(data.project_id))
            # The DB may return an asyncpg UUID object. Convert safely to a standard uuid.UUID.
            from uuid import UUID

            workspace_id_to_use = UUID(str(resolved_workspace_id)) if resolved_workspace_id else None
            log.info(f"Mobile Queue-answer: Resolved workspace_id: {workspace_id_to_use}")
    else:
        workspace_id_to_use = data.workspace_id
    if not data.workspace_slug:
        if workspace_id_to_use:
            resolved_workspace_slug = await resolve_workspace_slug(workspace_id_to_use, data.workspace_slug)
        else:
            log.warning("Mobile Queue-answer: No workspace_id to resolve workspace_slug from")
            resolved_workspace_slug = None
    else:
        resolved_workspace_slug = data.workspace_slug

    from uuid import uuid4

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


@mobile_router.get("/stream-answer/{token}")
async def stream_answer(
    token: UUID4,
    db: AsyncSession = Depends(get_async_session),
    auth_token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    """Second phase of two-step flow.
    Looks up the queued ChatRequest by token (message_id), deletes the queue
    entry, and then re-uses the existing /get-answer/ logic to start the SSE
    stream via a pure GET endpoint.

    Also handles REGENERATE when called with an existing user message ID
    (no QUEUE flow step present)."""
    try:
        auth = await validate_jwt_token(auth_token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception:
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    # Locate the queued flow step
    from sqlalchemy import select

    stmt = (
        select(MessageFlowStep)
        .where(MessageFlowStep.message_id == token)  # type: ignore[arg-type]
        .where(MessageFlowStep.tool_name == "QUEUE")  # type: ignore[arg-type]
    )
    res = await db.execute(stmt)
    flow_step: MessageFlowStep | None = res.scalar_one_or_none()

    if not flow_step:
        # REGENERATE FLOW: No QUEUE flow step means this is regenerate
        log.info(f"Mobile: No QUEUE flow step found for token {token}. Treating as regenerate request.")
        # 1. Get the user message
        user_message = await get_message_by_id(db, token)

        if not user_message:
            log.warning(f"Mobile: Message not found for token {token}")
            return JSONResponse(status_code=404, content={"detail": "Message not found"})

        # 2. Mark old assistant response as replaced BEFORE generating new one
        # This ensures retrieve_chat_history() won't include it in context for new generation
        marked = await mark_assistant_response_as_replaced(db, user_message.id)
        if marked:
            log.info(f"Mobile: Marked old assistant response(s) as replaced for message {token}")
        else:
            log.info(f"Mobile: No existing assistant response found for message {token} (first generation or already replaced)")

        # 4. Reconstruct ChatRequest from user message
        try:
            queued_request = await reconstruct_chat_request_from_message(db, user_message, user_id)
        except Exception as e:
            log.error(f"Mobile: Error reconstructing ChatRequest from message {token}: {e}")
            return JSONResponse(status_code=500, content={"detail": "Failed to reconstruct request"})

        # 5. Pass token_id so new assistant message reuses same user message as parent
        try:
            queued_request.context["token_id"] = str(token)
        except Exception as e:
            log.warning(f"Mobile: Failed to attach token_id to regenerate request context: {e!s}")

        log.info(f"Mobile: Regenerating response for message {token}")

        # 6. Stream new response (get_answer will call process_query_stream)
        #    When process_query_stream calls retrieve_chat_history,
        #    it will NOT see the old response because is_replaced=True
        return await get_answer(data=queued_request, token=auth_token, db=db)

    else:
        # NORMAL FLOW: QUEUE flow step exists, this is first generation
        # Parse the stored ChatRequest
        try:
            raw_data = flow_step.execution_data or {}
            # Check if this is an OAuth message (has oauth_required field)
            if flow_step.oauth_required:
                # This is an OAuth message - check if OAuth is now complete
                # by looking at the oauth_completed column
                if flow_step.oauth_completed:
                    # OAuth is now complete! Process the request normally
                    log.info(f"Mobile: OAuth completed for message {token}. Processing request.")
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
            queued_request = ChatRequestMobile.parse_obj(raw_data)

        except Exception as e:
            log.error(f"Mobile: Malformed execution_data for token {token}: {e!s}")
            return JSONResponse(status_code=500, content={"detail": "Corrupted queued request"})

        # Consume the queue entry so the token is single-use (for normal flow)
        await db.delete(flow_step)
        await db.commit()

        # Pass the token/message_id forward so downstream processing reuses the same Message row
        try:
            queued_request.context["token_id"] = str(token)
        except Exception as e:
            log.warning(f"Mobile: Failed to attach token_id to queued request context: {e!s}")

        # Delegate to existing get_answer for streaming
        return await get_answer(data=queued_request, token=auth_token, db=db)


@mobile_router.delete("/delete-chat/")
async def delete_chat(
    data: DeleteChatRequestMobile,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    result = await soft_delete_chat(chat_id=data.chat_id, db=db)

    # Schedule Celery task to mark chat as deleted in search index
    schedule_chat_deletion(str(data.chat_id))

    # The soft_delete_chat function always returns a tuple of (status_code, content)
    status_code, _ = result
    if status_code == 200:
        return JSONResponse(status_code=200, content={"detail": True})
    else:
        return JSONResponse(status_code=status_code, content={"detail": False})


@mobile_router.post("/feedback/")
async def handle_feedback(
    feedback_data: ChatFeedbackMobile,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    try:
        # Get user_id from JWT
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    result = await update_message_feedback(
        chat_id=feedback_data.chat_id,
        message_index=feedback_data.message_index,
        feedback_value=feedback_data.feedback.value,
        user_id=user_id,
        db=db,
        feedback_message=feedback_data.feedback_message,
    )

    # The update_message_feedback function always returns a tuple of (status_code, content)
    status_code, _ = result
    if status_code == 200:
        return JSONResponse(status_code=200, content={"detail": True})
    else:
        return JSONResponse(status_code=status_code, content={"detail": False})


@mobile_router.post("/generate-title/")
async def get_title(
    data: TitleRequestMobile, token: HTTPAuthorizationCredentials = Depends(jwt_schema), db: AsyncSession = Depends(get_async_session)
):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})
    if not data.chat_id:
        return JSONResponse(status_code=400, content={"detail": "chat_id is required"})

    try:
        # Get messages for this chat using the utility function
        messages = await get_chat_messages(chat_id=data.chat_id, db=db)

        # Check if messages is a tuple (error case)
        if isinstance(messages, tuple) and len(messages) == 2:
            status_code, content = messages
            return JSONResponse(status_code=status_code, content=content)

        chatbot = PlaneChatBot()
        title = await chatbot.get_title(chat_id=data.chat_id, messages=messages, db=db)

        return JSONResponse(content={"title": title})
    except Exception as e:
        log.error(f"Error generating title: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@mobile_router.post("/get-user-threads/")
async def get_user_threads(
    data: GetThreadsMobile, token: HTTPAuthorizationCredentials = Depends(jwt_schema), db: AsyncSession = Depends(get_async_session)
):
    try:
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    results = await get_user_chat_threads(user_id=user_id, workspace_id=data.workspace_id, db=db, is_project_chat=data.is_project_chat)

    # Check if results is a tuple (error case)
    if isinstance(results, tuple) and len(results) == 2:
        status_code, content = results
        return JSONResponse(status_code=status_code, content=content)

    # Success case
    return JSONResponse(content={"results": results})


@mobile_router.post("/get-chat-history/")
async def get_chat_history(
    data: TitleRequestMobile, token: HTTPAuthorizationCredentials = Depends(jwt_schema), db: AsyncSession = Depends(get_async_session)
):
    try:
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})
    try:
        results = await retrieve_chat_history(chat_id=data.chat_id, db=db, user_id=user_id)
        error_type = results.get("error")
        if error_type == "not_found":
            return JSONResponse(status_code=404, content={"detail": results["detail"]})
        elif error_type == "unauthorized":
            return JSONResponse(status_code=403, content={"detail": results["detail"]})

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
    except Exception as e:
        log.error(f"Error retrieving chat history: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@mobile_router.post("/get-chat-history-object/")
async def get_chat_history_object(
    data: TitleRequestMobile, token: HTTPAuthorizationCredentials = Depends(jwt_schema), db: AsyncSession = Depends(get_async_session)
):
    try:
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})
    try:
        chat_id = data.chat_id
        log.info(f"Mobile chat history object request received for chat_id: {chat_id}")
        results = await retrieve_chat_history(chat_id=chat_id, dialogue_object=True, db=db, user_id=user_id)
        error_type = results.get("error")
        if error_type == "not_found":
            return JSONResponse(status_code=404, content={"detail": results["detail"]})
        elif error_type == "unauthorized":
            return JSONResponse(status_code=403, content={"detail": results["detail"]})

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
    except Exception as e:
        log.error(f"Error retrieving chat history object: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@mobile_router.get("/get-models/", response_model=ModelsResponseMobile)
async def get_model_list(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    try:
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    # Convert user_id to string and provide default workspace_slug if None
    models_list = await get_active_models(db=db, user_id=str(user_id), workspace_slug=workspace_slug or "")

    # Check if models_list is a tuple (error case)
    if isinstance(models_list, tuple) and len(models_list) == 2:
        status_code, content = models_list
        return JSONResponse(status_code=status_code, content=content)

    # Success case
    model_dict = {"models": models_list}
    return JSONResponse(content=model_dict)


@mobile_router.get("/get-templates/", response_model=ChatSuggestionTemplateMobile)
async def get_chat_template_suggestion(
    workspace_id: Optional[UUID4] = None, workspace_slug: Optional[str] = None, token: HTTPAuthorizationCredentials = Depends(jwt_schema)
):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    try:
        suggestions = tiles_factory()
        return ChatSuggestionTemplateMobile(templates=suggestions)
    except Exception as e:
        log.error(f"Error getting templates: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@mobile_router.post("/get-placeholder/", response_model=ChatStartResponseMobile)
async def start_chat(data: ChatSuggestionMobile, token: HTTPAuthorizationCredentials = Depends(jwt_schema)):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    try:
        # Just return the template text as the placeholder - no database queries needed
        placeholder = data.text or "How can I assist you with your work today?"
        return ChatStartResponseMobile(placeholder=placeholder)
    except Exception as e:
        log.error(f"An unexpected error occurred: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@mobile_router.post("/favorite-chat/")
async def favorite_user_chat(
    data: FavoriteChatRequestMobile, db: AsyncSession = Depends(get_async_session), token: HTTPAuthorizationCredentials = Depends(jwt_schema)
):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    result = await favorite_chat(chat_id=data.chat_id, db=db)

    status_code, _ = result
    if status_code == 200:
        return JSONResponse(status_code=200, content={"detail": True})
    else:
        return JSONResponse(status_code=status_code, content={"detail": False})


@mobile_router.post("/unfavorite-chat/")
async def unfavorite_user_chat(
    data: UnfavoriteChatRequestMobile, db: AsyncSession = Depends(get_async_session), token: HTTPAuthorizationCredentials = Depends(jwt_schema)
):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    result = await unfavorite_chat(chat_id=data.chat_id, db=db)

    # The unfavorite_chat function always returns a tuple of (status_code, content)
    status_code, _ = result
    if status_code == 200:
        return JSONResponse(status_code=200, content={"detail": True})
    else:
        return JSONResponse(status_code=status_code, content={"detail": False})


@mobile_router.get("/get-favorite-chats/")
async def get_user_favorite_chats(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    try:
        # Get user_id from JWT
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    result = await get_favorite_chats(user_id=user_id, db=db, workspace_id=workspace_id)

    # The get_favorite_chats function always returns a tuple of (status_code, content)
    status_code, content = result
    return JSONResponse(status_code=status_code, content=content)


@mobile_router.post("/rename-chat/")
async def rename_chat(
    data: RenameChatRequestMobile,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    try:
        await validate_jwt_token(token)
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    result = await rename_chat_title(chat_id=data.chat_id, new_title=data.title, db=db)

    # Schedule Celery task to update chat title in search index
    schedule_chat_rename(str(data.chat_id), data.title)

    status_code, _ = result
    if status_code == 200:
        return JSONResponse(status_code=200, content={"detail": True})
    else:
        return JSONResponse(status_code=status_code, content={"detail": False})


from fastapi import Query


@mobile_router.get("/search/", response_model=ChatSearchResponseMobile)
async def search_chats(
    query: str = Query(..., description="Search query text"),
    workspace_id: UUID4 = Query(..., description="Workspace ID to filter by"),
    is_project_chat: Optional[bool] = Query(False, description="Filter by project chat flag"),
    cursor: Optional[str] = Query(None, description="Cursor for pagination"),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
    db: AsyncSession = Depends(get_async_session),
):
    """Search chats by title and message content with cursor-based pagination."""
    try:
        # Get user_id from JWT
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

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
