import json
import uuid
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple
from typing import Union

from pydantic import UUID4
from sqlalchemy import desc
from sqlalchemy import func
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models import Chat
from pi.app.models import Message
from pi.app.models import MessageFlowStep
from pi.app.models import UserChatPreference
from pi.app.models.enums import ExecutionStatus
from pi.app.models.enums import UserTypeChoices
from pi.app.models.message_attachment import MessageAttachment
from pi.app.schemas.chat import PaginationResponse
from pi.app.utils.attachments import get_presigned_url_download
from pi.app.utils.attachments import get_presigned_url_preview
from pi.app.utils.pagination import apply_cursor_pagination
from pi.app.utils.pagination import check_pagination_bounds
from pi.app.utils.pagination import create_pagination_response
from pi.services.query_utils import parse_query

log = logger.getChild(__name__)


internal_reasoning_format_dict = {
    "rewrite": "Rewritten Query",
    "routing": "Routing",
    "tool": "Selected Agent",
    "PLANE_STRUCTURED_DATABASE_AGENT": "Plane Structured Database Agent",
    "PLANE_VECTOR_SEARCH_AGENT": "Plane Vector Search Agent",
    "PLANE_PAGES_AGENT": "Plane Pages Search Agent",
}


def parse_flow_step_content(content: str) -> Union[str, Dict[str, Any], List[Any], int, float, bool, None]:
    """
    Parse content from MessageFlowStep.
    Returns parsed JSON (dict, list, str, int, float, bool, None) if content is valid JSON,
    otherwise returns the string as-is.
    """
    if not content:
        return ""

    # Try to parse as JSON first
    try:
        return json.loads(content)
    except (json.JSONDecodeError, TypeError):
        # If not valid JSON, return as string
        return content


def _extract_success_message_from_result(result: str) -> Optional[str]:
    """Extract the nice success message from the tool result."""
    if not result:
        return None

    # Try to find the message that comes after "✅ " and before "\n\n"
    success_marker = "✅ "
    if success_marker in result:
        # Find the start of the success message
        start_idx = result.find(success_marker) + len(success_marker)
        # Find the end (either double newline or end of string)
        end_markers = ["\n\n", "\n", result]
        end_idx = len(result)
        for marker in end_markers:
            if marker != result:
                marker_idx = result.find(marker, start_idx)
                if marker_idx != -1 and marker_idx < end_idx:
                    end_idx = marker_idx

        success_message = result[start_idx:end_idx].strip()
        if success_message:
            return success_message

    # Fallback: look for common success patterns
    if "successfully created" in result.lower():
        # Try to extract "Successfully created work item 'Name'"
        import re

        match = re.search(r"[Ss]uccessfully created.*?'([^']*)'", result)
        if match:
            return f"Successfully created {match.group(1)}"
    elif "successfully updated" in result.lower():
        # Try to extract "Successfully updated work item 'Name'"
        import re

        match = re.search(r"[Ss]uccessfully updated.*?'([^']*)'", result)
        if match:
            return f"Successfully updated {match.group(1)}"

    return None


def extract_execution_status_from_flow_steps(message_flow_steps: List[MessageFlowStep], user_message_id: uuid.UUID) -> Dict[str, Any]:
    """
    Extract execution status information from MessageFlowStep records for a specific user message.
    Returns a dictionary with execution status details needed by the frontend.
    """
    # Filter flow steps for this specific message and only planned actions
    message_specific_steps = [step for step in message_flow_steps if step.message_id == user_message_id and step.is_planned]

    if not message_specific_steps:
        return {"action_summary": {"total_planned": 0, "completed": 0, "failed": 0, "duration_seconds": 0.0}, "actions": []}

    # Sort by step_order to ensure proper sequence
    message_specific_steps.sort(key=lambda x: x.step_order or 0)

    # Analyze execution status across all planned actions
    total_actions = len(message_specific_steps)
    executed_actions = sum(1 for step in message_specific_steps if step.is_executed)
    successful_actions = sum(1 for step in message_specific_steps if step.execution_success == ExecutionStatus.SUCCESS)
    failed_actions = sum(1 for step in message_specific_steps if step.execution_success == ExecutionStatus.FAILED)
    sum(1 for step in message_specific_steps if step.execution_success == ExecutionStatus.PENDING)

    # Determine overall execution status with corrected logic
    if executed_actions == 0:
        pass
    elif successful_actions == total_actions:
        pass
    elif successful_actions == 0 and (failed_actions > 0 or executed_actions > 0):
        # All attempted actions failed - this is a complete failure, not partial
        if failed_actions == total_actions:
            pass
        else:
            pass
    else:
        # Mixed results - some succeeded, some failed
        pass

    # Collect error messages from failed actions
    error_messages = [
        step.execution_error for step in message_specific_steps if step.execution_success == ExecutionStatus.FAILED and step.execution_error
    ]
    "; ".join(error_messages) if error_messages else None

    # Build actions array similar to execute-action endpoint format
    actions = []
    for step in message_specific_steps:
        action_data = {
            "tool": step.tool_name or "unknown",
            "success": step.execution_success == ExecutionStatus.SUCCESS,
            "executed_at": None,
            "artifact_id": None,  # NEW: Include artifact ID
        }

        # Extract execution details from execution_data if available
        if step.execution_data and isinstance(step.execution_data, dict):
            executed_at = step.execution_data.get("executed_at")
            if executed_at:
                action_data["executed_at"] = executed_at

            # Extract artifact ID
            artifact_id = step.execution_data.get("artifact_id")
            if artifact_id:
                action_data["artifact_id"] = artifact_id

            # Include planned sequence for ordering if present on step
            try:
                if hasattr(step, "step_order") and step.step_order is not None:
                    action_data["sequence"] = step.step_order
            except Exception:
                pass

            # Extract entity information
            entity_info = step.execution_data.get("entity_info")

            if entity_info and isinstance(entity_info, dict):
                # Only include essential entity fields
                essential_entity = {}
                for field in ["entity_url", "entity_name", "entity_type", "entity_id"]:
                    if field in entity_info and entity_info[field]:
                        essential_entity[field] = entity_info[field]

                if essential_entity:
                    action_data["entity"] = essential_entity

        # Add success/error message
        if step.execution_success == ExecutionStatus.SUCCESS:
            # Try to extract success message from execution result or use generic
            if step.execution_data and isinstance(step.execution_data, dict):
                # The result is stored as "execution_result" not "result"
                result = step.execution_data.get("execution_result", "")

                if result:
                    # Extract nice success message (similar to create_clean_actions_response)
                    nice_message = _extract_success_message_from_result(result)
                    if nice_message:
                        action_data["message"] = nice_message
                    else:
                        action_data["message"] = "Action completed successfully"
                else:
                    action_data["message"] = "Action completed successfully"
            else:
                action_data["message"] = "Action completed successfully"
        elif step.execution_success == ExecutionStatus.FAILED:
            # Include error message for failed actions
            error_msg = step.execution_error or "Action failed"
            # Truncate long error messages
            action_data["error"] = error_msg[:200] + "..." if len(error_msg) > 200 else error_msg

        actions.append(action_data)

    return {
        "action_summary": {
            "total_planned": total_actions,
            "completed": successful_actions,
            "failed": failed_actions,
            "duration_seconds": 0.0,  # Default duration since we don't track it in flow steps
        },
        "actions": actions,
    }


