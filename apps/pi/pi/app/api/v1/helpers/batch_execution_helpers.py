"""
Helper functions for batch action execution in chat endpoints.
"""

import datetime
import logging
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi.app.models.enums import UserTypeChoices
from pi.app.models.message import Message
from pi.app.schemas.chat import ActionBatchExecutionRequest
from pi.app.schemas.chat import ArtifactData
from pi.services.chat.chat import PlaneChatBot
from pi.services.chat.helpers.batch_action_orchestrator import BatchActionOrchestrator
from pi.services.chat.helpers.batch_execution_context import BatchExecutionContext
from pi.services.chat.helpers.batch_execution_helpers import get_planned_actions_for_execution
from pi.services.retrievers.pg_store.action_artifact import get_action_artifacts_by_ids

log = logging.getLogger(__name__)


def _is_valid_uuid(uuid_string: str) -> bool:
    """Check if a string is a valid UUID format."""
    try:
        UUID(uuid_string)
        return True
    except (ValueError, TypeError):
        return False


def _extract_tool_args_from_artifact_data(artifact_data: dict, entity_type: str) -> dict:
    """
    Extract and format tool arguments from artifact data for execution.

    Handles different data formats:
    1. Direct tool_args (from planning phase)
    2. Nested parameters structure (from planning_data)
    3. Flattened parameters (from UI edits)
    """
    try:
        # First, try direct tool_args (most reliable)
        if "tool_args" in artifact_data:
            tool_args = artifact_data["tool_args"]
            if isinstance(tool_args, dict) and tool_args:
                return tool_args

        # Next, try planning_data.parameters structure
        if "planning_data" in artifact_data:
            planning_data = artifact_data["planning_data"]
            if isinstance(planning_data, dict):
                parameters = planning_data.get("parameters", {})
                if isinstance(parameters, dict):
                    # Check for nested entity structure
                    if entity_type in parameters:
                        entity_params = parameters[entity_type]
                        if isinstance(entity_params, dict):
                            # Flatten entity parameters and merge with other parameters
                            flattened = dict(entity_params)
                            # Add other non-entity parameters
                            for key, value in parameters.items():
                                if key != entity_type:
                                    flattened[key] = value
                            return flattened
                    else:
                        # Parameters are already flattened
                        return parameters

        # Fallback: return empty dict if no valid args found
        log.warning(f"No valid tool args found in artifact data for entity {entity_type}")
        return {}

    except Exception as e:
        log.error(f"Error extracting tool args from artifact data: {e}")
        return {}


async def validate_session_and_get_user(session: str) -> Optional[UUID]:
    """Validate session and return user ID if valid."""
    try:
        from pi.app.api.v1.dependencies import is_valid_session

        auth = await is_valid_session(session)
        if not auth.user:
            return None
        return auth.user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return None


