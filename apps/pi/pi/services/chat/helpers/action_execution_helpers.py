"""Helper functions for batch action execution."""

import json
from datetime import datetime
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple
from uuid import UUID

from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models.message import Message
from pi.app.models.message import MessageFlowStep
from pi.app.schemas.chat import ArtifactData
from pi.services.chat.helpers.build_mode_helpers import TOOL_NAME_TO_CATEGORY_MAP
from pi.services.chat.helpers.tool_utils import classify_tool
from pi.services.chat.prompts import plane_context
from pi.services.retrievers.pg_store.action_artifact import get_action_artifacts_by_ids

log = logger.getChild(__name__)


async def load_artifacts(request_data: List[ArtifactData], db: AsyncSession) -> Tuple[List[Dict], str, str]:
    """Load and validate artifacts for execution."""
    artifacts = await get_action_artifacts_by_ids(db, [a.artifact_id for a in request_data])

    original_query = artifacts[0].data.get("planning_context", {}).get("original_query", "")
    conversation_context = artifacts[0].data.get("planning_context", {}).get("conversation_context", {})

    planned_actions = []
    for artifact, req_item in zip(artifacts, request_data):
        if req_item.is_edited:
            tool_args = req_item.action_data
            # TODO: validate tool args
        else:
            tool_args = artifact.data.get("tool_args_raw", {})
        planned_actions.append({
            "artifact_id": str(artifact.id),
            "tool_name": artifact.data.get("planning_data", {}).get("tool_name", ""),
            "args": tool_args,
            "entity_type": artifact.data.get("planning_data", {}).get("artifact_type", ""),
            "action": artifact.data.get("planning_data", {}).get("action", ""),
        })

    return planned_actions, original_query, conversation_context


async def update_flow_steps(results, message_id, chat_id, db: AsyncSession):
    """Mark executed actions in database."""
    from pi.services.retrievers.pg_store.action_artifact import update_action_artifact_execution_status

    for r in results:
        artifact_id = r.get("artifact_id")
        if artifact_id:
            artifact_uuid = UUID(artifact_id)

            # Extract entity_id from entity_info if available
            entity_info = r.get("entity_info")
            entity_id = None
            if entity_info and isinstance(entity_info, dict):
                # Try to get entity_id from entity_info
                entity_id_str = entity_info.get("entity_id")
                if entity_id_str:
                    try:
                        entity_id = UUID(entity_id_str)
                    except (ValueError, TypeError):
                        log.warning(f"Invalid entity_id format in entity_info: {entity_id_str}")

            # Update ActionArtifact and MessageFlowStep execution status
            await update_action_artifact_execution_status(
                db=db,
                message_id=message_id,
                chat_id=chat_id,
                artifact_id=artifact_uuid,
                is_executed=True,
                success=r.get("success", False),
                entity_id=entity_id,
                entity_info=entity_info,
                execution_result=r.get("result", ""),
                executed_at=r.get("executed_at"),
            )


def format_response(planned_actions, results, start_time) -> Dict[str, Any]:
    """Format the execution response with clean, non-redundant structure."""
    log.info(f"\n\nResults in format_response: {results}\n")
    try:
        total_planned = len(planned_actions)
        completed_count = sum(1 for r in results if r.get("success"))
        failed_count = sum(1 for r in results if r.get("success") is False)
        response: Dict[str, Any] = {
            "action_summary": {
                "total_planned": total_planned,
                "completed": completed_count,
                "failed": failed_count,
                "duration_seconds": round((datetime.utcnow() - start_time).total_seconds(), 2),
            },
        }

        if results:
            response["actions"] = create_clean_actions_response(results)

        log.info(f"\n\nRESPONSE: {response}\n\n")

        return response

    except Exception as e:
        log.error(f"Error formatting execution response: {e}")
        return {
            "action_summary": {
                "total_planned": len(planned_actions),
                "completed": 0,
                "failed": len(planned_actions),
                "duration_seconds": round((datetime.utcnow() - start_time).total_seconds(), 2),
            },
            "actions": [],
        }


async def get_planned_actions_for_execution(message_id: UUID, chat_id: UUID, db: AsyncSession) -> List[Dict[str, Any]]:
    """Retrieve all planned actions for a message that are ready for execution."""
    try:
        # Get flow steps with planned actions - filter for TOOL steps that are planned
        stmt = (
            select(MessageFlowStep)
            .where(MessageFlowStep.message_id == message_id)  # type: ignore[arg-type]
            .where(MessageFlowStep.chat_id == chat_id)  # type: ignore[arg-type]
            .where(MessageFlowStep.is_planned == True)  # type: ignore[arg-type] # noqa: E712
            .where(MessageFlowStep.is_executed == False)  # type: ignore[arg-type] # noqa: E712
            .order_by(MessageFlowStep.step_order)  # type: ignore[arg-type]
        )
        result = await db.execute(stmt)
        flow_steps = result.scalars().all()

        planned_actions = []
        for step in flow_steps:
            execution_data = step.execution_data or {}

            planned_action = {
                "step_id": str(step.id),
                "step_order": step.step_order,
                "tool_name": step.tool_name,
                "args": execution_data.get("args", {}),
                "action_summary": execution_data.get("action_summary", {}),
                "tool_id": execution_data.get("tool_id"),
                "artifact_id": execution_data.get("artifact_id"),  # NEW: Include artifact ID
                "sequence": step.step_order,  # NEW: Include planned sequence to propagate
            }
            planned_actions.append(planned_action)

        return planned_actions

    except Exception as e:
        log.error(f"Error retrieving planned actions: {e}")
        return []