async def retrieve_chat_history(
    chat_id: UUID4, db: AsyncSession, pi_internal: bool = False, dialogue_object: bool = False, user_id: Optional[UUID4] = None
) -> dict[str, Any]:
    """Retrieves chat history for a specific chat ID with optional formatting options using database."""
    try:
        # Step 1: Always fetch chat by ID
        chat_query = select(Chat).where(Chat.id == chat_id)  # type: ignore[arg-type]
        chat_result = await db.execute(chat_query)
        chat = chat_result.scalar_one_or_none()

        # Step 2: Handle chat not found
        if not chat:
            log.warning(f"Chat not found: chat_id={chat_id}")
            return {
                "error": "not_found",
                "detail": "Chat not found.",
                "chat_id": str(chat_id),
                "title": "",
                "dialogue": [],
                "feedback": "",
                "reasoning": "",
                "llm": "",
                # "internal_reasoning": "",
            }

        # Step 3: If user_id is provided, check if user owns this chat
        if user_id and str(chat.user_id) != str(user_id):
            log.warning(f"Unauthorized access attempt: user_id={user_id}, chat_id={chat_id}")
            return {
                "error": "unauthorized",
                "detail": "You are not authorized to access this chat.",
                "chat_id": str(chat_id),
                "title": "",
                "dialogue": [],
                "feedback": "",
                "reasoning": "",
                "llm": "",
                # "internal_reasoning": "",
            }

        # Fetch user chat preference
        user_chat_preference_query = (
            select(UserChatPreference).where(UserChatPreference.user_id == user_id).where(UserChatPreference.chat_id == chat_id)  # type: ignore[union-attr,arg-type]
        )
        user_chat_preference_result = await db.execute(user_chat_preference_query)
        user_chat_preference = user_chat_preference_result.scalar_one_or_none()

        # Step 4: Get messages for this chat ordered by sequence
        message_query = select(Message).where(Message.chat_id == chat_id).order_by(Message.sequence)  # type: ignore[arg-type]
        message_result = await db.execute(message_query)
        messages = list(message_result.scalars().all())

        # Get message flow steps for the chat (always fetch, not just for pi_internal)
        # This is needed to provide execution status information to the frontend
        message_flow_steps_query = select(MessageFlowStep).where(MessageFlowStep.chat_id == chat_id)  # type: ignore[arg-type]
        message_flow_steps_result = await db.execute(message_flow_steps_query)
        message_flow_steps = list(message_flow_steps_result.scalars().all())

        # Step 5: Get most recent assistant message to extract LLM model
        last_assistant_message_query = (
            select(Message)
            .where(Message.chat_id == chat_id)  # type: ignore[arg-type]
            .where(Message.user_type == UserTypeChoices.ASSISTANT.value)  # type: ignore[arg-type]
            .order_by(desc(Message.created_at))  # type: ignore[arg-type]
            .limit(1)
        )
        last_message_result = await db.execute(last_assistant_message_query)
        last_assistant_message = last_message_result.scalar_one_or_none()
        chat_llm = last_assistant_message.llm_model if last_assistant_message else ""

        # Step 6: Get attachments for all messages (only IDs)
        message_ids = [msg.id for msg in messages] if messages else []
        attachments_dict: Dict[Optional[uuid.UUID], List[str]] = {}
        attachments_object_dict: Dict[Optional[uuid.UUID], List[Dict[str, Any]]] = {}

        if message_ids:
            attachments_query = select(MessageAttachment).where(
                MessageAttachment.message_id.in_(message_ids),  # type: ignore[union-attr]
                MessageAttachment.status == "uploaded",  # type: ignore[union-attr,arg-type]
                MessageAttachment.deleted_at.is_(None),  # type: ignore[union-attr]
            )
            attachments_result = await db.execute(attachments_query)
            attachments = attachments_result.scalars().all()

            # Group attachment IDs by message_id
            for attachment in attachments:
                if attachment.message_id not in attachments_dict:
                    attachments_dict[attachment.message_id] = []
                    attachments_object_dict[attachment.message_id] = []

                attachments_dict[attachment.message_id].append(str(attachment.id))
                attachments_object_dict[attachment.message_id].append({
                    "id": str(attachment.id),
                    "filename": attachment.original_filename,
                    "file_type": attachment.file_type,
                    "file_size": attachment.file_size,
                    "preview_url": get_presigned_url_preview(attachment),
                    "download_url": get_presigned_url_download(attachment),
                })

        # Step 7: Format messages
        dialogue_list: List[Any] = []
        if messages:
            if not dialogue_object:
                for message in messages:
                    if message.user_type == UserTypeChoices.SYSTEM.value and not pi_internal:
                        continue
                    dialogue_list.append(message.content or "")
            else:
                i = 0
                while i < len(messages):
                    if (
                        i + 1 < len(messages)
                        and messages[i].user_type == UserTypeChoices.USER.value
                        and messages[i + 1].user_type == UserTypeChoices.ASSISTANT.value
                    ):
                        user_message = messages[i]
                        assistant_message = messages[i + 1]
                        feedback = ""
                        if assistant_message.message_feedbacks:
                            feedback = assistant_message.message_feedbacks[0].feedback or ""

                        # Extract execution status information for this user message
                        execution_status_info = extract_execution_status_from_flow_steps(message_flow_steps, user_message.id)

                        qa_pair: Dict[str, Any] = {
                            "query": user_message.content or "",
                            "answer": assistant_message.content or "",
                            "reasoning": assistant_message.reasoning or "",
                            "feedback": feedback,
                            "llm": assistant_message.llm_model or "",
                            "parsed_query": user_message.parsed_content or "",
                            "query_id": str(user_message.id),
                            "answer_id": str(assistant_message.id),
                            "attachment_ids": attachments_dict.get(user_message.id, []),
                            "attachments": attachments_object_dict.get(user_message.id, []),
                            # Add execution status information for frontend
                            "execution_status": execution_status_info,
                        }

                        # Add execution information at dialogue level (only if there are actions)
                        if execution_status_info.get("actions"):
                            qa_pair.update({
                                "action_summary": execution_status_info.get("action_summary", {}),
                                "actions": execution_status_info.get("actions", []),
                            })

                        if pi_internal:
                            # Generate internal reasoning for this specific assistant message
                            message_internal_reasoning = ""
                            # Filter flow steps for this specific message
                            message_specific_steps = [step for step in message_flow_steps if step.message_id == user_message.id]
                            # Sort flow steps by step_order to ensure proper sequence
                            message_specific_steps.sort(key=lambda x: x.step_order or 0)

                            if message_specific_steps:
                                # Generate reasoning for this message's flow steps
                                internal_reasoning_parts = []

                                # Extract information from flow steps for this message
                                original_query = user_message.content or ""
                                rewritten_query = ""
                                selected_agents_results: List[str] = []
                                agent_results: Dict[str, List[Any]] = {}

                                # Process flow steps to extract information
                                for message_flow_step in message_specific_steps:
                                    content = parse_flow_step_content(message_flow_step.content or "")
                                    step_type = message_flow_step.step_type
                                    tool_name = message_flow_step.tool_name

                                    if step_type == "rewrite" and isinstance(content, dict):
                                        rewritten_query = content.get("results", "") or content.get("rewritten_query", "")
                                    elif step_type == "routing":
                                        # Handle routing step - content could be a dict with a list or a string
                                        routing_data = None
                                        if isinstance(content, dict):
                                            # Check if content contains a list of routing results
                                            routing_data = content.get("results")
                                        elif isinstance(content, list):
                                            routing_data = content
                                        elif isinstance(content, str):
                                            routing_data = content

                                        if routing_data is not None:
                                            if isinstance(routing_data, list):
                                                # Content contains the list of selected agents
                                                routing_results = [
                                                    f"Selected Agent: {internal_reasoning_format_dict.get(d.get("tool", ""), d.get("tool", ""))} and the corresponding sub query: {d.get("query", "")}"  # noqa: E501
                                                    for d in routing_data
                                                    if isinstance(d, dict)
                                                ]
                                                selected_agents_results.extend(routing_results)
                                            elif isinstance(routing_data, str):
                                                selected_agents_results.append(routing_data)
                                            else:
                                                log.warning(f"Unexpected routing data type: {type(routing_data)}, routing_data: {routing_data}")

                                    elif step_type == "tool" and tool_name:
                                        # Collect agent results
                                        if tool_name not in agent_results:
                                            agent_results[tool_name] = []
                                        agent_results[tool_name].append(content)

                                        # Add execution status information using new fields
                                        if hasattr(message_flow_step, "execution_success") and hasattr(message_flow_step, "is_planned"):
                                            if message_flow_step.is_planned:
                                                # This is a planned action - show detailed execution status
                                                if message_flow_step.execution_success == ExecutionStatus.SUCCESS:
                                                    execution_status = "✅ SUCCESSFULLY EXECUTED"
                                                elif message_flow_step.execution_success == ExecutionStatus.FAILED:
                                                    execution_status = "❌ EXECUTION FAILED"
                                                    if message_flow_step.execution_error:
                                                        execution_status += f" - {message_flow_step.execution_error}"
                                                else:  # PENDING
                                                    execution_status = "⏳ PLANNED BUT NOT EXECUTED"

                                                execution_info = f"Action Status: {execution_status}"
                                            else:
                                                # This is a retrieval tool - show simpler status
                                                if message_flow_step.execution_success == ExecutionStatus.SUCCESS:
                                                    execution_status = "✅ AUTOMATICALLY EXECUTED"
                                                elif message_flow_step.execution_success == ExecutionStatus.FAILED:
                                                    execution_status = "❌ EXECUTION FAILED"
                                                    if message_flow_step.execution_error:
                                                        execution_status += f" - {message_flow_step.execution_error}"
                                                else:  # PENDING
                                                    execution_status = "⏳ PENDING"

                                                execution_info = f"Tool Status: {execution_status}"
                                        elif hasattr(message_flow_step, "is_executed"):
                                            # Fallback for old records without new fields
                                            execution_status = "EXECUTED" if message_flow_step.is_executed else "PLANNED BUT NOT EXECUTED"
                                            execution_info = f"Action Status: {execution_status}"
                                        else:
                                            execution_info = "Status: Unknown"

                                        # Add execution details if available
                                        if message_flow_step.is_executed and message_flow_step.execution_data:
                                            exec_data = message_flow_step.execution_data
                                            if exec_data.get("executed_at"):
                                                execution_info = f"{execution_info} (Executed at: {exec_data.get("executed_at")})"
                                            if exec_data.get("entity_info"):
                                                entity_info = exec_data.get("entity_info", {})
                                                if entity_info.get("id"):
                                                    execution_info = f"{execution_info} - Created/Updated Entity ID: {entity_info.get("id")}"

                                        # Add to internal reasoning
                                        internal_reasoning_parts.append(execution_info)

                                # Build the formatted reasoning string for this message (AFTER processing all flow steps)
                                if original_query:
                                    _, cleaned_query = parse_query(original_query)
                                    if rewritten_query and rewritten_query != cleaned_query:
                                        internal_reasoning_parts.append(f"User question: '{cleaned_query}' rewritten to '{rewritten_query}'.")
                                    else:
                                        internal_reasoning_parts.append(f"User question: '{cleaned_query}'")
                                    internal_reasoning_parts.append("")

                                if selected_agents_results:
                                    internal_reasoning_parts.append(
                                        "The below agents were selected to retrieve relevant information to address the query:"
                                    )
                                    internal_reasoning_parts.extend(selected_agents_results)
                                    internal_reasoning_parts.append("")

                                # Process each agent's results
                                for agent_name, agent_content_list in agent_results.items():
                                    for content in agent_content_list:
                                        if isinstance(content, dict):
                                            # Handle structured database agent specifically
                                            if agent_name == "PLANE_STRUCTURED_DATABASE_AGENT":
                                                # internal_reasoning_parts.append("Intermediate results")

                                                # SQL query and results
                                                intermediate_results = content.get("intermediate_results", {})
                                                if intermediate_results:
                                                    sql_query = intermediate_results.get("generated_sql", "")
                                                    if sql_query:
                                                        internal_reasoning_parts.append(f"SQL query generated: '{sql_query}'")

                                                    sql_results = content.get("results", "")
                                                    if sql_results:
                                                        internal_reasoning_parts.append(f"SQL execution results: '{sql_results}'")

                                                # Entity URLs
                                                entity_urls = content.get("entity_urls", [])
                                                if entity_urls:
                                                    internal_reasoning_parts.append("Entity URLs:")
                                                    for idx, url_dict in enumerate(entity_urls, 1):
                                                        internal_reasoning_parts.append(f"{idx}. url: {url_dict.get("url", "N/A")}")
                                                        internal_reasoning_parts.append(f"    id: {url_dict.get("id", "N/A")}")
                                                        internal_reasoning_parts.append(f"    item type: {url_dict.get("type", "N/A")}")
                                                        if url_dict.get("type") == "issue" and url_dict.get("issue_identifier"):
                                                            internal_reasoning_parts.append(
                                                                f"    issue unique key: {url_dict.get("issue_identifier")}"
                                                            )

                                            # Handle vector search agent
                                            elif agent_name == "PLANE_VECTOR_SEARCH_AGENT":
                                                results = content.get("results", "")
                                                if results:
                                                    internal_reasoning_parts.append("Semantic search results:")
                                                    internal_reasoning_parts.append(str(results))
                                                else:
                                                    internal_reasoning_parts.append("Semantic search results: No results found")

                                                # Entity URLs
                                                entity_urls = content.get("entity_urls", [])
                                                if entity_urls:
                                                    internal_reasoning_parts.append("Entity URLs:")
                                                    for idx, url_dict in enumerate(entity_urls, 1):
                                                        internal_reasoning_parts.append(f"{idx}. url: {url_dict.get("url", "N/A")}")
                                                        internal_reasoning_parts.append(f"    id: {url_dict.get("id", "N/A")}")
                                                        internal_reasoning_parts.append(f"    item type: {url_dict.get("type", "N/A")}")
                                                        if url_dict.get("type") == "issue" and url_dict.get("issue_identifier"):
                                                            internal_reasoning_parts.append(
                                                                f"    issue unique key: {url_dict.get("issue_identifier")}"
                                                            )
                                            # Handle pages search agent
                                            elif agent_name == "PLANE_PAGES_AGENT":
                                                results = content.get("results", "")
                                                if results:
                                                    internal_reasoning_parts.append("Pages search results:")
                                                    internal_reasoning_parts.append(str(results))
                                                else:
                                                    internal_reasoning_parts.append("Pages search results: No results found")

                                            # Generic handling for other agents
                                            else:
                                                results = content.get("results", "")
                                                if results:
                                                    internal_reasoning_parts.append("Results:")
                                                    internal_reasoning_parts.append(str(results))

                                        elif isinstance(content, str) and content:
                                            internal_reasoning_parts.append("Results:")
                                            internal_reasoning_parts.append(content)

                                    internal_reasoning_parts.append("")  # Add empty line between agents

                                # Join all internal reasoning parts into a single formatted string
                                message_internal_reasoning = "\n".join(internal_reasoning_parts)

                            qa_pair["internal_reasoning"] = message_internal_reasoning

                        dialogue_list.append(qa_pair)
                        i += 2
                    # NEW: Handle standalone USER messages (OAuth case)
                    elif messages[i].user_type == UserTypeChoices.USER.value:
                        user_message = messages[i]

                        # Check if OAuth is required for this message
                        oauth_required = any(step.oauth_required and step.message_id == user_message.id for step in message_flow_steps)

                        # Create QA pair with appropriate placeholder response
                        if oauth_required:
                            assistant_answer = "🔐 OAuth authorization required. Please complete authentication to continue."
                        else:
                            assistant_answer = "⏳ Processing your request..."

                        # Extract execution status information for this user message
                        execution_status_info = extract_execution_status_from_flow_steps(message_flow_steps, user_message.id)

                        standalone_qa_pair: Dict[str, Any] = {
                            "query": user_message.content or "",
                            "answer": assistant_answer,
                            "reasoning": "",
                            "feedback": "",
                            "llm": "",
                            "parsed_query": user_message.parsed_content or "",
                            "query_id": str(user_message.id),
                            "answer_id": "",  # No assistant message yet
                            "attachment_ids": attachments_dict.get(user_message.id, []),
                            # Add execution status information for frontend
                            "execution_status": execution_status_info,
                        }

                        if pi_internal:
                            # Generate internal reasoning for this standalone user message
                            standalone_message_internal_reasoning = ""
                            # Filter flow steps for this specific message
                            standalone_message_specific_steps = [step for step in message_flow_steps if step.message_id == user_message.id]
                            # Sort flow steps by step_order to ensure proper sequence
                            standalone_message_specific_steps.sort(key=lambda x: x.step_order or 0)

                            if standalone_message_specific_steps:
                                # Generate reasoning for this message's flow steps
                                standalone_internal_reasoning_parts = []

                                # Extract information from flow steps for this message
                                standalone_original_query = user_message.content or ""
                                standalone_rewritten_query = ""
                                standalone_selected_agents_results: List[str] = []
                                standalone_agent_results: Dict[str, List[Any]] = {}

                                # Process flow steps to extract information
                                for message_flow_step in standalone_message_specific_steps:
                                    content = parse_flow_step_content(message_flow_step.content or "")
                                    step_type = message_flow_step.step_type
                                    tool_name = message_flow_step.tool_name

                                    if step_type == "rewrite" and isinstance(content, dict):
                                        standalone_rewritten_query = content.get("results", "") or content.get("rewritten_query", "")
                                    elif step_type == "routing":
                                        # Handle routing step - content could be a dict with a list or a string
                                        routing_data = None
                                        if isinstance(content, dict):
                                            # Check if content contains a list of routing results
                                            routing_data = content.get("results")
                                        elif isinstance(content, list):
                                            routing_data = content
                                        elif isinstance(content, str):
                                            routing_data = content

                                        if routing_data is not None:
                                            if isinstance(routing_data, list):
                                                # Content contains the list of selected agents
                                                routing_results = [
                                                    f"Selected Agent: {internal_reasoning_format_dict.get(d.get("tool", ""), d.get("tool", ""))} and the corresponding sub query: {d.get("query", "")}"  # noqa: E501
                                                    for d in routing_data
                                                    if isinstance(d, dict)
                                                ]
                                                standalone_selected_agents_results.extend(routing_results)
                                            elif isinstance(routing_data, str):
                                                standalone_selected_agents_results.append(routing_data)
                                            else:
                                                log.warning(f"Unexpected routing data type: {type(routing_data)}, routing_data: {routing_data}")

                                    elif step_type == "tool" and tool_name:
                                        # Collect agent results
                                        if tool_name not in standalone_agent_results:
                                            standalone_agent_results[tool_name] = []
                                        standalone_agent_results[tool_name].append(content)

                                        # Add execution status information using new fields
                                        if hasattr(message_flow_step, "execution_success") and hasattr(message_flow_step, "is_planned"):
                                            if message_flow_step.is_planned:
                                                # This is a planned action - show detailed execution status
                                                if message_flow_step.execution_success == ExecutionStatus.SUCCESS:
                                                    execution_status = "✅ SUCCESSFULLY EXECUTED"
                                                elif message_flow_step.execution_success == ExecutionStatus.FAILED:
                                                    execution_status = "❌ EXECUTION FAILED"
                                                    if message_flow_step.execution_error:
                                                        execution_status += f" - {message_flow_step.execution_error}"
                                                else:  # PENDING
                                                    execution_status = "⏳ PLANNED BUT NOT EXECUTED"

                                                execution_info = f"Action Status: {execution_status}"
                                            else:
                                                # This is a retrieval tool - show simpler status
                                                if message_flow_step.execution_success == ExecutionStatus.SUCCESS:
                                                    execution_status = "✅ AUTOMATICALLY EXECUTED"
                                                elif message_flow_step.execution_success == ExecutionStatus.FAILED:
                                                    execution_status = "❌ EXECUTION FAILED"
                                                    if message_flow_step.execution_error:
                                                        execution_status += f" - {message_flow_step.execution_error}"
                                                else:  # PENDING
                                                    execution_status = "⏳ PENDING"

                                                execution_info = f"Tool Status: {execution_status}"
                                        elif hasattr(message_flow_step, "is_executed"):
                                            # Fallback for old records without new fields
                                            execution_status = "EXECUTED" if message_flow_step.is_executed else "PLANNED BUT NOT EXECUTED"
                                            execution_info = f"Action Status: {execution_status}"
                                        else:
                                            execution_info = "Status: Unknown"

                                        # Add execution details if available
                                        if message_flow_step.is_executed and message_flow_step.execution_data:
                                            exec_data = message_flow_step.execution_data
                                            if exec_data.get("executed_at"):
                                                execution_info = f"{execution_info} (Executed at: {exec_data.get("executed_at")})"
                                            if exec_data.get("entity_info"):
                                                entity_info = exec_data.get("entity_info", {})
                                                if entity_info.get("id"):
                                                    execution_info = f"{execution_info} - Created/Updated Entity ID: {entity_info.get("id")}"

                                        # Add to internal reasoning
                                        standalone_internal_reasoning_parts.append(execution_info)

                                # Build the formatted reasoning string for this message
                                if standalone_original_query:
                                    _, cleaned_query = parse_query(standalone_original_query)
                                    if standalone_rewritten_query and standalone_rewritten_query != cleaned_query:
                                        standalone_internal_reasoning_parts.append(
                                            f"User question: '{cleaned_query}' rewritten to '{standalone_rewritten_query}'."
                                        )
                                    else:
                                        standalone_internal_reasoning_parts.append(f"User question: '{cleaned_query}'")
                                    standalone_internal_reasoning_parts.append("")

                                if standalone_selected_agents_results:
                                    standalone_internal_reasoning_parts.append(
                                        "The below agents were selected to retrieve relevant information to address the query:"
                                    )
                                    standalone_internal_reasoning_parts.extend(standalone_selected_agents_results)
                                    standalone_internal_reasoning_parts.append("")

                                # Process each agent's results
                                for agent_name, agent_content_list in standalone_agent_results.items():
                                    for content in agent_content_list:
                                        if isinstance(content, dict):
                                            # Handle structured database agent specifically
                                            if agent_name == "PLANE_STRUCTURED_DATABASE_AGENT":
                                                # standalone_internal_reasoning_parts.append("Intermediate results")

                                                # SQL query and results
                                                intermediate_results = content.get("intermediate_results", {})
                                                if intermediate_results:
                                                    sql_query = intermediate_results.get("generated_sql", "")
                                                    if sql_query:
                                                        standalone_internal_reasoning_parts.append(f"SQL query generated: '{sql_query}'")

                                                    sql_results = content.get("results", "")
                                                    if sql_results:
                                                        standalone_internal_reasoning_parts.append(f"SQL execution results: '{sql_results}'")

                                                # Entity URLs
                                                entity_urls = content.get("entity_urls", [])
                                                if entity_urls:
                                                    standalone_internal_reasoning_parts.append("Entity URLs:")
                                                    for idx, url_dict in enumerate(entity_urls, 1):
                                                        standalone_internal_reasoning_parts.append(f"{idx}. url: {url_dict.get("url", "N/A")}")
                                                        standalone_internal_reasoning_parts.append(f"    id: {url_dict.get("id", "N/A")}")
                                                        standalone_internal_reasoning_parts.append(f"    item type: {url_dict.get("type", "N/A")}")
                                                        if url_dict.get("type") == "issue" and url_dict.get("issue_identifier"):
                                                            standalone_internal_reasoning_parts.append(
                                                                f"    issue unique key: {url_dict.get("issue_identifier")}"
                                                            )

                                            # Handle vector search agent
                                            elif agent_name == "PLANE_VECTOR_SEARCH_AGENT":
                                                results = content.get("results", "")
                                                if results:
                                                    standalone_internal_reasoning_parts.append("Semantic search results:")
                                                    standalone_internal_reasoning_parts.append(str(results))
                                                else:
                                                    standalone_internal_reasoning_parts.append("Semantic search results: No results found")

                                                # Entity URLs
                                                entity_urls = content.get("entity_urls", [])
                                                if entity_urls:
                                                    standalone_internal_reasoning_parts.append("Entity URLs:")
                                                    for idx, url_dict in enumerate(entity_urls, 1):
                                                        standalone_internal_reasoning_parts.append(f"{idx}. url: {url_dict.get("url", "N/A")}")
                                                        standalone_internal_reasoning_parts.append(f"    id: {url_dict.get("id", "N/A")}")
                                                        standalone_internal_reasoning_parts.append(f"    item type: {url_dict.get("type", "N/A")}")
                                                        if url_dict.get("type") == "issue" and url_dict.get("issue_identifier"):
                                                            standalone_internal_reasoning_parts.append(
                                                                f"    issue unique key: {url_dict.get("issue_identifier")}"
                                                            )
                                            # Handle pages search agent
                                            elif agent_name == "PLANE_PAGES_AGENT":
                                                results = content.get("results", "")
                                                if results:
                                                    standalone_internal_reasoning_parts.append("Pages search results:")
                                                    standalone_internal_reasoning_parts.append(str(results))
                                                else:
                                                    standalone_internal_reasoning_parts.append("Pages search results: No results found")

                                            # Generic handling for other agents
                                            else:
                                                results = content.get("results", "")
                                                if results:
                                                    standalone_internal_reasoning_parts.append("Results:")
                                                    standalone_internal_reasoning_parts.append(str(results))

                                        elif isinstance(content, str) and content:
                                            standalone_internal_reasoning_parts.append("Results:")
                                            standalone_internal_reasoning_parts.append(content)

                                    standalone_internal_reasoning_parts.append("")  # Add empty line between agents

                                # Join all internal reasoning parts into a single formatted string
                                standalone_message_internal_reasoning = "\n".join(standalone_internal_reasoning_parts)

                            standalone_qa_pair["internal_reasoning"] = standalone_message_internal_reasoning

                        dialogue_list.append(standalone_qa_pair)
                        i += 1
                    else:
                        i += 1

        return {
            "chat_id": str(chat_id),
            "title": chat.title or "",
            "dialogue": dialogue_list,
            "feedback": "",
            "reasoning": "",
            "llm": chat_llm,
            "is_focus_enabled": user_chat_preference.is_focus_enabled if user_chat_preference else False,
            "focus_project_id": str(user_chat_preference.focus_project_id)
            if user_chat_preference and user_chat_preference.focus_project_id
            else None,
            "focus_workspace_id": str(user_chat_preference.focus_workspace_id)
            if user_chat_preference and user_chat_preference.focus_workspace_id
            else None,
        }

    except Exception as e:
        log.error(f"Error retrieving chat history: {e}")
        return {
            "chat_id": str(chat_id),
            "title": "",
            "dialogue": [],
            "feedback": "",
            "reasoning": "",
            "llm": "",
            "is_focus_enabled": False,
            "focus_project_id": None,
            "focus_workspace_id": None,
        }


