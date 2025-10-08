# pi/app/api/v1/endpoints/mobile/chat.py
import uuid
from typing import Optional

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
from pi.app.schemas.mobile.chat import ChatFeedbackMobile
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
from pi.app.utils.background_tasks import schedule_chat_deletion
from pi.app.utils.background_tasks import schedule_chat_rename
from pi.app.utils.background_tasks import schedule_chat_search_upsert
from pi.app.utils.exceptions import SQLGenerationError
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.core.db.plane_pi.lifecycle import get_streaming_db_session
from pi.services.chat.chat import PlaneChatBot
from pi.services.chat.search import ChatSearchService
from pi.services.chat.templates import tiles_factory
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
                async for chunk in chatbot.process_query_stream(data, stream_db):
                    if chunk.startswith("πspecial reasoning blockπ: "):
                        # Format reasoning as proper SSE
                        reasoning_content = chunk.replace("πspecial reasoning blockπ: ", "")
                        yield f"event: reasoning\ndata: {reasoning_content}\n\n"
                    elif chunk.startswith("πspecial actions blockπ: "):
                        # Extract the actions data and send as separate actions event
                        actions_content = chunk.replace("πspecial actions blockπ: ", "")
                        try:
                            # Parse the JSON content to validate it
                            import json

                            actions_data = json.loads(actions_content)
                            yield f"event: actions\ndata: {json.dumps(actions_data)}\n\n"
                        except json.JSONDecodeError:
                            # If JSON parsing fails, fall back to delta event
                            log.warning(f"Failed to parse actions JSON: {actions_content}")
                            yield f"event: delta\ndata: {chunk}\n\n"
                    else:
                        yield f"event: delta\ndata: {chunk}\n\n"

            # Extract token_id from data.context if available for background task
            if hasattr(data, "context") and isinstance(data.context, dict):
                token_id = data.context.get("token_id")

            # Extract token_id from data.context if available for background task
            if hasattr(data, "context") and isinstance(data.context, dict):
                token_id = data.context.get("token_id")

        except Exception as e:
            log.error(f"Error processing chat request: {e!s}")
            yield "event: error\ndata: An unexpected error occurred. Please try again"
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
