"""Helper functions for batch action execution."""

import datetime
import json
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models.enums import ExecutionStatus
from pi.app.models.message import Message
from pi.app.models.message import MessageFlowStep
from pi.services.retrievers.pg_store.json_serializer import sanitize_execution_data

log = logger.getChild(__name__)


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


def build_execution_prompt(original_query: str, planned_actions: List[Dict[str, Any]]) -> str:
    """Build the execution prompt for the LLM."""

    # Format planned actions for the prompt
    actions_text = ""
    for i, action in enumerate(planned_actions, 1):
        action_summary = action.get("action_summary", {})
        tool_name = action.get("tool_name", "")
        args = action.get("args", {})

        # Create a readable description of the action
        action_desc = action_summary.get("action", tool_name)
        details = action_summary.get("details", "")
        if details:
            action_desc += f" - {details}"

        actions_text += f"{i}. {action_desc}\n"
        actions_text += f"   Tool: {tool_name}\n"
        actions_text += f"   Arguments: {json.dumps(args, indent=4)}\n\n"

    execution_prompt = f"""You are executing approved actions for this user request: "{original_query}"

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
- The system will automatically resolve these placeholders before tool execution
- You should execute the tools with the arguments as provided in the planned actions
- Do not attempt to manually resolve or modify the arguments

CRITICAL: You must use the EXACT tool names provided above. Do not modify, shorten, or change the tool names in any way.

AVAILABLE TOOLS: You have access to the following tool categories: {", ".join(set(action.get("tool_name", "").split("_")[0] for action in planned_actions if action.get("tool_name") and isinstance(action.get("tool_name"), str) and "_" in action.get("tool_name", "")))}

EXAMPLE: If the planned action shows tool_name: "workitems_create", you must call "workitems_create" exactly, not "create_workitem" or "workitem_create".

IMPORTANT: Start executing the actions now. Use the exact tool names and arguments provided in the planned actions above."""  # noqa: E501

    return execution_prompt