async def prepare_execution_data(request: ActionBatchExecutionRequest, user_id: UUID, db: AsyncSession) -> Optional[dict]:
    """Prepare execution data and return error response if validation fails."""
    try:
        # **ARTIFACT-BASED EXECUTION**
        # Prefer explicit artifact_data from the client. If absent, fall back to executing
        # all planned artifacts for this message to maintain backward compatibility.
        artifact_items = request.artifact_data or []

        if not artifact_items:
            log.info("No artifact_data provided in request; attempting fallback to planned actions")
            planned_for_message = await get_planned_actions_for_execution(request.message_id, request.chat_id, db)
            if not planned_for_message:
                log.error("No artifact_data provided and no planned actions found")
                return None

            # Build a default list of artifacts to execute (all planned, unedited)
            tmp_items: list[ArtifactData] = []
            for pa in planned_for_message:
                aid = pa.get("artifact_id")
                if not aid:
                    continue
                try:
                    tmp_items.append(ArtifactData(artifact_id=UUID(aid), is_edited=False))
                except Exception as e:
                    log.error(f"Invalid artifact_id in planned actions: {aid}: {e}")

            if not tmp_items:
                log.error("No valid artifact IDs found in planned actions for fallback execution")
                return None

            artifact_items = tmp_items

        log.info(f"Processing artifacts: {len(artifact_items)} artifacts")

        planned_actions: List[Dict[str, Any]] = []

        for artifact_item in artifact_items:
            log.info(f"Processing artifact: {artifact_item.artifact_id} (is_edited: {artifact_item.is_edited})")

            # Get artifact metadata
            artifacts = await get_action_artifacts_by_ids(db, [artifact_item.artifact_id])
            if not artifacts:
                log.error(f"Artifact {artifact_item.artifact_id} not found")
                continue

            artifact = artifacts[0]
            entity_type = artifact.entity
            entity_id = artifact.entity_id
            original_action = artifact.action

            if artifact_item.is_edited:
                # **EDITED ARTIFACT** - Create ActionArtifactVersion and use its UUID

                if not artifact_item.action_data:
                    log.error(f"Artifact {artifact_item.artifact_id} marked as edited but no action_data provided")
                    continue

                # For edited artifacts, use the provided action_data directly
                tool_args = artifact_item.action_data.copy()

                # Resolve project_id to full project object for UI display
                try:
                    from pi.services.actions.artifacts.utils import resolve_project_id_to_object

                    tool_args = await resolve_project_id_to_object(tool_args)
                    log.info(f"Resolved project data for artifact {artifact_item.artifact_id}")
                except Exception as e:
                    log.error(f"Error resolving project_id for artifact {artifact_item.artifact_id}: {e}")

                # Create ActionArtifactVersion and use its UUID as step_id
                try:
                    from pi.services.actions.artifacts.utils import convert_uuids_to_strings
                    from pi.services.retrievers.pg_store.action_artifact import create_action_artifact_version

                    # Ensure all UUID objects are converted to strings for JSON serialization
                    serializable_tool_args = convert_uuids_to_strings(tool_args)

                    version = await create_action_artifact_version(
                        db=db,
                        artifact_id=artifact_item.artifact_id,
                        data=serializable_tool_args,  # Use UUID-safe tool_args
                        change_type="manual_edit",
                        chat_id=request.chat_id,
                        message_id=request.message_id,
                        user_id=str(user_id),
                    )

                    if version:
                        step_id = str(version.id)  # Use ActionArtifactVersion UUID as step_id
                        version_id = str(version.id)
                        log.info(f"Created ActionArtifactVersion {version.id} for edited artifact {artifact_item.artifact_id}")
                    else:
                        log.error(f"Failed to create ActionArtifactVersion for artifact {artifact_item.artifact_id}")
                        continue

                except Exception as e:
                    log.error(f"Error creating ActionArtifactVersion for artifact {artifact_item.artifact_id}: {e}")
                    continue

                log.info(f"Using edited artifact data for artifact {artifact_item.artifact_id}")

            else:
                # **NORMAL ARTIFACT** - Get the MessageFlowStep UUID
                # Find the flow step for this artifact to get its UUID
                planned_actions_for_artifact = await get_planned_actions_for_execution(request.message_id, request.chat_id, db)

                # Find the planned action for this specific artifact
                planned_action = None
                for pa in planned_actions_for_artifact:
                    if pa.get("artifact_id") == str(artifact_item.artifact_id):
                        planned_action = pa
                        break

                if not planned_action:
                    log.error(f"No planned action found for artifact {artifact_item.artifact_id}")
                    continue

                # Use the flow step UUID as step_id
                step_id_raw = planned_action.get("step_id")
                if not step_id_raw or not _is_valid_uuid(str(step_id_raw)):
                    log.error(f"Invalid or missing step_id for artifact {artifact_item.artifact_id}: {step_id_raw}")
                    continue

                step_id = str(step_id_raw)

                # Get tool args from the planned action
                tool_args = planned_action.get("args", {})
                if not tool_args:
                    log.error(f"No tool args found for artifact {artifact_item.artifact_id}")
                    continue

                version_id = None  # Normal artifacts don't have versions
                log.info(f"Using normal artifact data for artifact {artifact_item.artifact_id} with step_id {step_id}")

            # Build tool name and args
            tool_name = f"{entity_type}s_{original_action}"

            # Validate and clean tool args
            if not tool_args:
                log.error(f"No tool args found for artifact {artifact_item.artifact_id}, entity: {entity_type}, action: {original_action}")
                continue

            args = {
                **tool_args,
                # Only add entity ID for update/delete actions
                **(
                    {f"{entity_type}_id" if entity_type != "workitem" else "issue_id": str(entity_id)}
                    if original_action in ["update", "delete"] and entity_id
                    else {}
                ),
            }

            # Log the final args for debugging
            log.info(f"Tool args for {tool_name}: {list(args.keys())}")

            # Add to planned actions
            planned_action_item = {
                "step_id": step_id,  # Now always a proper UUID
                "step_order": len(planned_actions) + 1,
                "tool_name": tool_name,
                "args": args,
                "action_summary": {"action": original_action, "entity": entity_type},
                "tool_id": None,
                "artifact_id": str(artifact_item.artifact_id),
                "artifact_type": entity_type,  # Add artifact type for response formatting
                "sequence": len(planned_actions) + 1,
            }

            # Add version_id for edited artifacts
            if artifact_item.is_edited and version_id:
                planned_action_item["version_id"] = version_id
                planned_action_item["is_edited"] = True

            planned_actions.append(planned_action_item)

            edit_type = "edited" if artifact_item.is_edited else "normal"
            log.info(f"Added {tool_name} for artifact {artifact_item.artifact_id} ({edit_type})")

        if not planned_actions:
            log.error("No valid artifacts found")
            return None

        # Create appropriate query message based on artifact types
        normal_count = sum(1 for action in planned_actions if not action.get("is_edited", False))
        edited_count = sum(1 for action in planned_actions if action.get("is_edited", False))

        if normal_count > 0 and edited_count > 0:
            original_query = f"Mixed execution: {normal_count} normal + {edited_count} edited artifacts"
        elif edited_count > 0:
            original_query = f"Execute {edited_count} edited artifacts"
        else:
            original_query = f"Execute {normal_count} artifacts"

        # Get OAuth token for the user
        chatbot = PlaneChatBot()
        access_token = await chatbot._get_oauth_token_for_user(db, str(user_id), str(request.workspace_id))

        if not access_token:
            log.error(f"No valid OAuth token found for user {user_id} and workspace {request.workspace_id}")
            return None

        # Get workspace context
        from pi.app.api.v1.helpers.plane_sql_queries import get_workspace_slug

        workspace_slug = await get_workspace_slug(str(request.workspace_id))

        if not workspace_slug:
            return None

        # Get is_project_chat from chat record (with explicit commit/refresh to avoid race condition)
        from sqlalchemy import select

        from pi.app.models.chat import Chat

        # Refresh the session to ensure we see any committed chat records
        await db.commit()

        stmt = select(Chat).where(Chat.id == request.chat_id)  # type: ignore[arg-type]
        result = await db.execute(stmt)
        chat = result.scalar_one_or_none()
        is_project_chat = chat.is_project_chat if chat else False

        log.info(f"🔧 EXECUTION DATA PREP: chat_id={request.chat_id}, is_project_chat from DB (after commit)={is_project_chat}")

        # Return successful execution data
        return {
            "planned_actions": planned_actions,
            "original_query": original_query,
            "access_token": access_token,
            "workspace_slug": workspace_slug,
            "user_id": user_id,
            "workspace_id": request.workspace_id,
            "message_id": request.message_id,
            "chat_id": request.chat_id,
            "is_project_chat": is_project_chat,
        }
    except Exception as e:
        log.error(f"Error preparing execution data: {e}")
        return None