async def soft_delete_chat(chat_id: UUID4, db: AsyncSession) -> Tuple[int, Dict[str, str]]:
    """
    Soft deletes a chat by ID.
    Returns a tuple of (status_code, response_content)
    """
    try:
        # Get chat from database
        chat_query = select(Chat).where(Chat.id == chat_id)  # type: ignore[arg-type]
        chat_result = await db.execute(chat_query)
        chat = chat_result.scalar_one_or_none()

        if not chat:
            log.error(f"Chat not found for chat_id: {chat_id}")
            return 404, {"detail": "Chat not found"}

        # First soft delete all related messages
        messages_query = select(Message).where(Message.chat_id == chat_id)  # type: ignore[arg-type]
        messages_result = await db.execute(messages_query)
        messages = messages_result.scalars().all()

        for message in messages:
            message.soft_delete()

        # Then soft delete the chat
        chat.soft_delete()
        await db.commit()
        return 200, {"detail": "Chat deleted successfully"}
    except Exception as e:
        await db.rollback()
        log.error(f"Error deleting chat: {e}")
        return 500, {"detail": "Internal Server Error"}


async def upsert_chat(
    chat_id: UUID4,
    user_id: UUID4,
    db: AsyncSession,
    title: Optional[str] = None,
    description: Optional[str] = None,
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    is_project_chat: Optional[bool] = False,
    workspace_in_context: Optional[bool] = None,
) -> Dict[str, Any]:
    """
    Creates a new chat or updates an existing one.
    Returns a dictionary with operation status and the chat object or error details.
    """
    try:
        # Check if chat exists
        stmt = select(Chat).where(Chat.id == chat_id)  # type: ignore[arg-type]
        result = await db.execute(stmt)
        existing_chat = result.scalar_one_or_none()

        if existing_chat:
            # Update existing chat
            if title is not None:
                existing_chat.title = title
            if description is not None:
                existing_chat.description = description
            if workspace_slug is not None:
                existing_chat.workspace_slug = workspace_slug
            if is_project_chat is not None:
                existing_chat.is_project_chat = is_project_chat
            if workspace_in_context is not None:
                existing_chat.workspace_in_context = workspace_in_context
            # updated_at will be handled by SQLAlchemy
            db.add(existing_chat)
            await db.commit()
            return {"message": "success", "chat": existing_chat}
        else:
            # Create new chat
            chat_kwargs: Dict[str, Any] = {
                "id": chat_id,
                "user_id": user_id,
                "title": title,
                "description": description,
                "icon": {},
            }
            if is_project_chat is not None:
                chat_kwargs["is_project_chat"] = is_project_chat
            if workspace_id is not None:
                chat_kwargs["workspace_id"] = workspace_id
            if workspace_slug is not None:
                chat_kwargs["workspace_slug"] = workspace_slug
            if workspace_in_context is not None:
                chat_kwargs["workspace_in_context"] = workspace_in_context
            new_chat = Chat(**chat_kwargs)
            db.add(new_chat)
            await db.commit()
            return {"message": "success", "chat": new_chat}

    except Exception as e:
        await db.rollback()
        log.error(f"Database upsert_chat failed. chat_id: {str(chat_id)}, error: {str(e)}")
        return {"message": "error", "error": str(e)}