def extract_entity_info(result: str, tool_name: str) -> Optional[Dict[str, Any] | List[Dict[str, Any]]]:
    """Extract entity information from tool execution result.

    Returns either a single entity_info dict or a list of entity_info dicts for bulk operations.
    """
    try:
        result_str = str(result)
        entity_info = {}

        # Method 1: Check if the result is already structured JSON containing entity information
        try:
            if result_str.startswith("{") and result_str.endswith("}"):
                result_json = json.loads(result_str)
                if isinstance(result_json, dict) and "entity" in result_json:
                    # Extract entity information from structured response
                    entity_data = result_json["entity"]
                    if isinstance(entity_data, dict):
                        return entity_data
        except (json.JSONDecodeError, KeyError):
            pass

        # Method 2: Check if the result contains entity URL information (legacy text format)
        if "Entity URL:" in result_str:
            lines = [ln.strip() for ln in result_str.split("\n")]

            # Fast path: multiple URL lines → build list of entities
            url_lines = [ln.replace("Entity URL:", "").strip() for ln in lines if ln.startswith("Entity URL:")]
            if len(url_lines) > 1:
                name_lines = [ln.replace("Entity Name:", "").strip() for ln in lines if ln.startswith("Entity Name:")]
                type_lines = [ln.replace("Entity Type:", "").strip() for ln in lines if ln.startswith("Entity Type:")]
                id_lines = [ln.replace("Entity ID:", "").strip() for ln in lines if ln.startswith("Entity ID:")]
                ident_lines = [ln.replace("Entity Identifier:", "").strip() for ln in lines if ln.startswith("Entity Identifier:")]

                entities: List[Dict[str, Any]] = []
                max_len = len(url_lines)
                for i in range(max_len):
                    e: Dict[str, Any] = {"entity_url": url_lines[i]}
                    if i < len(name_lines) and name_lines[i]:
                        e["entity_name"] = name_lines[i]
                    if i < len(type_lines) and type_lines[i]:
                        e["entity_type"] = type_lines[i]
                    if i < len(id_lines) and id_lines[i]:
                        e["entity_id"] = id_lines[i]
                    if i < len(ident_lines) and ident_lines[i]:
                        e["entity_identifier"] = ident_lines[i]
                        if e.get("entity_type") == "workitem":
                            e["issue_identifier"] = ident_lines[i]
                    entities.append(e)

                # Normalize identifiers from URLs if possible
                for e in entities:
                    try:
                        url = e.get("entity_url")
                        if isinstance(url, str) and "/browse/" in url:
                            after = url.split("/browse/", 1)[1]
                            identifier = after.split("/", 1)[0]
                            if "-" in identifier:
                                parts = identifier.split("-", 1)
                                if len(parts) == 2 and parts[1].isdigit():
                                    e["issue_identifier"] = identifier
                    except Exception:
                        pass

                return entities

            # Single-entity path
            for line in lines:
                if line.startswith("Entity URL:"):
                    entity_info["entity_url"] = line.replace("Entity URL:", "").strip()
                elif line.startswith("Entity Name:"):
                    entity_info["entity_name"] = line.replace("Entity Name:", "").strip()
                elif line.startswith("Entity Type:"):
                    entity_info["entity_type"] = line.replace("Entity Type:", "").strip()
                elif line.startswith("Entity ID:"):
                    entity_info["entity_id"] = line.replace("Entity ID:", "").strip()
                elif line.startswith("Entity Identifier:"):
                    # Generic identifier line (project identifier or work-item unique key)
                    ident_val = line.replace("Entity Identifier:", "").strip()
                    entity_info["entity_identifier"] = ident_val
                    # For work-items, keep backwards-compatible key as well
                    try:
                        if entity_info.get("entity_type") == "workitem":
                            entity_info["issue_identifier"] = ident_val
                    except Exception:
                        pass

            if entity_info:
                # If we have an entity_url, attempt to parse a work-item unique key from it (e.g., WEB-821)
                try:
                    url = entity_info.get("entity_url")
                    if isinstance(url, str) and "/browse/" in url:
                        # Expect format: .../browse/PROJECT-SEQ/
                        after = url.split("/browse/", 1)[1]
                        identifier = after.split("/", 1)[0]
                        # Basic validation: must contain a hyphen and end with digits
                        if "-" in identifier:
                            parts = identifier.split("-", 1)
                            if len(parts) == 2 and parts[1].isdigit():
                                entity_info["issue_identifier"] = identifier
                except Exception:
                    pass

                return entity_info

        # Method 3: For tools that don't provide formatted entity info, try to infer from tool name
        if tool_name and isinstance(tool_name, str) and "_create" in tool_name:
            # This is a create operation, try to extract basic info
            if "created successfully" in result_str.lower() or "✅" in result_str:
                entity_info["tool_name"] = tool_name
                entity_info["raw_result"] = result_str[:200]  # Store first 200 chars
                return entity_info

        # Method 4: Extract entity_id from Result JSON section (fallback for when URL construction fails)
        if tool_name and isinstance(tool_name, str) and "_create" in tool_name:
            try:
                # Look for "Result: {json_data}" pattern
                if "Result: {" in result_str:
                    # Extract JSON from Result section
                    result_start = result_str.find("Result: {")
                    if result_start != -1:
                        json_start = result_start + len("Result: ")
                        # Find the end of the JSON object
                        json_str = result_str[json_start:]

                        # Try to parse the JSON
                        result_data = json.loads(json_str)
                        if isinstance(result_data, dict) and result_data.get("id"):
                            # Extract entity information from the API response
                            entity_info = {
                                "entity_id": str(result_data["id"]),
                                "entity_type": "epic" if "epics_create" in tool_name or "workitems_create" in tool_name else "unknown",
                                "tool_name": tool_name,
                            }

                            # Add entity name if available
                            if result_data.get("name"):
                                entity_info["entity_name"] = result_data["name"]

                            return entity_info
            except (json.JSONDecodeError, ValueError, KeyError):
                # JSON parsing failed, continue to fallback
                pass

        return None

    except Exception as e:
        log.warning(f"Error extracting entity info from result: {e}")
        return None