async def execute_batch_actions(execution_data: dict, db: AsyncSession) -> BatchExecutionContext:
    """Execute batch actions using the orchestrator."""
    try:
        # Create execution context
        context = BatchExecutionContext(
            message_id=execution_data["message_id"],
            chat_id=execution_data["chat_id"],
            user_id=execution_data["user_id"],
            workspace_id=execution_data["workspace_id"],
            is_project_chat=execution_data.get("is_project_chat", False),
        )

        # Create orchestrator and execute batch
        chatbot = PlaneChatBot()
        orchestrator = BatchActionOrchestrator(chatbot, db)

        context = await orchestrator.execute_planned_actions(
            context,
            execution_data["original_query"],
            execution_data["planned_actions"],
            execution_data["access_token"],
            execution_data["workspace_slug"],
        )

        return context

    except Exception as e:
        log.error(f"Error executing batch actions: {e}")
        # Create a failed context to return
        context = BatchExecutionContext(
            message_id=execution_data["message_id"],
            chat_id=execution_data["chat_id"],
            user_id=execution_data["user_id"],
            workspace_id=execution_data["workspace_id"],
            is_project_chat=execution_data.get("is_project_chat", False),
        )
        context.add_execution_failure("system", "execution_error", str(e))
        return context


async def update_assistant_message_with_execution_results(message_id: UUID, chat_id: UUID, context: BatchExecutionContext, db: AsyncSession) -> None:
    """Update the assistant message with execution results."""
    try:
        # Get the assistant message that relates to this user message
        # The assistant message should have the user message as its parent_id
        filters = [Message.parent_id == message_id, Message.chat_id == chat_id, Message.user_type == UserTypeChoices.ASSISTANT.value]
        stmt = select(Message).where(*filters)  # type: ignore[arg-type]
        result = await db.execute(stmt)
        message = result.scalar_one_or_none()

        if not message:
            log.error(f"Assistant message for user message ID {message_id} not found")
            return

        # Frontend now gets execution details via structured data in chat history
        # No longer appending execution results to assistant message content

    except Exception as e:
        log.error(f"Error updating assistant message with execution results: {e}")
        if db:
            await db.rollback()


