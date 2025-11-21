"""LLM-based orchestration for batch action execution."""

import re
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from langchain_core.messages import SystemMessage
from langchain_core.messages import ToolMessage
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.services.actions.tools.entity_search import get_entity_search_tools
from pi.services.chat.chat import PlaneChatBot

from .batch_execution_context import BatchExecutionContext
from .batch_execution_helpers import build_execution_prompt
from .batch_execution_helpers import extract_entity_info
from .batch_execution_helpers import update_flow_step_execution_status

log = logger.getChild(__name__)


class BatchActionOrchestrator:
    """Orchestrates batch action execution using LLM."""

    def __init__(self, chatbot: PlaneChatBot, db: AsyncSession):
        self.chatbot = chatbot
        self.db = db

    async def execute_planned_actions(
        self,
        context: BatchExecutionContext,
        original_query: str,
        planned_actions: List[Dict[str, Any]],
        access_token: str,
        workspace_slug: str,
    ) -> BatchExecutionContext:
        """Execute all planned actions using LLM orchestration."""

        context.set_total_planned(len(planned_actions))

        try:
            # Build execution prompt
            execution_prompt = build_execution_prompt(original_query, planned_actions)

            # Create method executor and tools
            _, combined_tools = await self._setup_execution_tools(access_token, workspace_slug, context, planned_actions)  # noqa: E501

            if not combined_tools:
                context.add_execution_failure("setup", "tool_setup", "No execution tools available", None)
                return context

            # Execute using LLM orchestration
            await self._orchestrate_with_llm(execution_prompt, combined_tools, planned_actions, context)

            # Mark execution as completed
            context.mark_completed()

        except Exception as e:
            log.error(f"Batch execution failed: {e}")
            context.add_execution_failure("orchestration", "system_error", str(e), None)

        return context

    async def _setup_execution_tools(
        self, access_token: str, workspace_slug: str, context: BatchExecutionContext, planned_actions: List[Dict[str, Any]]
    ):
        """Set up the execution tools for the planned actions."""
        from pi import settings
        from pi.services.actions import MethodExecutor
        from pi.services.actions import PlaneActionsExecutor

        # Create actions executor
        if access_token.startswith("plane_api_"):
            actions_executor = PlaneActionsExecutor(api_key=access_token, base_url=settings.plane_api.HOST)
        else:
            actions_executor = PlaneActionsExecutor(access_token=access_token, base_url=settings.plane_api.HOST)

        method_executor = MethodExecutor(actions_executor)

        # Build context for tools - extract project_id from planned actions
        project_id = None
        for action in planned_actions:
            # Look for project_id in action args
            args = action.get("args", {})
            if args.get("project_id"):
                project_id = args["project_id"]
                break

        if not project_id:
            log.warning("🔧 WARNING: No project_id found in planned actions - context auto-fill may fail")
        else:
            # Check if project_id needs resolution (is not a UUID)
            import re

            uuid_regex = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
            if not uuid_regex.match(project_id):
                # log.info(f"🔧 Resolving project_id '{project_id}' to UUID before building context")
                # Create temporary tools for resolution
                temp_executor = PlaneActionsExecutor(access_token=access_token, base_url=settings.plane_api.HOST)
                temp_method_executor = MethodExecutor(temp_executor)
                temp_context = {"workspace_slug": workspace_slug}
                temp_tools = self.chatbot._build_method_tools("entity_search", temp_method_executor, temp_context)

                # Resolve project_id
                resolved_project_id = await self._resolve_entity_id("project", project_id, temp_tools, None)
                if resolved_project_id:
                    # log.info(f"🔧 Successfully resolved project_id '{project_id}' to '{resolved_project_id}'")
                    project_id = resolved_project_id
                else:
                    log.error(f"🔧 Failed to resolve project_id '{project_id}' - will use as-is")

        # workspace_slug is now auto-filled in tool implementations (hidden from LLM)

        tool_context: Dict[str, Any] = {
            "workspace_id": str(context.workspace_id),
            "workspace_slug": workspace_slug,
            "project_id": project_id,  # 🔥 FIX: Extract from planned actions
            "user_id": str(context.user_id),
            "conversation_history": [],
            "user_meta": {},
            "is_project_chat": context.is_project_chat,  # 🔥 FIX: Pass is_project_chat to tools
        }

        log.info(
            f"🔧 EXECUTION TOOL CONTEXT: is_project_chat={context.is_project_chat}, workspace_id={context.workspace_id}, chat_id={context.chat_id}"
        )

        # Determine which categories of tools we need based on planned actions
        categories = set()
        for action in planned_actions:
            tool_name = action.get("tool_name", "")
            # Ensure tool_name is always a string to avoid NoneType iteration errors
            if tool_name is None:
                tool_name = ""
            elif not isinstance(tool_name, str):
                tool_name = str(tool_name)

            if tool_name and "_" in tool_name:
                category = tool_name.split("_")[0]
                # Map epics to workitems category since epics tools are part of workitems
                if category == "epics":
                    category = "workitems"
                categories.add(category)

        log.info(f"🔧 Building execution tools for categories: {categories}")

        # Build tools for all required categories
        combined_tools = []
        tool_names_seen = set()

        for category in categories:
            try:
                tools_for_category = self.chatbot._build_method_tools(category, method_executor, tool_context)
                # Only add tools we haven't seen before (deduplicate by name)
                tool_names_list = []
                for tool in tools_for_category:
                    if tool.name not in tool_names_seen:
                        combined_tools.append(tool)
                        tool_names_seen.add(tool.name)
                        tool_names_list.append(tool.name)
                log.info(f"🔧 Built tools for category '{category}': {tool_names_list}")

            except Exception as e:
                log.warning(f"Failed to build tools for category {category}: {e}")

        # Add entity search tools for placeholder resolution (only if not already included)
        try:
            entity_search_tools = get_entity_search_tools(method_executor, tool_context)
            for tool in entity_search_tools:
                if tool.name not in tool_names_seen:
                    combined_tools.append(tool)
                    tool_names_seen.add(tool.name)
            log.info(
                f"🔧 Added {len([t for t in entity_search_tools if t.name not in tool_names_seen])} entity search tools for placeholder resolution"
            )
        except Exception as e:
            log.warning(f"Failed to build entity search tools: {e}")

        return method_executor, combined_tools

    async def _orchestrate_with_llm(
        self,
        execution_prompt: str,
        combined_tools: List,
        planned_actions: List[Dict[str, Any]],
        context: BatchExecutionContext,
    ):
        """Use LLM to orchestrate the execution of planned actions."""

        # Initialize conversation
        messages: List[Any] = [SystemMessage(content=execution_prompt)]

        # Bind tools to LLM
        llm_with_tools = self.chatbot.tool_llm.bind_tools(combined_tools)

        # Set tracking context for action execution LLM calls
        from pi.app.models.enums import MessageMetaStepType

        llm_with_tools.set_tracking_context(context.message_id, self.db, MessageMetaStepType.ACTION_EXECUTION, chat_id=str(context.chat_id))

        # Track which actions have been executed
        executed_tool_names = set()
        used_step_ids: set = set()  # Track which step_ids have been matched to prevent double-matching
        max_iterations = 15  # Safety limit
        iteration_count = 0

        # Start the orchestration conversation
        response = await llm_with_tools.ainvoke(messages)

        # Continue until no more tool calls or we hit limits
        while (
            hasattr(response, "tool_calls") and getattr(response, "tool_calls", None) and iteration_count < max_iterations and context.can_continue()
        ):
            # Add the response with tool calls to messages first
            messages.append(response)
            iteration_count += 1
            tool_messages = []
            execution_failed = False

            tool_calls = getattr(response, "tool_calls", [])

            # Ensure tool_calls is always a list
            if tool_calls is None:
                tool_calls = []
            elif not isinstance(tool_calls, (list, tuple)):
                log.warning(f"Unexpected tool_calls type: {type(tool_calls)}, converting to list")
                tool_calls = [tool_calls] if tool_calls else []

            # Execute all tool calls in this round
            for tool_call in tool_calls:
                try:
                    # Extract tool call information - handle both LangChain objects and dictionaries
                    if isinstance(tool_call, dict):
                        # Handle dictionary format (what we're actually getting)
                        tool_name = tool_call.get("name", "")
                        tool_args = tool_call.get("args", {})
                        tool_id = tool_call.get("id", "")
                    else:
                        # Handle LangChain object format
                        tool_name = getattr(tool_call, "name", "")
                        tool_args = getattr(tool_call, "args", {})
                        tool_id = getattr(tool_call, "id", "")

                    if not tool_name:
                        continue

                    if not tool_id:
                        continue

                    # Ensure tool_name is a string and not None
                    tool_name = str(tool_name) if tool_name is not None else ""
                    if not tool_name:
                        continue

                    # Find the corresponding planned action with argument matching and consumption tracking
                    planned_action = self._find_planned_action(tool_name, planned_actions, tool_args, used_step_ids)
                    if not planned_action:
                        # Try to find by partial match (LLM might use slightly different names)
                        planned_action = self._find_planned_action_partial(tool_name, planned_actions)

                    # Debug logging for step_id matching
                    if not planned_action:
                        log.warning(f"⚠️ Could not match tool_call {tool_name} to any planned action")

                    # Ensure we have a valid step_id
                    if planned_action and planned_action.get("step_id"):
                        step_id = planned_action["step_id"]
                    else:
                        step_id = f"unknown_{context.current_step}"
                        log.warning(f"No planned action found for tool {tool_name}, using fallback step_id: {step_id}")

                    # DEFENSIVE FIX: Before placeholder resolution, check if action_summary has project.id
                    # and tool_args.project_id is missing or non-UUID. Extract from summary if available.

                    uuid_pattern = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
                    if planned_action:
                        action_summary = planned_action.get("action_summary", {})
                        log.info(
                            f"DEBUG: action_summary type={type(action_summary)}, keys={action_summary.keys() if isinstance(action_summary, dict) else "N/A"}"  # noqa: E501
                        )
                        if isinstance(action_summary, dict):
                            parameters = action_summary.get("parameters", {})
                            log.info(
                                f"DEBUG: parameters type={type(parameters)}, keys={parameters.keys() if isinstance(parameters, dict) else "N/A"}"  # noqa: E501
                            )
                            if isinstance(parameters, dict):
                                project_block = parameters.get("project", {})
                                log.info(f"DEBUG: project_block type={type(project_block)}, content={project_block}")  # noqa: E501
                                if isinstance(project_block, dict):
                                    summary_project_id = project_block.get("id")
                                    log.info(
                                        f"DEBUG: summary_project_id={summary_project_id}, is_uuid={uuid_pattern.match(summary_project_id) if isinstance(summary_project_id, str) else False}"  # noqa: E501
                                    )
                                    if isinstance(summary_project_id, str) and uuid_pattern.match(summary_project_id):
                                        # Check if tool_args needs this project_id
                                        current_project_id = tool_args.get("project_id") if isinstance(tool_args, dict) else None
                                        log.info(
                                            f"DEBUG: current_project_id={current_project_id}, is_uuid={uuid_pattern.match(current_project_id) if isinstance(current_project_id, str) else False}"  # noqa: E501
                                        )
                                        if not current_project_id or (
                                            isinstance(current_project_id, str) and not uuid_pattern.match(current_project_id)
                                        ):
                                            # Set project_id from action_summary to avoid resolution
                                            if isinstance(tool_args, dict):
                                                tool_args["project_id"] = summary_project_id
                                                log.info(f"✅ Extracted project_id from action_summary for {tool_name}: {summary_project_id}")

                    # Check if tool_args contain placeholders that need resolution
                    if self._has_placeholders(tool_args):
                        # log.info(f"Detected placeholders in {tool_name} arguments: {tool_args}")
                        # Force placeholder resolution before execution
                        resolved_args = await self._resolve_placeholders(tool_args, combined_tools, context)
                        if resolved_args:
                            # log.info(f"Successfully resolved placeholders for {tool_name}: {resolved_args}")
                            tool_args = resolved_args
                        else:
                            # Placeholder resolution failed
                            error_msg = f"Failed to resolve placeholders in {tool_name} arguments: {tool_args}"
                            artifact_id = planned_action.get("artifact_id") if planned_action else None
                            planned_sequence = planned_action.get("step_order") if planned_action else None
                            artifact_type = planned_action.get("artifact_type") if planned_action else None
                            context.add_execution_failure(
                                step_id, tool_name, error_msg, artifact_id, sequence=planned_sequence, artifact_type=artifact_type
                            )
                            execution_failed = True
                            continue
                    else:
                        log.debug(f"No placeholders detected in {tool_name} arguments: {tool_args}")

                    # Execute the tool
                    result = await self._execute_tool(tool_name, tool_args, combined_tools)

                    # Check if execution was successful
                    is_success = self._check_execution_success(result)

                    if is_success:
                        # Extract entity information
                        entity_info = extract_entity_info(str(result), tool_name)
                        # Coerce to a single entity dict for downstream consumers (type-safe for mypy)
                        single_entity_info: Optional[Dict[str, Any]]
                        if isinstance(entity_info, list):
                            single_entity_info = entity_info[0] if entity_info else None
                        elif isinstance(entity_info, dict):
                            single_entity_info = entity_info
                        else:
                            single_entity_info = None

                        # Record successful execution
                        artifact_id = planned_action.get("artifact_id") if planned_action else None
                        planned_sequence = planned_action.get("step_order") if planned_action else None
                        artifact_type = planned_action.get("artifact_type") if planned_action else None
                        context.add_execution_result(
                            step_id, tool_name, result, single_entity_info, artifact_id, sequence=planned_sequence, artifact_type=artifact_type
                        )
                        executed_tool_names.add(tool_name)

                        # Update flow step in database
                        if planned_action and planned_action.get("step_id"):
                            # For manual edits, pass the version_id through
                            version_id = planned_action.get("version_id")
                            await update_flow_step_execution_status(step_id, str(result), entity_info, True, self.db, version_id)
                    else:
                        # Record failed execution
                        error_msg = f"Tool execution failed: {result}"
                        artifact_id = planned_action.get("artifact_id") if planned_action else None
                        planned_sequence = planned_action.get("step_order") if planned_action else None
                        artifact_type = planned_action.get("artifact_type") if planned_action else None
                        context.add_execution_failure(
                            step_id, tool_name, error_msg, artifact_id, sequence=planned_sequence, artifact_type=artifact_type
                        )

                        # Update flow step in database
                        if planned_action and planned_action.get("step_id"):
                            # For manual edits, pass the version_id through (for failed cases too)
                            version_id = planned_action.get("version_id")
                            await update_flow_step_execution_status(step_id, str(result), None, False, self.db, version_id)

                        # Mark execution as failed but continue to create tool message
                        execution_failed = True

                    # Create tool message for conversation continuity (regardless of success/failure)
                    tool_message = ToolMessage(content=str(result), tool_call_id=tool_id)
                    tool_messages.append(tool_message)

                except Exception as e:
                    log.error(f"Error executing tool {tool_name}: {e}")
                    # Use fallback step_id for error cases
                    error_step_id = step_id if "step_id" in locals() and step_id is not None else f"unknown_{context.current_step}"
                    artifact_id = planned_action.get("artifact_id") if planned_action else None
                    planned_sequence = planned_action.get("step_order") if planned_action else None
                    artifact_type = planned_action.get("artifact_type") if planned_action else None
                    context.add_execution_failure(
                        error_step_id, tool_name, str(e), artifact_id, sequence=planned_sequence, artifact_type=artifact_type
                    )

                    # Create error tool message
                    tool_message = ToolMessage(content=f"Error executing {tool_name}: {str(e)}", tool_call_id=tool_id)
                    tool_messages.append(tool_message)
                    execution_failed = True

            # Add tool results to conversation (this must happen before any break)
            messages.extend(tool_messages)

            # Verify that all tool calls in this response have corresponding tool messages
            response_tool_call_ids = set()
            for tc in tool_calls:
                if isinstance(tc, dict):
                    tool_id = tc.get("id", "")
                else:
                    tool_id = getattr(tc, "id", "")
                if tool_id:
                    response_tool_call_ids.add(tool_id)

            added_tool_message_ids = {getattr(tm, "tool_call_id", "") for tm in tool_messages if hasattr(tm, "tool_call_id")}

            missing_in_this_round = response_tool_call_ids - added_tool_message_ids
            if missing_in_this_round:
                # Create missing tool messages for this round
                for missing_id in missing_in_this_round:
                    placeholder_message = ToolMessage(content="Tool execution was interrupted or failed", tool_call_id=missing_id)
                    messages.append(placeholder_message)

            # Check if we should continue
            if not context.can_continue():
                break

            # Check if all planned actions have been executed (by step_id count, not tool name uniqueness)
            total_planned_actions = len(planned_actions)
            total_executed_actions = len(used_step_ids)
            if total_executed_actions >= total_planned_actions:
                # log.info(f"All {total_planned_actions} planned actions have been attempted. Stopping execution loop.")
                break

            # If execution failed, stop here but tool messages are already added
            if execution_failed:
                break

            # Get next response from LLM
            try:
                response = await llm_with_tools.ainvoke(messages)
            except Exception as e:
                log.error(f"Error getting LLM response: {e}")
                context.add_execution_failure("llm", "orchestration_error", str(e), None)
                break

    def _find_planned_action(
        self, tool_name: str, planned_actions: List[Dict[str, Any]], tool_args: Optional[Dict[str, Any]] = None, used_step_ids: Optional[set] = None
    ) -> Optional[Dict[str, Any]]:
        """Find the planned action that matches the tool name and hasn't been used yet."""
        if used_step_ids is None:
            used_step_ids = set()

        # First try to match by tool name and key arguments for better accuracy
        if tool_args:
            for action in planned_actions:
                artifact_id = action.get("artifact_id")

                if action.get("tool_name") == tool_name and artifact_id not in used_step_ids:
                    # Check if key arguments match (for better matching when there are multiple identical tool calls)
                    planned_args = action.get("args", {})

                    # For workitem operations, match on issue_id
                    if tool_name.startswith("workitems_") and "issue_id" in tool_args and "issue_id" in planned_args:
                        if tool_args["issue_id"] == planned_args["issue_id"]:
                            if artifact_id:  # Use artifact_id for tracking instead of step_id
                                used_step_ids.add(artifact_id)
                            return action
                    # For create operations with identical tool names, match on core identifying fields
                    elif tool_name.endswith("_create") and self._create_args_match(tool_args, planned_args):
                        if artifact_id:  # Use artifact_id for tracking instead of step_id
                            used_step_ids.add(artifact_id)
                        return action
                    # For other operations, can add more specific matching logic as needed
                    elif self._args_match(tool_args, planned_args):
                        if artifact_id:  # Use artifact_id for tracking instead of step_id
                            used_step_ids.add(artifact_id)
                        return action

        # Fallback: match by tool name only, but skip already used actions
        for action in planned_actions:
            artifact_id = action.get("artifact_id")
            if action.get("tool_name") == tool_name and artifact_id not in used_step_ids:
                if artifact_id:  # Use artifact_id for tracking
                    used_step_ids.add(artifact_id)
                return action

        return None

    def _create_args_match(self, tool_args: Dict[str, Any], planned_args: Dict[str, Any]) -> bool:
        """Check if tool arguments match for create operations (where unique identifying fields like name are key)."""
        if not tool_args and not planned_args:
            return True

        # For create operations, the 'name' field is usually the most distinctive identifier
        # If both have name fields, they must match exactly for create operations
        if "name" in tool_args and "name" in planned_args:
            if str(tool_args["name"]) != str(planned_args["name"]):
                return False
            # If names match, check other fields for additional validation
            other_fields = ["project_id", "priority", "state_id", "type_id"]
            for field in other_fields:
                if field in tool_args and field in planned_args:
                    if str(tool_args[field]) != str(planned_args[field]):
                        return False
            return True

        # If no name field, fall back to matching on other distinctive fields
        key_fields = ["project_id", "priority", "state_id", "type_id"]
        matches = 0
        total_fields = 0

        for field in key_fields:
            if field in tool_args and field in planned_args:
                total_fields += 1
                if str(tool_args[field]) == str(planned_args[field]):
                    matches += 1

        # Require high match ratio for create operations
        return total_fields > 0 and (matches / total_fields) >= 0.8

    def _args_match(self, tool_args: Dict[str, Any], planned_args: Dict[str, Any]) -> bool:
        """Check if tool arguments substantially match planned arguments."""
        if not tool_args and not planned_args:
            return True

        # Check key fields that should match
        key_fields = ["issue_id", "project_id", "module_id", "cycle_id", "label_id", "state_id", "user_id"]

        for field in key_fields:
            if field in tool_args and field in planned_args:
                if str(tool_args[field]) != str(planned_args[field]):
                    return False

        return True

    def _find_planned_action_partial(self, tool_name: str, planned_actions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Find a planned action that matches the tool name partially."""
        for action in planned_actions:
            planned_tool_name = action.get("tool_name", "")
            # Ensure both tool names are strings before string operations
            if planned_tool_name and isinstance(planned_tool_name, str) and tool_name and isinstance(tool_name, str):
                if tool_name in planned_tool_name or planned_tool_name in tool_name:
                    return action
        return None

    async def _execute_tool(self, tool_name: str, tool_args: Dict[str, Any], tools: List) -> Any:
        """Execute a specific tool with the given arguments."""
        # Ensure tool_name is a string
        if not tool_name or not isinstance(tool_name, str):
            log.error(f"Invalid tool name: {tool_name}")
            return f"Error: Invalid tool name: {tool_name}"

        # Find the tool
        tool_func = next((t for t in tools if getattr(t, "name", "") == tool_name), None)

        if not tool_func:
            log.error(f"Tool {tool_name} not found")
            return f"Error: Tool {tool_name} not found"

        try:
            # Execute the tool
            if hasattr(tool_func, "ainvoke"):
                result = await tool_func.ainvoke(tool_args)
            else:
                result = tool_func.invoke(tool_args)

            return result
        except Exception as e:
            log.error(f"Error executing tool {tool_name}: {e}")
            return f"Error executing {tool_name}: {str(e)}"

    def _check_execution_success(self, result: Any) -> bool:
        """Check if a tool execution was successful based on the result."""
        result_str = str(result).lower()

        # First check for explicit success indicators (higher priority)
        success_indicators = ["✅", "successfully", "created", "updated", "added"]
        for indicator in success_indicators:
            if indicator in result_str:
                return True

        # Then check for failure indicators (but be more specific to avoid false positives)
        failure_indicators = ["❌", "failed", "error:", "bad request", "not found", "invalid"]
        for indicator in failure_indicators:
            if indicator in result_str:
                return False

        # Default to success if no clear indicators
        return True

    def _has_placeholders(self, tool_args: Dict[str, Any]) -> bool:
        """Check if tool arguments contain placeholders or non-UUID *_id values that need resolution."""
        import re

        log.debug(f"_has_placeholders input args: {tool_args}")
        # Regex for matching standard UUIDs - fixed pattern to handle UUIDs properly
        uuid_regex = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
        entity_keys = {"module", "workitem", "project", "cycle", "label", "state", "user"}

        for key, value in tool_args.items():
            # Special-case: workspace scope sentinel should NOT trigger resolution
            if key == "project_id" and isinstance(value, str) and value == "__workspace_scope__":
                continue
            # 1) Explicit placeholder syntax
            if isinstance(value, str) and "<id of" in value:
                return True

            # 2) Non-UUID string passed to an *_id field for known entities
            if isinstance(value, str) and key.endswith("_id"):
                entity_type = key[:-3]
                is_uuid = uuid_regex.match(value)

                if entity_type in entity_keys and not is_uuid:
                    return True

            # 3) List of placeholders or non-UUID id values for known entities
            if isinstance(value, list):
                for item in value:
                    # Skip sentinel in lists as well (defensive)
                    if key == "project_id" and isinstance(item, str) and item == "__workspace_scope__":
                        continue
                    if isinstance(item, str) and (
                        "<id of" in item or (key.endswith("_id") and key[:-3] in entity_keys and not uuid_regex.match(item))
                    ):
                        return True

        return False

    async def _resolve_placeholders(self, tool_args: Dict[str, Any], tools: List, context: BatchExecutionContext) -> Optional[Dict[str, Any]]:
        """Resolve placeholders in tool arguments using retrieval tools."""
        import re

        resolved_args = tool_args.copy()
        # Use the same UUID regex pattern as _has_placeholders for consistency
        uuid_regex = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
        for key, value in list(resolved_args.items()):
            # Special-case: workspace scope sentinel - preserve as-is
            if key == "project_id" and isinstance(value, str) and value == "__workspace_scope__":
                continue
            if isinstance(value, str) and "<id of" in value:
                match = re.search(r"<id of (\w+): ([^>]+)>", value)
                if match:
                    entity_type, entity_name = match.groups()
                    # Special-case: workspace scope sentinel inside placeholder wrapper
                    if entity_type == "project" and entity_name.strip() == "__workspace_scope__":
                        resolved_args[key] = "__workspace_scope__"
                        continue
                    resolved_id = await self._resolve_entity_id(entity_type, entity_name, tools, context)
                    if resolved_id:
                        resolved_args[key] = resolved_id
                    else:
                        log.error(f"Failed to resolve {entity_type} ID for '{entity_name}'")
                        return None
        # 2) Then auto-resolve non-UUID raw names for known *_id fields (skip placeholders)
        entity_keys = {"module", "workitem", "project", "cycle", "label", "state", "user"}
        for key, val in list(resolved_args.items()):
            if key.endswith("_id") and key[:-3] in entity_keys and isinstance(val, str) and "<id of" not in val and not uuid_regex.match(val):
                # Skip sentinel (workspace scope)
                if key == "project_id" and val == "__workspace_scope__":
                    continue
                resolved_id = await self._resolve_entity_id(key[:-3], val, tools, context)
                if resolved_id:
                    resolved_args[key] = resolved_id
                else:
                    log.error(f"Failed to auto-resolve {key} for '{val}'")
                    return None
        # Now fallback to original placeholder handling for lists and stray entries
        for key, value in tool_args.items():
            if isinstance(value, list):
                resolved_list = []
                for item in value:
                    if isinstance(item, str) and "<id of" in item:
                        match = re.search(r"<id of (\w+): ([^>]+)>", item)
                        if match:
                            entity_type, entity_name = match.groups()
                            resolved_id = await self._resolve_entity_id(entity_type, entity_name, tools, context)
                            if resolved_id:
                                resolved_list.append(resolved_id)
                            else:
                                log.error(f"Failed to resolve {entity_type} ID for '{entity_name}'")
                                return None
                            continue
                    resolved_list.append(item)
                resolved_args[key] = resolved_list
        return resolved_args

    async def _resolve_entity_id(
        self, entity_type: str, entity_name: str, tools: List, context: Optional[BatchExecutionContext] = None
    ) -> Optional[str]:
        """Resolve a specific entity ID, first checking recent execution results, then using search tools."""
        try:
            # First, check if this entity was created in a previous step of the current execution
            if context:
                for step_id, entity_info in context.entity_results.items():
                    if entity_info:
                        # Check if this step created an entity of the requested type with the requested name
                        if (
                            entity_info.get("entity_type") == entity_type
                            and entity_info.get("entity_name") == entity_name
                            and entity_info.get("entity_id")
                        ):
                            resolved_id = entity_info.get("entity_id")
                            return resolved_id

            # If not found in execution results, use search tools
            # Map entity types to their search tool names
            tool_mapping = {
                "module": "search_module_by_name",
                "workitem": "search_workitem_by_name",
                "project": "search_project_by_name",
                "cycle": "search_cycle_by_name",
                "label": "search_label_by_name",
                "state": "search_state_by_name",
                "user": "search_user_by_name",
            }

            tool_name = tool_mapping.get(entity_type)
            if not tool_name:
                log.warning(f"No tool mapping found for entity type: {entity_type}")
                return None

            # Find the search tool
            tool_func = next((t for t in tools if getattr(t, "name", "") == tool_name), None)
            if not tool_func:
                log.error(f"Tool {tool_name} not found for resolving {entity_type}")
                return None

            # Call the search tool with the entity name
            # Special case for user search which expects 'display_name' parameter
            if entity_type == "user":
                params = {"display_name": entity_name}
            else:
                params = {"name": entity_name}

            if hasattr(tool_func, "ainvoke"):
                result = await tool_func.ainvoke(params)
            else:
                result = tool_func.invoke(params)

            # Parse the result to extract the ID
            if isinstance(result, str):
                # The tool returns a formatted string, we need to extract the ID from it
                # Format: "✅ Found module 'name'\n\nResult: {'id': 'uuid', 'name': 'name', 'project_id': 'uuid'}"
                try:
                    # Extract the Result section and parse it as a dict
                    if "Result:" in result:
                        result_section = result.split("Result:")[1].strip()
                        # This is a string representation of a dict, we need to parse it
                        import ast

                        result_dict = ast.literal_eval(result_section)
                        return result_dict.get("id")
                except Exception as parse_error:
                    log.warning(f"Failed to parse result from {tool_name}: {parse_error}")
                    return None

            return None

        except Exception as e:
            log.error(f"Error resolving {entity_type} ID for '{entity_name}': {e}")
            return None