async def get_original_user_query(message_id: UUID, db: AsyncSession) -> Optional[str]:
    """Get the original user query for the message."""
    try:
        stmt = select(Message).where(Message.id == message_id)  # type: ignore[arg-type]
        result = await db.execute(stmt)
        message = result.scalar_one_or_none()

        if message:
            return message.content
        else:
            log.warning(f"Message {message_id} not found")
            return None

    except Exception as e:
        log.error(f"Error retrieving original user query: {e}")
        return None


def build_execution_prompt(original_query: str, planned_actions: List[Dict[str, Any]], conversation_context: Dict[str, Any]) -> str:
    """Build the execution prompt for the LLM."""

    # Format planned actions for the prompt
    actions_text = ""
    tool_categories = set()
    for i, action in enumerate(planned_actions, 1):
        action_summary = action.get("action_summary", {})
        tool_name = action.get("tool_name", "")
        args = action.get("args", {})
        entity_type = action.get("entity_type", "")
        if entity_type:
            tool_categories.add(entity_type)

        # Create a readable description of the action
        action_desc = action_summary.get("action", tool_name)
        action_summary.get("details", "")

        actions_text += f"{i}. {action_desc}\n"
        actions_text += f"   Tool: {tool_name}\n"
        actions_text += f"   Arguments: {json.dumps(args, indent=4)}\n\n"

    # Format conversation context for the prompt
    conversation_context_text = ""
    for key, value in conversation_context.items():
        conversation_context_text += f"{key}: {value}\n"

    execution_prompt = f"""You are an API tool calling agent for Plane. You are executing approved actions for this user request: "{original_query}"

context about Plane:
{plane_context}

PLANNED ACTIONS (approved by user):
{actions_text}

EXECUTION MODE: You must now EXECUTE these actions in the correct order using the available tools.

EXECUTION GUIDELINES:
- Execute each planned action exactly once using the provided tool and arguments
- Use outputs from earlier actions as inputs to later actions when needed
- If an action creates an entity (like an issue, cycle, etc.), use the returned ID in subsequent actions that need it
- Execute actions in logical dependency order (e.g., create issue first, then add to cycle)
- If an action fails, stop execution and report the specific error
- Provide clear status updates after each successful action

**CRITICAL: PLACEHOLDER HANDLING**
- Some arguments may contain placeholders that need to be resolved
- You should use the UUIDs, names, identifiers, etc. from the results returned by the previous actions to resolve the placeholders for the next action.
- Careful with the placeholder types. Use the tool description to determine the type of the placeholder, and then determine whether to use the UUID, name, identifier, etc.

Entity Search Tools:
In addition to the modifying tools provided to you, you also have access to entity search tools (search_project_by_identifier, search_user_by_name, etc.). Use them ONLY if:
1. An argument is completely MISSING (e.g., no project_id at all)
2. An argument contains an EXPLICIT placeholder like: "<id of project: ProjectName>"
3. An argument has a non-UUID value that needs resolution (e.g., project_id="PROJ")

CRITICAL: You must use the EXACT tool names provided above. Do not modify, shorten, or change the tool names in any way.
EXAMPLE: If the planned action shows tool_name: "workitems_create", you must call "workitems_create" exactly, not "create_workitem" or "workitem_create".

IMPORTANT: Start executing the actions now. Use the exact tool names and arguments provided in the planned actions above."""  # noqa: E501

    return execution_prompt


def has_placeholders(tool_args: Dict[str, Any]) -> bool:
    """Check if tool arguments contain placeholders or non-UUID *_id values that need resolution."""
    import re

    # Regex for matching standard UUIDs - fixed pattern to handle UUIDs properly
    uuid_regex = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
    # Include both "workitem" and "issue" as aliases for the same entity
    entity_keys = {"module", "workitem", "issue", "project", "cycle", "label", "state", "user", "assignee"}

    for key, value in tool_args.items():
        # Special-case: workspace scope sentinel should NOT trigger resolution
        if key == "project_id" and isinstance(value, str) and value == "__workspace_scope__":
            continue
        # 1) Explicit placeholder syntax
        if isinstance(value, str) and "<id of" in value:
            return True

        # 2) Non-UUID string passed to an *_id field for known entities
        if isinstance(value, str) and (key.endswith("_id") or key.endswith("_ids")):
            # Handle both _id and _ids
            if key.endswith("_ids"):
                entity_type = key[:-4]  # remove _ids
            else:
                entity_type = key[:-3]  # remove _id

            # Treat issue_id as workitem for resolution purposes
            if entity_type == "issue":
                entity_type = "workitem"

            # For single value, check if it matches UUID
            if entity_type in entity_keys:
                is_uuid = uuid_regex.match(value)
                if not is_uuid:
                    return True

        # 3) List of placeholders or non-UUID id values for known entities
        if isinstance(value, list):
            for item in value:
                # Skip sentinel in lists as well (defensive)
                if key == "project_id" and isinstance(item, str) and item == "__workspace_scope__":
                    continue

                if isinstance(item, str):
                    if "<id of" in item:
                        return True

                    # Check for non-UUIDs in _id or _ids fields
                    if key.endswith("_id") or key.endswith("_ids"):
                        if key.endswith("_ids"):
                            entity_type = key[:-4]
                        else:
                            entity_type = key[:-3]

                        if entity_type == "issue":
                            entity_type = "workitem"

                        if entity_type in entity_keys and not uuid_regex.match(item):
                            return True

    return False