def format_execution_response(context: BatchExecutionContext) -> Dict[str, Any]:
    """Format the execution response with clean, non-redundant structure."""
    try:
        # Base response structure
        response: Dict[str, Any] = {
            "action_summary": {
                "total_planned": context.total_planned,
                "completed": context.completed_count,
                "failed": context.failed_count,
                "duration_seconds": round((datetime.datetime.utcnow() - context.start_time).total_seconds(), 2),
            },
        }

        # Add actions with consolidated entity information
        if context.executed_actions:
            response["actions"] = create_clean_actions_response(context.executed_actions)

        return response

    except Exception as e:
        log.error(f"Error formatting execution response: {e}")
        return {"action_summary": {"total_planned": 0, "completed": 0, "failed": 0, "duration_seconds": 0.0}, "actions": []}


def create_clean_actions_response(executed_actions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Create clean action results without duplicate entity information."""
    clean_actions = []

    for action in executed_actions:
        # Extract action from tool name (e.g., "workitems_create" -> "create")
        tool_name = action.get("tool_name", "")
        action_name = "unknown"
        if tool_name and "_" in tool_name:
            action_name = tool_name.split("_", 1)[1]  # Get everything after the first underscore
        elif tool_name:
            action_name = tool_name

        action_data = {
            "action": action_name,
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


def get_status_message(context: BatchExecutionContext) -> str:
    """Generate a user-friendly status message."""
    if context.status == "success":
        return f"Successfully executed {context.completed_count} actions"
    elif context.status == "partial":
        return f"Partial success: {context.completed_count} actions completed, {context.failed_count} failed"
    else:
        return f"Batch execution failed: {context.failed_count} actions failed"