async def update_flow_step_execution_status(
    step_id: str,
    execution_result: str,
    entity_info: Optional[Dict[str, Any] | List[Dict[str, Any]]],
    success: bool,
    db: AsyncSession,
    version_id: Optional[str] = None,
) -> None:
    """Update a flow step or artifact version to mark it as executed."""
    try:
        # Validate that step_id is a valid UUID
        try:
            step_uuid = UUID(step_id)
        except ValueError as uuid_error:
            log.error(f"Invalid UUID format for step_id '{step_id}': {uuid_error}")
            return

        # If version_id is provided, this is an edited artifact - update the ActionArtifactVersion
        if version_id:
            try:
                from pi.services.retrievers.pg_store.action_artifact import update_action_artifact_version_execution_status

                # Persist only first entity for version rows for compatibility
                _single_entity: Optional[Dict[str, Any]]
                if isinstance(entity_info, list):
                    _single_entity = entity_info[0] if entity_info else None
                else:
                    _single_entity = entity_info

                result = await update_action_artifact_version_execution_status(
                    db=db,
                    version_id=UUID(version_id),
                    is_executed=True,
                    success=success,
                    entity_info=_single_entity,
                )
                if result:
                    log.info(f"✅ Successfully updated ActionArtifactVersion {version_id} for step {step_id}: success={success}")
                else:
                    log.error(f"❌ Failed to update ActionArtifactVersion {version_id} for step {step_id}")

            except Exception as version_error:
                log.error(f"❌ Error updating ActionArtifactVersion {version_id} for step {step_id}: {version_error}")
            return

        # For normal artifacts, update the MessageFlowStep
        stmt = select(MessageFlowStep).where(MessageFlowStep.id == step_uuid)  # type: ignore[arg-type]
        query_result = await db.execute(stmt)
        flow_step: Optional[MessageFlowStep] = query_result.scalars().first()

        if not flow_step:
            log.error(f"Flow step {step_id} not found")
            return

        # Mark as executed
        flow_step.is_executed = True

        # Set execution success status and error
        if success:
            flow_step.execution_success = ExecutionStatus.SUCCESS
            flow_step.execution_error = None
        else:
            flow_step.execution_success = ExecutionStatus.FAILED
            flow_step.execution_error = execution_result if "error" in execution_result.lower() else f"Execution failed: {execution_result}"

        # Update execution data - create NEW dict to trigger SQLModel change detection
        current_execution_data = flow_step.execution_data or {}
        updated_execution_data = {
            **current_execution_data,  # Preserve existing data
            "executed_at": str(datetime.datetime.utcnow()),
            "execution_result": execution_result,
            "business_success": success,
        }

        if entity_info:
            if isinstance(entity_info, list):
                updated_execution_data["entities"] = entity_info
                if entity_info:
                    updated_execution_data["entity_info"] = entity_info[0]
            else:
                updated_execution_data["entity_info"] = entity_info

        # Sanitize execution_data to ensure JSON serializability before saving
        sanitized_execution_data = sanitize_execution_data(updated_execution_data)

        # Assign NEW dictionary to trigger SQLModel change detection
        flow_step.execution_data = sanitized_execution_data

        # Force SQLModel to mark the field as changed
        from sqlalchemy.orm import attributes

        attributes.flag_modified(flow_step, "execution_data")

        # Update corresponding artifact if exists (for normal flow)
        artifact_id = current_execution_data.get("artifact_id")
        if artifact_id:
            try:
                from pi.services.retrievers.pg_store.action_artifact import update_action_artifact_execution_status

                # Extract single-entity info and entity_id from entity_info if available
                _entity_info: Optional[Dict[str, Any]]
                if isinstance(entity_info, list):
                    _entity_info = entity_info[0] if entity_info else None
                elif isinstance(entity_info, dict):
                    _entity_info = entity_info
                else:
                    _entity_info = None

                entity_id = None
                if isinstance(_entity_info, dict) and "entity_id" in _entity_info:
                    entity_id = UUID(str(_entity_info["entity_id"]))

                # Update artifact execution status and persist entity_info for parity (includes entity_url)
                await update_action_artifact_execution_status(
                    db=db,
                    artifact_id=UUID(artifact_id),
                    is_executed=True,
                    success=success,
                    entity_id=entity_id,
                    entity_info=_entity_info,
                )

                # log.info(f"Updated artifact {artifact_id} execution status: success={success}")

            except Exception as artifact_error:
                log.error(f"Error updating artifact {artifact_id}: {artifact_error}")
                # Don't fail the main execution if artifact update fails

        await db.commit()

    except Exception as e:
        log.error(f"Error updating flow step execution status: {e}")
        await db.rollback()
        # Don't re-raise - this is a tracking operation and shouldn't fail the main execution