def create_clean_actions_response(executed_actions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create clean action results without duplicate entity information.

    Filters out retrieval/search tools and only includes actual modifying actions.
    """

    clean_actions = []

    log.info(f"\n\nEXECUTED ACTIONS in create_clean_actions_response: {executed_actions}\n\n")

    for action in executed_actions:
        # Extract action from tool name (e.g., "workitems_create" -> "create")
        tool_name = action.get("tool_name", "")

        # Filter out retrieval tools - only show actual actions to frontend
        if tool_name:
            is_retrieval, is_action = classify_tool(tool_name)
            if is_retrieval and not is_action:
                log.debug(f"Filtering out retrieval tool from actions response: {tool_name}")
                continue

        action_type = TOOL_NAME_TO_CATEGORY_MAP.get(tool_name, {}).get("action_type", "")

        action_data = {
            "action": action_type,
            "artifact_type": action.get("artifact_type"),
            "success": action.get("success"),
            "executed_at": action.get("executed_at"),
            "artifact_id": action.get("artifact_id"),  # NEW: Include artifact ID
            "sequence": action.get("sequence"),  # NEW: Include planned step order
            "version_number": action.get("version_number"),  # NEW: Include version sequence number
        }

        if action.get("success"):
            # For successful actions, include essential entity info
            entity_info = action.get("entity_info")
            if entity_info and isinstance(entity_info, dict):
                # Only include the most important entity fields
                essential_entity = {}
                for field in ["entity_url", "entity_name", "entity_type", "entity_id"]:
                    if field in entity_info and entity_info[field]:
                        essential_entity[field] = entity_info[field]

                # Include issue_identifier when available (for work-items)
                if entity_info.get("issue_identifier"):
                    essential_entity["issue_identifier"] = entity_info["issue_identifier"]

                if essential_entity:
                    action_data["entity"] = essential_entity

                # Add project_identifier at the action root when derivable
                project_identifier = None
                try:
                    # Prefer deriving from identifiers present in entity_info
                    if entity_info.get("entity_type") == "project":
                        project_identifier = entity_info.get("entity_identifier") or entity_info.get("project_identifier")
                    elif entity_info.get("issue_identifier") and isinstance(entity_info.get("issue_identifier"), str):
                        ident = entity_info.get("issue_identifier")
                        if "-" in ident:
                            project_identifier = ident.split("-", 1)[0]
                    elif entity_info.get("entity_url") and isinstance(entity_info.get("entity_url"), str):
                        url = entity_info.get("entity_url")
                        # Attempt to parse /browse/PROJECT-SEQ/ pattern
                        if "/browse/" in url:
                            after = url.split("/browse/", 1)[1]
                            ident = after.split("/", 1)[0]
                            if "-" in ident:
                                project_identifier = ident.split("-", 1)[0]
                except Exception:
                    project_identifier = None

                if project_identifier:
                    action_data["project_identifier"] = project_identifier

            # Extract the nice success message from the result
            result = action.get("result", "")
            if result:
                # Extract the nice message that comes after "✅ " and before "\n\n"
                nice_message = extract_success_message(result)
                if nice_message:
                    action_data["message"] = nice_message
                else:
                    # Fallback to generic messages
                    if "created" in result.lower():
                        action_data["message"] = "Created successfully"
                    elif "updated" in result.lower():
                        action_data["message"] = "Updated successfully"
                    else:
                        action_data["message"] = "Action completed successfully"
        else:
            # For failed actions, include error message
            error = action.get("error", "")
            if error:
                action_data["error"] = error[:200] + "..." if len(error) > 200 else error

        clean_actions.append(action_data)

    return clean_actions


def extract_success_message(result: str) -> str:
    """Extract the nice success message from the tool result."""
    if not result or not isinstance(result, str):
        return ""

    # Look for the pattern: "✅ [message]\n\n"
    if "✅" in result:
        lines = result.split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("✅"):
                # Remove the "✅ " prefix and return the message
                message = line[2:].strip()  # Remove "✅ " (2 characters)
                return message

    return ""