async def get_user_chat_threads(
    user_id: UUID4, db: AsyncSession, workspace_id: Optional[UUID4], is_project_chat: Optional[bool] = False, is_latest: Optional[bool] = False
) -> Union[List[Dict[str, Any]], Tuple[int, Dict[str, str]]]:
    """
    Retrieves all chat threads for a user.
    Returns either a list of chat threads (success) or a tuple of (status_code, response_content) for errors
    """
    try:
        chat_query = (
            select(Chat)
            .where(Chat.user_id == user_id)  # type: ignore[union-attr,arg-type]
            .where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .where(Chat.is_project_chat == is_project_chat)  # type: ignore[union-attr,arg-type]
        )

        if workspace_id is not None:
            chat_query = chat_query.where(Chat.workspace_id == workspace_id)  # type: ignore[union-attr,arg-type]

        chat_query = chat_query.order_by(desc(Chat.updated_at))  # type: ignore[union-attr,arg-type]

        if is_latest:
            chat_query = chat_query.where(~Chat.is_favorite).limit(15)  # type: ignore[union-attr,arg-type]

        chat_result = await db.execute(chat_query)
        chats = chat_result.scalars().all()

        # Get last messages for all chats using ORM window function
        chat_ids = [chat.id for chat in chats]
        if chat_ids:
            # Create a subquery with ROW_NUMBER() to get the latest message per chat
            latest_message_subquery = (
                select(  # type: ignore[call-overload]
                    Message.chat_id,  # type: ignore[arg-type]
                    Message.llm_model,  # type: ignore[arg-type]
                    func.row_number().over(partition_by=Message.chat_id, order_by=desc(Message.created_at)).label("rn"),  # type: ignore[arg-type]
                )
                .where(Message.chat_id.in_(chat_ids))  # type: ignore[union-attr,arg-type]
                .where(Message.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            ).subquery()

            # Get only the latest messages (rn = 1)
            latest_messages_query = select(latest_message_subquery.c.chat_id, latest_message_subquery.c.llm_model).where(
                latest_message_subquery.c.rn == 1
            )

            latest_messages_result = await db.execute(latest_messages_query)
            latest_messages = latest_messages_result.fetchall()

            # Create a lookup dictionary for O(1) access
            chat_to_llm = {str(msg.chat_id): msg.llm_model or "" for msg in latest_messages}
        else:
            chat_to_llm = {}

        results = []
        for chat in chats:
            llm = chat_to_llm.get(str(chat.id), "")

            # Format in the same structure as the old response
            chat_data = {
                "chat_id": str(chat.id),
                "title": chat.title or "No title",
                "last_modified": chat.updated_at.isoformat(),
                "llm": llm,
                "is_favorite": chat.is_favorite,
                "workspace_id": str(chat.workspace_id) if chat.workspace_id else None,
                "is_project_chat": chat.is_project_chat,
            }
            results.append(chat_data)

        return results
    except Exception as e:
        log.error(f"Error retrieving user threads: {e}")
        return 500, {"detail": "Internal Server Error"}


async def check_if_chat_exists(chat_id: UUID4, db: AsyncSession) -> bool:
    """
    Checks if a chat exists.
    Returns True if chat exists, False otherwise.
    """
    try:
        stmt = select(Chat).where(Chat.id == chat_id).where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()
        return chat is not None
    except Exception as e:
        log.error(f"Error checking if chat exists: {e}")
        return False


async def favorite_chat(chat_id: UUID4, db: AsyncSession) -> Tuple[int, Dict[str, str]]:
    """
    Favorites a chat by ID.
    Returns a tuple of (status_code, response_content)
    """
    try:
        stmt = select(Chat).where(Chat.id == chat_id).where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()
        if not chat:
            return 404, {"detail": "Chat not found"}
        chat.is_favorite = True
        db.add(chat)
        await db.commit()
        return 200, {"detail": "Chat favorited successfully"}
    except Exception as e:
        await db.rollback()
        log.error(f"Error favoriting chat: {e}")
        return 500, {"detail": "Internal Server Error"}


async def unfavorite_chat(chat_id: UUID4, db: AsyncSession) -> Tuple[int, Dict[str, str]]:
    """
    Unfavorites a chat by ID.
    Returns a tuple of (status_code, response_content)
    """
    try:
        stmt = select(Chat).where(Chat.id == chat_id).where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()
        if not chat:
            return 404, {"detail": "Chat not found"}
        chat.is_favorite = False
        db.add(chat)
        await db.commit()
        return 200, {"detail": "Chat unfavorited successfully"}
    except Exception as e:
        await db.rollback()
        log.error(f"Error unfavoriting chat: {e}")
        return 500, {"detail": "Internal Server Error"}


async def get_favorite_chats(
    user_id: UUID4, db: AsyncSession, workspace_id: Optional[UUID4] = None
) -> Tuple[int, Union[List[Dict[str, Any]], Dict[str, str]]]:
    """
    Retrieves all favorite chats for a user.
    Returns a tuple of (status_code, response_content)
    """
    try:
        stmt = (
            select(Chat)
            .where(Chat.user_id == user_id)  # type: ignore[union-attr,arg-type]
            .where(Chat.is_favorite)  # type: ignore[union-attr,arg-type]
            .where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .order_by(desc(Chat.updated_at))  # type: ignore[union-attr,arg-type]
        )

        if workspace_id is not None:
            stmt = stmt.where(Chat.workspace_id == workspace_id)  # type: ignore[union-attr,arg-type]

        result = await db.execute(stmt)
        chats = result.scalars().all()

        # Get last messages for all chats using ORM window function
        chat_ids = [chat.id for chat in chats]
        if chat_ids:
            # Create a subquery with ROW_NUMBER() to get the latest message per chat
            latest_message_subquery = (
                select(  # type: ignore[call-overload]
                    Message.chat_id,  # type: ignore[arg-type]
                    Message.llm_model,  # type: ignore[arg-type]
                    func.row_number().over(partition_by=Message.chat_id, order_by=desc(Message.created_at)).label("rn"),  # type: ignore[arg-type]
                )
                .where(Message.chat_id.in_(chat_ids))  # type: ignore[union-attr,arg-type]
                .where(Message.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            ).subquery()

            # Get only the latest messages (rn = 1)
            latest_messages_query = select(latest_message_subquery.c.chat_id, latest_message_subquery.c.llm_model).where(
                latest_message_subquery.c.rn == 1
            )

            latest_messages_result = await db.execute(latest_messages_query)
            latest_messages = latest_messages_result.fetchall()

            # Create a lookup dictionary for O(1) access
            chat_to_llm = {str(msg.chat_id): msg.llm_model or "" for msg in latest_messages}
        else:
            chat_to_llm = {}

        # Convert Chat objects to serializable dictionaries
        chat_list = []
        for chat in chats:
            llm = chat_to_llm.get(str(chat.id), "")

            chat_data = {
                "chat_id": str(chat.id),
                "title": chat.title or "No title",
                "last_modified": chat.updated_at.isoformat(),
                "llm": llm,
                "workspace_id": str(chat.workspace_id) if chat.workspace_id else None,
                "is_project_chat": chat.is_project_chat,
                "is_favorite": True,
            }
            chat_list.append(chat_data)

        return 200, chat_list
    except Exception as e:
        log.error(f"Error retrieving favorite chats: {e}")
        return 500, {"detail": "Internal Server Error"}


# New paginated functions
async def get_user_chat_threads_paginated(
    user_id: UUID4,
    db: AsyncSession,
    workspace_id: Optional[UUID4],
    is_project_chat: Optional[bool] = False,
    cursor: Optional[str] = None,
    per_page: int = 30,
) -> Union[Tuple[List[Dict[str, Any]], PaginationResponse], Tuple[int, Dict[str, str]]]:
    """
    Retrieves chat threads for a user with integer cursor-based pagination.
    Returns either a tuple of (results, pagination_response) or (status_code, error_response) for errors
    """
    try:
        # Build base query
        chat_query = (
            select(Chat)
            .where(Chat.user_id == user_id)  # type: ignore[union-attr,arg-type]
            .where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .where(Chat.is_project_chat == is_project_chat)  # type: ignore[union-attr,arg-type]
        )

        if workspace_id is not None:
            chat_query = chat_query.where(Chat.workspace_id == workspace_id)  # type: ignore[union-attr,arg-type]

        # Get total count for pagination metadata
        count_query = (
            select(func.count(Chat.id))  # type: ignore[union-attr,arg-type]
            .where(Chat.user_id == user_id)  # type: ignore[union-attr,arg-type]
            .where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .where(Chat.is_project_chat == is_project_chat)  # type: ignore[union-attr,arg-type]
        )

        if workspace_id is not None:
            count_query = count_query.where(Chat.workspace_id == workspace_id)  # type: ignore[union-attr,arg-type]

        count_result = await db.execute(count_query)
        total_results = count_result.scalar() or 0

        # Apply cursor-based pagination
        chat_query, cursor_info = apply_cursor_pagination(
            query=chat_query, cursor=cursor, per_page=per_page, order_by_field=Chat.updated_at, id_field=Chat.id, direction="desc"
        )

        chat_result = await db.execute(chat_query)
        chats = list(chat_result.scalars().all())

        # Check pagination bounds
        chats, has_next, has_prev = check_pagination_bounds(chats, cursor_info, total_results)

        # Get last messages for all chats using ORM window function
        chat_ids = [chat.id for chat in chats]
        if chat_ids:
            # Create a subquery with ROW_NUMBER() to get the latest message per chat
            latest_message_subquery = (
                select(  # type: ignore[call-overload]
                    Message.chat_id,  # type: ignore[arg-type]
                    Message.llm_model,  # type: ignore[arg-type]
                    func.row_number().over(partition_by=Message.chat_id, order_by=desc(Message.created_at)).label("rn"),  # type: ignore[arg-type]
                )
                .where(Message.chat_id.in_(chat_ids))  # type: ignore[union-attr,arg-type]
                .where(Message.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            ).subquery()

            # Get only the latest messages (rn = 1)
            latest_messages_query = select(latest_message_subquery.c.chat_id, latest_message_subquery.c.llm_model).where(
                latest_message_subquery.c.rn == 1
            )

            latest_messages_result = await db.execute(latest_messages_query)
            latest_messages = latest_messages_result.fetchall()

            # Create a lookup dictionary for O(1) access
            chat_to_llm = {str(msg.chat_id): msg.llm_model or "" for msg in latest_messages}
        else:
            chat_to_llm = {}

        # Format results
        results = []
        for chat in chats:
            llm = chat_to_llm.get(str(chat.id), "")

            # Format in the same structure as the old response
            chat_data = {
                "chat_id": str(chat.id),
                "title": chat.title or "No title",
                "last_modified": chat.updated_at.isoformat(),
                "llm": llm,
                "is_favorite": chat.is_favorite,
                "workspace_id": str(chat.workspace_id) if chat.workspace_id else None,
                "is_project_chat": chat.is_project_chat,
            }
            results.append(chat_data)

        # Create pagination response
        _, pagination_response = create_pagination_response(
            items=results, cursor_info=cursor_info, has_next=has_next, has_prev=has_prev, total_results=total_results
        )

        return results, pagination_response

    except Exception as e:
        log.error(f"Error retrieving user threads (paginated): {e}")
        return 500, {"detail": "Internal Server Error"}


async def rename_chat_title(chat_id: UUID4, new_title: str, db: AsyncSession) -> Tuple[int, Dict[str, str]]:
    """
    Renames a chat by ID.
    Returns a tuple of (status_code, response_content)
    """
    try:
        stmt = select(Chat).where(Chat.id == chat_id).where(Chat.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()
        if not chat:
            return 404, {"detail": "Chat not found"}
        chat.title = new_title
        db.add(chat)
        await db.commit()
        return 200, {"detail": "Chat renamed successfully"}
    except Exception as e:
        await db.rollback()
        log.error(f"Error renaming chat: {e}")
        return 500, {"detail": "Internal Server Error"}


async def upsert_user_chat_preference(
    user_id: UUID4,
    chat_id: UUID4,
    db: AsyncSession,
    is_focus_enabled: Optional[bool] = None,
    focus_project_id: Optional[UUID4] = None,
    focus_workspace_id: Optional[UUID4] = None,
) -> Dict[str, Any]:
    """
    Upserts a user chat preference.
    Returns a dictionary with operation status and the user chat preference object or error details.
    """
    try:
        stmt = select(UserChatPreference).where(UserChatPreference.user_id == user_id).where(UserChatPreference.chat_id == chat_id)  # type: ignore[union-attr,arg-type]
        result = await db.execute(stmt)
        existing_user_chat_preference = result.scalar_one_or_none()

        if existing_user_chat_preference:
            if is_focus_enabled is not None:
                existing_user_chat_preference.is_focus_enabled = is_focus_enabled
            if focus_project_id is not None:
                existing_user_chat_preference.focus_project_id = focus_project_id
            if focus_workspace_id is not None:
                existing_user_chat_preference.focus_workspace_id = focus_workspace_id
            db.add(existing_user_chat_preference)
            await db.commit()
            return {"message": "success", "user_chat_preference": existing_user_chat_preference}
        else:
            new_user_chat_preference_kwargs: Dict[str, Any] = {
                "user_id": user_id,
                "chat_id": chat_id,
            }
            if is_focus_enabled is not None:
                new_user_chat_preference_kwargs["is_focus_enabled"] = is_focus_enabled
            if focus_project_id is not None:
                new_user_chat_preference_kwargs["focus_project_id"] = focus_project_id
            if focus_workspace_id is not None:
                new_user_chat_preference_kwargs["focus_workspace_id"] = focus_workspace_id
            new_user_chat_preference = UserChatPreference(**new_user_chat_preference_kwargs)
            db.add(new_user_chat_preference)
            await db.commit()
            return {"message": "success", "user_chat_preference": new_user_chat_preference}
    except Exception as e:
        await db.rollback()
        log.error(f"Error upserting user chat preference: {e}")
        return {"message": "error", "error": str(e)}
