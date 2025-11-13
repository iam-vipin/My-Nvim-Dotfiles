"""Response processing and streaming logic."""

import asyncio

from pi import logger
from pi.app.models.enums import UserTypeChoices
from pi.services.retrievers.pg_store.message import upsert_message

log = logger.getChild(__name__)


async def process_response(base_stream, chat_id, query_id, response_id, switch_llm, db, reasoning=""):
    """Process streaming response and store the final result."""
    final_response_ = []

    try:
        async for chunk in base_stream:
            final_response_.append(chunk)
            yield chunk
    except asyncio.CancelledError:
        log.info(f"ChatID: {chat_id} - Stream processing was cancelled.")
        raise

    final_response = "".join(final_response_)

    # Save assistant message with reasoning blocks
    assistant_message_result = await upsert_message(
        message_id=response_id,
        chat_id=chat_id,
        content=final_response,
        user_type=UserTypeChoices.ASSISTANT.value,
        parent_id=query_id,
        llm_model=switch_llm,
        reasoning=reasoning,
        db=db,
    )

    # Assistant response search index upserted via Celery background task

    if assistant_message_result["message"] != "success":
        yield "An unexpected error occurred. Please try again"

    # log.info(f"ChatID: {chat_id} - Final Response: {final_response}")

    # Instead of returning, yield a special signal that can be detected
    yield f"__FINAL_RESPONSE__{final_response}"
