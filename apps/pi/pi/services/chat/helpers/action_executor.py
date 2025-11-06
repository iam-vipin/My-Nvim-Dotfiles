"""Action execution logic with retrieval tools."""

import ast
import contextlib
import datetime
import re
import uuid
from collections.abc import AsyncIterator
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Union

from langchain_core.messages import HumanMessage
from langchain_core.messages import SystemMessage
from langchain_core.messages import ToolMessage
from langchain_core.prompts import ChatPromptTemplate

from pi import logger
from pi import settings
from pi.app.models.enums import ExecutionStatus
from pi.app.models.enums import FlowStepType
from pi.app.models.enums import MessageMetaStepType
from pi.core.db.plane_pi.lifecycle import get_streaming_db_session
from pi.services.actions import MethodExecutor
from pi.services.actions import PlaneActionsExecutor
from pi.services.chat.prompts import action_category_router_prompt
from pi.services.chat.utils import get_current_timestamp_context
from pi.services.chat.utils import mask_uuids_in_text
from pi.services.chat.utils import standardize_flow_step_content
from pi.services.retrievers.pg_store.message import upsert_message_flow_steps as _upsert_message_flow_steps
from pi.services.schemas.chat import ActionCategoryRouting
from pi.services.schemas.chat import ActionCategorySelection

from .action_summary_generator import ActionSummaryGenerator
from .tool_utils import build_method_prompt
from .tool_utils import classify_tool
from .tool_utils import clean_tool_args_for_storage
from .tool_utils import extract_action_type_from_tool_name
from .tool_utils import extract_entity_type_from_tool_name
from .tool_utils import format_tool_query_for_display
from .tool_utils import handle_missing_required_fields

# from .tool_utils import log_toolset_details

log = logger.getChild(__name__)

MAX_ACTION_EXECUTOR_ITERATIONS = settings.chat.MAX_ACTION_EXECUTOR_ITERATIONS


def _format_tool_query_for_display(tool_name: str, tool_args: dict, user_query: str | None = None) -> str:
    # Compatibility shim; delegate to shared helper
    return format_tool_query_for_display(tool_name, tool_args, user_query)


def _clean_tool_args_for_storage(tool_args: Dict[str, Any]) -> Dict[str, Union[str, List[str], Any]]:
    # Compatibility shim; delegate to shared helper
    return clean_tool_args_for_storage(tool_args)


def _extract_entity_type_from_tool_name(tool_name: str) -> str:
    return extract_entity_type_from_tool_name(tool_name)


def _extract_action_type_from_tool_name(tool_name: str) -> str:
    return extract_action_type_from_tool_name(tool_name)


async def _enhance_action_summary_with_complete_data(action_summary: dict, tool_name: str, cleaned_args: dict) -> None:
    """
    Enhance action summary with complete workitem data for update operations.

    Args:
        action_summary: The action summary to enhance
        tool_name: Name of the tool being executed
        cleaned_args: Cleaned tool arguments
    """
    try:
        issue_id = cleaned_args.get("issue_id") or cleaned_args.get("workitem_id")

        # Handle case where issue_id might be a placeholder like "<id of issue: name>"
        if not issue_id:
            # Check if there's a placeholder format
            for key, value in cleaned_args.items():
                if key in ["issue_id", "workitem_id"] and isinstance(value, str) and value.startswith("<id of"):
                    # This is a placeholder, we need to get the actual ID from the action_summary
                    if "artifact_id" in action_summary:
                        issue_id = action_summary["artifact_id"]
                        break

        if not issue_id or not isinstance(action_summary, dict):
            return

        # For workitem/epic update operations, fetch complete data
        if tool_name in ["workitems_update", "epics_update"]:
            from pi.services.actions.artifacts.utils import merge_llm_updates_with_existing_data

            entity_type = "epic" if tool_name == "epics_update" else "workitem"
            current_params = action_summary.get("parameters", {})

            # Fetch complete workitem data and merge with LLM updates
            complete_data = await merge_llm_updates_with_existing_data(entity_type, str(issue_id), current_params)

            action_summary["parameters"] = complete_data
            log.info(f"Enhanced {entity_type} update action with complete data")
        else:
            # For other operations, just add the identifier
            await _add_workitem_identifier(action_summary, issue_id)
    except Exception as e:
        log.warning(f"Error enhancing action summary: {e}")
        import traceback

        log.warning(f"Traceback: {traceback.format_exc()}")


async def _add_workitem_identifier(action_summary: dict, issue_id: str) -> None:
    """Add workitem identifier to action summary parameters."""
    try:
        from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

        issue_details = await get_issue_identifier_for_artifact(str(issue_id))
        if not issue_details or not isinstance(issue_details, dict):
            return

        # Ensure parameters structure exists
        params = action_summary.get("parameters", {})
        if not isinstance(params, dict):
            params = {}
            action_summary["parameters"] = params

        # Add workitem identifier
        identifier_value = issue_details.get("identifier")
        if identifier_value:
            workitem_block = params.setdefault("workitem", {})
            properties_block = workitem_block.setdefault("properties", {})
            properties_block["identifier"] = identifier_value

        # Add project identifier
        project_identifier = issue_details.get("project_identifier")
        if project_identifier:
            project_block = params.setdefault("project", {})
            project_block["identifier"] = project_identifier
    except Exception as e:
        log.warning(f"Error adding workitem identifier: {e}")


async def _add_project_identifier(action_summary: dict, cleaned_args: dict) -> None:
    """Add project identifier to action summary if available."""
    try:
        params = action_summary.get("parameters")
        if not isinstance(params, dict):
            return

        # Skip if already has identifier
        project_block = params.get("project")
        if isinstance(project_block, dict) and project_block.get("identifier"):
            return

        # Try to resolve from project_id (only when it's a valid UUID; skip placeholders/non-UUIDs)
        project_id = cleaned_args.get("project_id")
        if not project_id:
            return

        import re

        uuid_pattern = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
        if not (isinstance(project_id, str) and uuid_pattern.match(project_id)):
            # Placeholder or non-UUID provided (e.g., "<id of project: Malpe>") - skip enrichment here
            return

        from pi.app.api.v1.helpers.plane_sql_queries import get_project_details_for_artifact

        proj = await get_project_details_for_artifact(str(project_id))
        if proj and proj.get("identifier"):
            if "project" not in params:
                params["project"] = {}
            params["project"]["identifier"] = proj["identifier"]
    except Exception as e:
        log.warning(f"Error adding project identifier: {e}")


async def execute_action_with_retrieval(
    chatbot_instance,
    selected_agents,
    user_meta,
    workspace_id,
    workspace_slug,
    project_id,
    conversation_history,
    enhanced_conversation_history,  # 🆕 Enhanced context with action details
    user_id,
    chat_id,
    query_flow_store,
    combined_agent_query,
    query_id,
    step_order,
    db,
    reasoning_container=None,
    is_project_chat=None,
    pi_sidebar_open=None,
    sidebar_open_url=None,
) -> AsyncIterator[str]:
    """Execute action with access to retrieval tools"""
    try:
        # Resolve workspace_id from project_id if needed (for project-level chats)
        # This must happen BEFORE Phase 1 tools are built
        if not workspace_id and project_id:
            try:
                from pi.app.api.v1.helpers.plane_sql_queries import resolve_workspace_id_from_project_id

                resolved_workspace_id = await resolve_workspace_id_from_project_id(str(project_id))
                if resolved_workspace_id:
                    workspace_id = str(resolved_workspace_id)
                    log.info(f"ChatID: {chat_id} - Resolved workspace_id {workspace_id} from project_id {project_id} (Phase 1)")
            except Exception as e:
                log.error(f"ChatID: {chat_id} - Failed to resolve workspace_id from project_id {project_id}: {e}")

        clarification_requested = False
        clarification_payload: dict | None = None
        # ----- PHASE 1: Category Selection -----
        category_tools = await chatbot_instance._get_selected_tools(
            db,
            selected_agents,
            user_meta,
            workspace_id,
            workspace_slug,
            project_id,
            user_id,
            chat_id,
            query_flow_store,
            conversation_history,
            query_id,
            is_project_chat=is_project_chat,
            pi_sidebar_open=pi_sidebar_open,
            sidebar_open_url=sidebar_open_url,
        )
        # If only the OAuth consent tool is returned, invoke it directly
        if len(category_tools) == 1 and getattr(category_tools[0], "name", "") == "oauth_authorization_required":
            auth_tool = category_tools[0]
            auth_message = await auth_tool.ainvoke(combined_agent_query)

            # Just show OAuth message and return - let frontend handle the flow
            # Note: We don't store the OAuth message in the database since it's not part of the conversation history

            # Create a QUEUE flow step for the OAuth message to maintain the flow tracking
            # This ensures the stream-answer endpoint can find the proper flow step
            # Store complete ChatRequest-like data so stream-answer can process it directly
            async with get_streaming_db_session() as _subdb:
                flow_step_result = await _upsert_message_flow_steps(
                    message_id=query_id,
                    chat_id=chat_id,
                    flow_steps=[
                        {
                            "step_order": step_order,
                            "step_type": FlowStepType.TOOL.value,
                            "tool_name": "QUEUE",  # Use QUEUE so stream-answer can find it
                            "content": "OAuth authorization required",
                            "execution_data": {
                                "query": combined_agent_query,
                                "chat_id": str(chat_id),
                                "workspace_id": str(workspace_id) if workspace_id else "",
                                "workspace_slug": workspace_slug or "",
                                "project_id": str(project_id) if project_id else "",
                                "user_id": str(user_id),
                                "is_new": False,  # Not used anymore - using sequence-based check instead
                                "is_temp": False,
                                "workspace_in_context": True,
                                "is_project_chat": bool(project_id),
                                "enhanced_conversation_history": enhanced_conversation_history,
                                "llm": chatbot_instance.switch_llm
                                if hasattr(chatbot_instance, "switch_llm")
                                else "gpt-4.1",  # Use chatbot's LLM model
                                "context": user_meta or {"first_name": "", "last_name": ""},
                            },
                            "oauth_required": True,  # Use dedicated OAuth column
                            "is_planned": False,
                            "is_executed": False,
                            "execution_success": ExecutionStatus.PENDING,  # OAuth flow is pending
                        }
                    ],
                    db=_subdb,
                )

            if flow_step_result.get("message") != "success":
                log.warning(f"Failed to create OAuth flow step: {flow_step_result}")

            yield auth_message
            return

        if not category_tools:
            log.warning("Unable to initialize action tools. Please try again.")
            msg = "An unexpected error occurred. Please try again later."
            yield msg
            yield f"__FINAL_RESPONSE__{msg}"
            return

        current_step = step_order
        tool_flow_steps = []
        # Always initialize clarification context holder to avoid unbound variable
        clar_ctx: Dict[str, Any] = {}
        # Check if we are resuming after a clarification response; if so, skip category selection
        skip_category_selection = False
        selections_list: List[Union[ActionCategorySelection, Dict[str, Optional[str]]]] = []
        try:
            if isinstance(user_meta, dict) and user_meta.get("clarification_context"):
                clar_ctx = user_meta.get("clarification_context") or {}
                hint_list = clar_ctx.get("category_hints") or []

                answer_text = clar_ctx.get("answer_text")

                # Always try to recover previously selected categories from the saved clarification step
                prev_categories: List[str] = []
                try:
                    from pi.services.retrievers.pg_store.message import get_tool_results_from_chat_history as _get_steps

                    clar_steps = await _get_steps(db=db, chat_id=uuid.UUID(str(chat_id)), tool_name="ask_for_clarification")
                    if clar_steps:
                        last = clar_steps[0]
                        exec_data = getattr(last, "execution_data", {}) or {}
                        prev_categories = [str(c) for c in (exec_data.get("selected_categories") or []) if c]
                except Exception:
                    prev_categories = []

                # Union of hints and previously selected categories
                union_categories = list({*(str(h) for h in hint_list if h), *prev_categories})
                if union_categories:
                    skip_category_selection = True
                    selections_list = [{"category": c, "rationale": "from_clarification_resume"} for c in union_categories]
        except Exception:
            skip_category_selection = False

        if not skip_category_selection:
            # Directly call get_available_plane_actions tool without LLM
            category_tool = next((t for t in category_tools if hasattr(t, "name") and t.name == "get_available_plane_actions"), None)
            if not category_tool:
                available_tool_names = [t.name if hasattr(t, "name") else "unnamed" for t in category_tools]
                log.warning(f"Category selection tool not found. Available tools: {available_tool_names}")
                msg = "An unexpected error occurred. Please try again later."
                yield msg
                yield f"__FINAL_RESPONSE__{msg}"
                return

            # Execute category selection tool (advisory details like methods)
            try:
                # Directly invoke the tool with the user's intent
                advisory_text = await category_tool.ainvoke({"user_intent": combined_agent_query})

                # Track advisory tool selection
                tool_flow_steps.append({
                    "step_order": current_step,
                    "step_type": FlowStepType.TOOL,
                    "tool_name": "get_available_plane_actions",
                    "content": standardize_flow_step_content(advisory_text, FlowStepType.TOOL),
                    "execution_data": {"args": {"user_intent": combined_agent_query}},
                })
                current_step += 1
            except Exception as e:
                log.warning(f"Category selection failed: {str(e)}")
                msg = "An unexpected error occurred. Please try again later."
                yield msg
                yield f"__FINAL_RESPONSE__{msg}"
                return

            # Run LLM category router (multi-select) using advisory + user intent
            router_prompt_template = ChatPromptTemplate.from_messages([
                ("system", action_category_router_prompt),
                ("human", "{custom_prompt}"),
            ])
            custom_prompt = f"User intent: {combined_agent_query}\n\n" f"Advisory: {advisory_text}"
            # Prepend enhanced conversation history for better routing context if available
            if enhanced_conversation_history and isinstance(enhanced_conversation_history, str) and enhanced_conversation_history.strip():
                custom_prompt = f"CONVERSATION HISTORY & ACTION CONTEXT:\n{enhanced_conversation_history}\n\n" + custom_prompt

            # Request raw response for debugging
            action_router = chatbot_instance.decomposer_llm.with_structured_output(
                ActionCategoryRouting,
                include_raw=True,
                method="json_mode",
            )
            action_router.set_tracking_context(query_id, db, MessageMetaStepType.ACTION_CATEGORY_ROUTING, chat_id=str(chat_id))
            dynamic_action_router = router_prompt_template | action_router

            import time

            try:
                category_router_start = time.time()
                log.info(f"ChatID: {chat_id} - Starting action category router LLM call")
                routing = await dynamic_action_router.ainvoke({"custom_prompt": custom_prompt})
                category_router_elapsed = time.time() - category_router_start
                log.info(f"ChatID: {chat_id} - Action category router LLM call completed in {category_router_elapsed:.2f}s")

                # When include_raw=True, routing is a dict with keys: raw, parsed, parsing_error
                parsed_obj = routing
                if isinstance(routing, dict):
                    parsed_obj = routing.get("parsed")
                    # with contextlib.suppress(Exception):
                    # log.debug(f"ChatID: {chat_id} - Router raw message: {routing.get("raw")}")
                    # log.debug(f"ChatID: {chat_id} - Router parsing_error: {routing.get("parsing_error")}")

                if parsed_obj and getattr(parsed_obj, "selections", None):
                    selections_list = list(parsed_obj.selections)

                # Log router response for analysis
                with contextlib.suppress(Exception):
                    log.info(f"ChatID: {chat_id} - Action Category Router response selections: {selections_list}")
                    # log.debug(f"ChatID: {chat_id} - Raw router response: {routing}")
            except Exception as e:
                log.warning(f"Action category router failed: {e}")

            # If router returns empty list, it means the request is unsupported
            if not selections_list:
                log.info(f"ChatID: {chat_id} - Category router returned empty list - unsupported action request")

                # Provide user-friendly rejection message
                rejection_message = (
                    "I understand you'd like to perform this action, but I'm unable to fulfill this request with the available tools.\n\n"
                    "**I can help you with:** work-items (create, update, assign, move), projects (create, list, manage), "
                    "cycles (create, manage, add work-items), modules (create, manage, add work-items), "
                    "labels and states (create, update), create pages\n\n"
                    "Feel free to ask me about any of these supported actions, or let me know if you'd like help with something else!"
                )

                yield rejection_message
                yield f"__FINAL_RESPONSE__{rejection_message}"
                return

            # Persist router decision as a routing flow step
            # Normalize selections into serialisable dicts for persistence
            routing_content: List[Dict[str, Optional[str]]] = []
            for sel in selections_list:
                if isinstance(sel, ActionCategorySelection):
                    routing_content.append({
                        "category": sel.category,
                        "rationale": sel.rationale,
                    })
                elif isinstance(sel, dict):
                    routing_content.append({
                        "category": sel.get("category"),
                        "rationale": sel.get("rationale"),
                    })

            async with get_streaming_db_session() as _subdb:
                flow_step_result = await _upsert_message_flow_steps(
                    message_id=query_id,
                    chat_id=chat_id,
                    flow_steps=[
                        {
                            "step_order": current_step,
                            "step_type": FlowStepType.ROUTING.value,
                            "tool_name": "action_category_router",
                            "content": standardize_flow_step_content(routing_content, FlowStepType.ROUTING),
                            "execution_data": {"skip_category_selection": False, "enhanced_conversation_history": enhanced_conversation_history},
                        }
                    ],
                    db=_subdb,
                )
            if flow_step_result["message"] != "success":
                log.warning("Failed to record category routing in database")
            current_step += 1
        else:
            # Record that we skipped category selection due to clarification context
            async with get_streaming_db_session() as _subdb:
                flow_step_result = await _upsert_message_flow_steps(
                    message_id=query_id,
                    chat_id=chat_id,
                    flow_steps=[
                        {
                            "step_order": current_step,
                            "step_type": FlowStepType.ROUTING.value,
                            "tool_name": "action_category_router",
                            "content": standardize_flow_step_content(
                                [
                                    {"category": str(sel.get("category")) if isinstance(sel, dict) else str(getattr(sel, "category", ""))}
                                    for sel in selections_list
                                ],
                                FlowStepType.ROUTING,
                            ),
                            "execution_data": {
                                "skip_category_selection": True,
                                "source": "clarification",
                                "enhanced_conversation_history": enhanced_conversation_history,
                            },
                        }
                    ],
                    db=_subdb,
                )
            if flow_step_result.get("message") != "success":
                log.warning("Failed to record clarification-based routing in database")
            current_step += 1

        # ----- PHASE 2: Method Selection & Execution -----
        # Build tools across all selected categories

        # Get OAuth token for method executor (reuse from phase 1 - already validated)
        access_token = await chatbot_instance._get_oauth_token_for_user(db, user_id, workspace_id)

        # Build workspace context
        from pi.app.api.v1.helpers.plane_sql_queries import get_workspace_slug

        workspace_slug = await get_workspace_slug(workspace_id)

        # Normalize project_id: if a non-UUID value (e.g., project identifier like 'OGX') was
        # passed from the client context, resolve it to the actual project UUID so that
        # downstream entity search tools don't receive an invalid UUID.
        try:
            proj_str = str(project_id) if project_id else None
            is_uuid_like = False
            if proj_str:
                try:
                    uuid.UUID(proj_str)
                    is_uuid_like = True
                except Exception:
                    is_uuid_like = False

            if proj_str and not is_uuid_like:
                try:
                    from pi.app.api.v1.helpers.plane_sql_queries import get_project_id_from_identifier

                    resolved = await get_project_id_from_identifier(proj_str, str(workspace_id))
                    if resolved:
                        project_id = str(resolved)
                    else:
                        # If unresolved, drop project scope to avoid passing an invalid UUID
                        log.warning(
                            f"ChatID: {chat_id} - Received non-UUID project_id '{proj_str}'. Could not resolve identifier to UUID; omitting project scope from context."  # noqa: E501
                        )
                        project_id = None
                except Exception as _e:
                    log.warning(
                        f"ChatID: {chat_id} - Failed to resolve project identifier '{proj_str}' to UUID: {_e}. Omitting project scope from context."  # noqa: E501
                    )
                    project_id = None
        except Exception:
            # Defensive: never block the flow on normalization errors
            pass

        context = {
            "workspace_id": workspace_id,
            "workspace_slug": workspace_slug,
            "project_id": project_id,
            "user_id": user_id,
            "conversation_history": conversation_history,
            "user_meta": user_meta,
            "is_project_chat": is_project_chat,
        }

        # Create method executor
        if access_token and access_token.startswith("plane_api_"):
            actions_executor = PlaneActionsExecutor(api_key=access_token, base_url=settings.plane_api.HOST)
        else:
            actions_executor = PlaneActionsExecutor(access_token=access_token, base_url=settings.plane_api.HOST)

        method_executor = MethodExecutor(actions_executor)

        # Build method-specific tools for all selected categories
        all_method_tools = []
        built_categories = []
        for sel in selections_list:
            # Extract category from either pydantic object or dict
            cat: Optional[str]
            if isinstance(sel, ActionCategorySelection):
                cat = sel.category
            else:  # isinstance(sel, dict)
                cat = sel.get("category")

            if not cat or cat in built_categories:
                continue
            built_categories.append(cat)
            try:
                # During planning, augment category tools with category-scoped entity-search tools
                tools_for_cat = chatbot_instance._build_planning_method_tools(cat, method_executor, context)
                all_method_tools.extend(tools_for_cat)
            except Exception as e:
                log.warning(f"Failed to build tools for category {cat}: {e}")

        # Deduplicate method tools (entity search tools may appear in multiple categories)
        seen_tool_names = set()
        deduplicated_method_tools = []
        for tool in all_method_tools:
            if tool.name not in seen_tool_names:
                deduplicated_method_tools.append(tool)
                seen_tool_names.add(tool.name)

        # Include retrieval tools from phase-1 so the LLM can chain look-ups ↔ actions
        # Filter out the category selection tool and include all other tools
        # Phase-2: rebuild retrieval tools with the normalized project_id to ensure correct scoping
        fresh_retrieval_tools = chatbot_instance._create_tools(
            db,
            user_meta,
            workspace_id,
            project_id,
            user_id,
            chat_id,
            query_flow_store,
            conversation_history,
            query_id,
            is_project_chat=is_project_chat,
        )
        # Merge while preserving order and avoiding duplicates
        method_tool_names = {t.name for t in deduplicated_method_tools}
        combined_tools = deduplicated_method_tools + [t for t in fresh_retrieval_tools if t.name not in method_tool_names]
        if not combined_tools:
            log.warning("No method or retrieval tools available for selected categories")
            msg = "An unexpected error occurred. Please try again later."
            yield msg
            yield f"__FINAL_RESPONSE__{msg}"
            return

        # Build the planning prompt via shared helper, pass previously derived clar_ctx
        method_prompt = build_method_prompt(
            combined_agent_query,
            project_id,
            user_id,
            workspace_id,
            enhanced_conversation_history,
            clarification_context=clar_ctx,
        )

        date_time_context = await get_current_timestamp_context(user_id)
        method_prompt = f"{method_prompt}\n\n{date_time_context}"

        # Record the tool orchestration context (enhanced conversation history) before planning
        try:
            if enhanced_conversation_history and isinstance(enhanced_conversation_history, str) and enhanced_conversation_history.strip():
                tool_flow_steps.append({
                    "step_order": current_step,
                    "step_type": FlowStepType.TOOL.value,
                    "tool_name": "tool_orchestration_context",
                    "content": "Context used for method planning",
                    "execution_data": {
                        "enhanced_conversation_history": enhanced_conversation_history,
                        "agent_query": combined_agent_query,
                        "selected_categories": list(built_categories),
                        "available_tools_count": len(combined_tools),
                        "method_tool_names": [t.name for t in all_method_tools],
                        "bound_tool_names": [t.name for t in combined_tools],
                    },
                    "is_planned": False,
                    "is_executed": False,
                    "execution_success": ExecutionStatus.PENDING,
                })
                current_step += 1
        except Exception:
            pass

        # Log the full method planning prompt and context for debugging
        try:
            # Determine if this is a clarification follow-up (raw user input) or router-synthesized query
            is_clarification_followup = bool(user_meta and isinstance(user_meta, dict) and user_meta.get("clarification_context"))
            query_label = "Agent Query (raw user input from clarification)" if is_clarification_followup else "Agent Query (router-synthesized)"

            # Log comprehensive debugging information
            log.info(f"ChatID: {chat_id} - {query_label}: {combined_agent_query}")
            log.info(f"ChatID: {chat_id} - Selected Categories: {built_categories}")
            log.info(f"ChatID: {chat_id} - Available Tools Count: {len(combined_tools)}")
            try:
                tool_names_for_log = [t.name for t in combined_tools]
                log.info(f"ChatID: {chat_id} - Planning tools: {tool_names_for_log}")
            except Exception:
                pass

        except Exception as e:
            log.warning(f"ChatID: {chat_id} - Failed to log debug info: {e}")

        # Initialize messages for Phase 2 tool orchestration
        messages = [SystemMessage(content=method_prompt), HumanMessage(content=combined_agent_query)]

        # Log tools in readable format with argument schema details
        # log_toolset_details(combined_tools, chat_id)
        # Re-bind LLM with the full toolset (action methods + retrieval)
        llm_with_method_tools = chatbot_instance.tool_llm.bind_tools(combined_tools)

        # Set tracking context for method planning LLM calls
        llm_with_method_tools.set_tracking_context(query_id, db, MessageMetaStepType.ACTION_METHOD_PLANNING, chat_id=str(chat_id))

        # Continue iterative tool calling with method tools
        response = await llm_with_method_tools.ainvoke(messages)
        messages.append(response)

        # Log LLM's initial response for debugging
        log.info(f"ChatID: {chat_id} - LLM INITIAL RESPONSE")
        log.info(f"ChatID: {chat_id} - Has Tool Calls: {hasattr(response, "tool_calls") and bool(getattr(response, "tool_calls", None))}")

        # Log the complete LLM response for debugging
        try:
            response_content = str(getattr(response, "content", "") or "").strip()
            tool_calls = getattr(response, "tool_calls", None)

            log.info(f"ChatID: {chat_id} - LLM Response Content: {response_content}")
            # if tool_calls:
            #     log.info(f"ChatID: {chat_id} - LLM Tool Calls: {tool_calls}")
            # else:
            #     log.info(f"ChatID: {chat_id} - LLM Tool Calls: None")

            # Log the full response object for complete debugging
            try:
                import json

                response_dict = {
                    "content": response_content,
                    "tool_calls": tool_calls,
                    "response_metadata": getattr(response, "response_metadata", None),
                    "id": getattr(response, "id", None),
                    "usage_metadata": getattr(response, "usage_metadata", None),
                }
                log.info(f"ChatID: {chat_id} - Full LLM Response: {json.dumps(response_dict, default=str, indent=2)}")
            except Exception:
                log.info(f"ChatID: {chat_id} - Full LLM Response (raw): {response}")

        except Exception as e:
            log.warning(f"ChatID: {chat_id} - Failed to log LLM response: {e}")

        # Log planner decisions immediately (before flow step creation)
        try:
            if hasattr(response, "tool_calls") and getattr(response, "tool_calls", None):
                tool_calls_list = getattr(response, "tool_calls", []) or []
                tool_names = []
                for _tc in tool_calls_list:
                    if isinstance(_tc, dict):
                        tool_names.append(_tc.get("name", ""))
                    else:
                        tool_names.append(getattr(_tc, "name", ""))

                reasoning_text = str(getattr(response, "content", "") or "").strip()
                reason_preview = reasoning_text or "(none)"

                log.info(f"ChatID: {chat_id} - Planner selected tools: {tool_names}")
                log.info(f"ChatID: {chat_id} - Planner reasoning: {reason_preview}")
            else:
                # Log when no tool calls are made
                reasoning_text = str(getattr(response, "content", "") or "").strip()
                log.info(f"ChatID: {chat_id} - Planner selected tools: []")
                log.info(f"ChatID: {chat_id} - Planner reasoning (no tools): {reasoning_text}")
        except Exception as e:
            log.warning(f"ChatID: {chat_id} - Failed to log planner decisions: {e}")

        # Record planner decision for this response (selected tools + reasoning)
        try:
            if hasattr(response, "tool_calls") and getattr(response, "tool_calls", None):
                selected_calls: list[dict] = []
                for _tc in getattr(response, "tool_calls", []) or []:
                    if isinstance(_tc, dict):
                        _name = _tc.get("name", "")
                        _args = _tc.get("args", {})
                        _id = _tc.get("id", "")
                    else:
                        _name = getattr(_tc, "name", "")
                        _args = getattr(_tc, "args", {})
                        _id = getattr(_tc, "id", "")
                    selected_calls.append({"name": _name, "args": _args, "id": _id})

                reasoning_text = str(getattr(response, "content", "") or "").strip()

                tool_flow_steps.append({
                    "step_order": current_step,
                    "step_type": FlowStepType.TOOL,
                    "tool_name": "planner_tool_selection",
                    "content": standardize_flow_step_content({"selected_tool_calls": selected_calls, "reasoning": reasoning_text}, FlowStepType.TOOL),
                    "execution_data": {
                        "selected_tool_calls": selected_calls,
                        "reasoning": reasoning_text,
                    },
                    "is_planned": False,
                    "is_executed": False,
                    "execution_success": ExecutionStatus.PENDING,
                })
                current_step += 1
        except Exception:
            pass
        # Persist whether the initial LLM response had tool calls
        try:
            for _s in tool_flow_steps:
                if _s.get("tool_name") == "tool_orchestration_context":
                    _ed = _s.setdefault("execution_data", {})
                    _ed["initial_has_tool_calls"] = bool(getattr(response, "tool_calls", None))
                    break
        except Exception:
            pass
        # Handle iterative method tool calling until completion
        planned_actions: list = []
        planned_action_keys: set[str] = set()
        max_iterations = MAX_ACTION_EXECUTOR_ITERATIONS  # Safety limit to prevent infinite loops
        iteration_count = 0
        reminder_count = 0
        max_reminders = 3  # Limit consecutive reminders to prevent infinite loops
        loop_warning_detected = False

        # Continue the loop until either:
        # 1. No more tool calls are returned by the LLM, OR
        # 2. At least one action has been planned (to handle simple requests)
        # 3. Maximum iterations reached (safety check)
        loop_condition = (
            (hasattr(response, "tool_calls") and getattr(response, "tool_calls", None)) or len(planned_actions) == 0
        ) and iteration_count < max_iterations

        # Track tool calls to detect loops
        tool_call_history = []

        while loop_condition:
            iteration_count += 1
            tool_messages = []

            # If no tool calls in this response but we haven't planned any actions yet,
            # we need to continue to allow the LLM to plan at least one action
            if not (hasattr(response, "tool_calls") and getattr(response, "tool_calls", None)):
                # First, check if LLM explicitly returned NO_ACTIONS_PLANNED - if so, respect that decision
                if hasattr(response, "content") and response.content:
                    content = str(response.content).strip()
                    if content == "NO_ACTIONS_PLANNED":
                        log.info(f"ChatID: {chat_id} - LLM returned NO_ACTIONS_PLANNED - stopping iteration without reminders")
                        break

                # Check if we've exceeded reminder limit
                if reminder_count >= max_reminders:
                    log.warning(f"ChatID: {chat_id} - Maximum reminders ({max_reminders}) reached. Breaking loop to prevent infinite reminders.")
                    break

                reminder_count += 1
                log.info(f"Sending REMINDER {reminder_count}/{max_reminders} to LLM to plan modifying actions")
                # Add a reminder message to help the LLM understand it needs to plan actions
                reminder_message = SystemMessage(
                    content="REMINDER: You have only used retrieval/search tools so far. The user's request requires MODIFYING data (move/add/create/update/delete). You MUST now plan the actual MODIFYING ACTION using the appropriate tool."  # noqa: E501
                )
                messages.append(reminder_message)
                # Get next response from LLM to continue planning
                response = await llm_with_method_tools.ainvoke(messages)
                messages.append(response)
                continue
            else:
                # Reset reminder count when LLM provides tool calls
                reminder_count = 0

            # Execute all tool calls in this round
            log.info(f"ChatID: {chat_id} - Entering the for loop to execute selected tool calls in this iteration: {iteration_count}")
            for tool_call in getattr(response, "tool_calls", []):
                # Handle both dictionary and object access patterns for LangChain tool calls
                if isinstance(tool_call, dict):
                    tool_name = tool_call.get("name", "")
                    tool_args = tool_call.get("args", {})
                    tool_id = tool_call.get("id", "")
                else:
                    # Handle object access pattern
                    tool_name = getattr(tool_call, "name", "")
                    tool_args = getattr(tool_call, "args", {})
                    tool_id = getattr(tool_call, "id", "")

                # Additional validation: ensure we have a valid tool name
                if not tool_name or not isinstance(tool_name, str):
                    log.warning(f"Invalid tool name: {tool_name}, skipping tool call")
                    continue

                # Log each tool call execution for debugging
                log.info(f"ChatID: {chat_id} - EXECUTING TOOL: {tool_name} with args: {tool_args}")

                # Track tool calls to detect loops
                tool_call_signature = f"{tool_name}({tool_args})"
                tool_call_history.append(tool_call_signature)

                # Check for repeated identical calls (potential loop)
                if tool_call_history.count(tool_call_signature) > 2:
                    log.warning(
                        f"ChatID: {chat_id} - DETECTED LOOP: Tool {tool_name} called {tool_call_history.count(tool_call_signature)} times with same args: {tool_args}"  # noqa: E501
                    )  # noqa: E501
                    log.warning(f"ChatID: {chat_id} - Tool call history: {tool_call_history[-10:]}")  # Last 10 calls
                    loop_warning_detected = True

                # Special handling for no_actions_planned tool
                if tool_name == "no_actions_planned":
                    # Execute the tool to get the structured payload
                    tool_func = next((t for t in combined_tools if t.name == tool_name), None)
                    result = None
                    try:
                        if tool_func is not None:
                            if hasattr(tool_func, "ainvoke"):
                                result = await tool_func.ainvoke(tool_args)
                            else:
                                result = tool_func.invoke(tool_args)
                        else:
                            result = '{"reason": "Tool not found", "explanation": "", "token": "NO_ACTIONS_PLANNED"}'
                    except Exception as e:
                        log.warning(f"No actions planned tool execution failed: {e}")
                        result = '{"reason": "Tool execution failed", "explanation": "", "token": "NO_ACTIONS_PLANNED"}'

                    # Parse JSON payload best-effort
                    try:
                        no_actions_payload = json.loads(str(result)) if result else {}
                    except Exception:
                        no_actions_payload = {"reason": "Parse failed", "explanation": str(result), "token": "NO_ACTIONS_PLANNED"}

                    # Log the no actions decision
                    try:
                        reason = no_actions_payload.get("reason", "Unknown")
                        explanation = no_actions_payload.get("explanation", "")
                        log.info(f"ChatID: {chat_id} - LLM decided NO_ACTIONS_PLANNED: {reason}")
                        if explanation:
                            log.info(f"ChatID: {chat_id} - No actions explanation: {explanation}")
                    except Exception:
                        pass

                    # Add tool message for conversation continuity
                    tool_message = ToolMessage(content=str(result), tool_call_id=tool_id)
                    tool_messages.append(tool_message)

                    # Track flow step for no actions decision
                    tool_flow_steps.append({
                        "step_order": current_step,
                        "step_type": FlowStepType.TOOL,
                        "tool_name": "no_actions_planned",
                        "content": standardize_flow_step_content(no_actions_payload, FlowStepType.TOOL),
                        "execution_data": {
                            "args": tool_args,
                            "no_actions_payload": no_actions_payload,
                            "original_query": combined_agent_query,
                        },
                        "is_planned": False,
                        "is_executed": False,
                        "execution_success": ExecutionStatus.SUCCESS,
                    })
                    current_step += 1

                    # Set the response content to the token for downstream detection
                    response.content = "NO_ACTIONS_PLANNED"

                    # Clear further tool calls and break
                    response.tool_calls = [] if hasattr(response, "tool_calls") else None
                    break

                # Special handling for clarification tool
                elif tool_name == "ask_for_clarification":
                    # Execute the tool to get the structured payload
                    tool_func = next((t for t in combined_tools if t.name == tool_name), None)
                    result = None
                    try:
                        if tool_func is not None:
                            if hasattr(tool_func, "ainvoke"):
                                result = await tool_func.ainvoke(tool_args)
                            else:
                                result = tool_func.invoke(tool_args)
                        else:
                            result = "{}"
                    except Exception as e:
                        log.warning(f"Clarification tool execution failed: {e}")
                        result = "{}"

                    # Parse JSON payload best-effort
                    try:
                        clarification_payload = json.loads(str(result)) if result else {}
                    except Exception:
                        clarification_payload = {"raw": str(result)}

                    # Log clarification payload produced by LLM tool call
                    # try:
                    #     import json as _json

                    #     log.info(
                    #         f"{"*" * 100}\nChatID: {chat_id} - ASK_FOR_CLARIFICATION payload (LLM): {_json.dumps(clarification_payload, default=str)}\n{"*" * 100}"  # noqa: E501
                    #     )
                    # except Exception:
                    #     pass

                    # Add tool message for conversation continuity
                    tool_message = ToolMessage(content=str(result), tool_call_id=tool_id)
                    tool_messages.append(tool_message)

                    # Track flow step for clarification (audit only)
                    tool_flow_steps.append({
                        "step_order": current_step,
                        "step_type": FlowStepType.TOOL,
                        "tool_name": "ask_for_clarification",
                        "content": standardize_flow_step_content(clarification_payload, FlowStepType.TOOL),
                        "execution_data": {
                            "args": tool_args,
                            "clarification_payload": clarification_payload,
                            # Persist context for audit purposes only; the control flow relies on message_clarifications table
                            "selected_categories": list(built_categories) if "built_categories" in locals() else [],
                            "method_tool_names": [t.name for t in all_method_tools] if "all_method_tools" in locals() else [],
                            "bound_tool_names": [t.name for t in combined_tools] if "combined_tools" in locals() else [],
                            "original_query": combined_agent_query,
                        },
                        "is_planned": False,
                        "is_executed": False,
                        "execution_success": ExecutionStatus.PENDING,
                    })
                    current_step += 1

                    # Stream a dedicated clarification event block for the frontend to render a prompt UI
                    try:
                        yield f"πspecial clarification blockπ: {json.dumps(clarification_payload)}\n"
                    except Exception:
                        yield f"πspecial clarification blockπ: {str(result)}\n"

                    # Persist a message_clarifications row for deterministic follow-up handling
                    try:
                        from uuid import UUID

                        from pi.services.retrievers.pg_store.clarifications import create_clarification

                        clar_kind = "action" if ("all_method_tools" in locals() and all_method_tools) else "retrieval"
                        method_names = [t.name for t in all_method_tools] if "all_method_tools" in locals() else []
                        bound_names = [t.name for t in combined_tools] if "combined_tools" in locals() else []
                        categories = list(built_categories) if "built_categories" in locals() else []

                        log.info(
                            f"ChatID: {chat_id} - Creating clarification record: kind={clar_kind}, message_id={query_id}, categories={categories}"  # noqa: E501
                        )

                        # Use the current user message id (query_id) as the owning message for the clarification record.
                        # The assistant clarification message id is not available in this scope.
                        clar_id = await create_clarification(
                            db,
                            chat_id=UUID(str(chat_id)),
                            message_id=UUID(str(query_id)),
                            kind=clar_kind,
                            original_query=combined_agent_query,
                            payload=clarification_payload or {},
                            categories=[str(c) for c in categories],
                            method_tool_names=method_names,
                            bound_tool_names=bound_names,
                        )
                        log.info(f"ChatID: {chat_id} - Successfully created clarification record: id={clar_id}")
                    except Exception as e:
                        log.warning(f"ChatID: {chat_id} - Failed to create clarification record: {e}")

                    clarification_requested = True
                    # Break the loop immediately; we'll persist steps below and end the stream
                    # Clear tool_calls to exit safely after loop
                    response.tool_calls = [] if hasattr(response, "tool_calls") else None
                    break

                # Check if this is an action tool (not a retrieval tool)
                #
                # Tool Classification Logic:
                # 1. Standard retrieval tools: vector_search_tool, structured_db_tool, etc.
                # 2. Read-only operations: tools with patterns like _list, _retrieve, _get, _search
                # 3. Modifying operations: tools with patterns like _create, _update, _delete, _add, _remove, _archive, _unarchive
                # 4. Safety rule: if a tool has both read-only and modifying patterns, treat as modifying (safer)
                #
                # This ensures that operations like 'list_modules' don't require user approval,
                # while operations like 'create_workitem' still do.

                # Classify tool via shared helper
                _is_retrieval_tool, is_action_tool = classify_tool(tool_name)

                if is_action_tool:
                    # Convert tool call to the format expected by ActionSummaryGenerator
                    tool_call_dict = {"name": tool_name, "args": tool_args, "id": tool_id}

                    # Build context for entity resolution
                    action_context = {
                        "workspace_slug": workspace_slug,
                        "project_id": project_id,
                        "workspace_id": workspace_id,
                    }

                    # Preflight: ensure required fields exist before planning actions
                    try:
                        from .tool_utils import preflight_missing_required_fields

                        missing_required = preflight_missing_required_fields(tool_name, tool_args, action_context)
                    except Exception:
                        missing_required = []

                    # Attempt auto-resolution of common placeholders before asking for clarification
                    try:

                        def _extract_placeholder_name(val: str) -> tuple[str | None, str | None]:
                            if isinstance(val, str) and "<id of" in val and ":" in val and val.endswith(">"):
                                try:
                                    inner = val.strip("<>")  # id of project: Mattu
                                    parts = inner.split(":", 1)
                                    left = parts[0].strip()  # id of project
                                    right = parts[1].strip()  # Mattu
                                    # entity type is last token of left
                                    etype = left.split()[-1].strip()
                                    return etype, right
                                except Exception:
                                    return None, None
                            return None, None

                        async def _auto_resolve_project_id_if_needed() -> bool:
                            nonlocal tool_args
                            # Only for project-scoped actions
                            pid_val = tool_args.get("project_id") if isinstance(tool_args, dict) else None
                            etype, pname = _extract_placeholder_name(pid_val) if isinstance(pid_val, str) else (None, None)
                            if pname and (etype == "project" or etype is None):
                                # Find search_project_by_name tool
                                resolver = next((t for t in combined_tools if getattr(t, "name", "") == "search_project_by_name"), None)
                                if resolver:
                                    try:
                                        res = await resolver.ainvoke({"name": pname, "workspace_slug": workspace_slug})
                                        # Parse first id from Result: {...}
                                        m = re.search(r"\n\nResult:\s*(\{[\s\S]*?\})", str(res))
                                        if m:
                                            try:
                                                parsed = ast.literal_eval(m.group(1))
                                                if isinstance(parsed, dict):
                                                    cand = parsed.get("id") or parsed.get("project_id")
                                                    if isinstance(cand, str):
                                                        tool_args["project_id"] = cand
                                                        return True
                                            except Exception:
                                                pass
                                    except Exception:
                                        return False
                            # If not placeholder but a non-UUID string, try extracting a quoted name from the value
                            if isinstance(pid_val, str):
                                # Detect UUID quickly; if it's a UUID, skip
                                uuid_like = re.match(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", pid_val, flags=re.IGNORECASE)
                                if not uuid_like:
                                    # Try to extract 'Name' or "Name" from free text
                                    m_quote = re.search(r"'([^']+)'|\"([^\"]+)\"", pid_val)
                                    candidate = None
                                    if m_quote:
                                        candidate = m_quote.group(1) or m_quote.group(2)
                                    # As last resort, if string is short (<80 chars) and no quotes, use whole string
                                    if not candidate and len(pid_val) <= 80:
                                        candidate = pid_val.strip()
                                    if candidate:
                                        resolver = next((t for t in combined_tools if getattr(t, "name", "") == "search_project_by_name"), None)
                                        if resolver:
                                            try:
                                                res = await resolver.ainvoke({"name": candidate, "workspace_slug": workspace_slug})
                                                m = re.search(r"\n\nResult:\s*(\{[\s\S]*?\})", str(res))
                                                if m:
                                                    try:
                                                        parsed = ast.literal_eval(m.group(1))
                                                        if isinstance(parsed, dict):
                                                            cand = parsed.get("id") or parsed.get("project_id")
                                                            if isinstance(cand, str):
                                                                tool_args["project_id"] = cand
                                                                return True
                                                    except Exception:
                                                        pass
                                            except Exception:
                                                return False
                            return False

                        # If missing project_id (or it is a placeholder/non-uuid), try auto-resolve
                        if "project_id" in (missing_required or []):
                            did_resolve = await _auto_resolve_project_id_if_needed()
                            if not did_resolve and tool_name == "workitems_update":
                                # Derive project_id from issue_id when updating a work-item
                                try:
                                    issue_id_val = tool_args.get("issue_id") if isinstance(tool_args, dict) else None
                                    if isinstance(issue_id_val, str) and re.match(
                                        r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", issue_id_val, flags=re.IGNORECASE
                                    ):
                                        from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                                        ident_details = await get_issue_identifier_for_artifact(issue_id_val)
                                        if ident_details and isinstance(ident_details, dict):
                                            pid = ident_details.get("project_id")
                                            if isinstance(pid, str):
                                                tool_args["project_id"] = pid
                                                did_resolve = True
                                except Exception:
                                    pass

                            if did_resolve:
                                # Recompute missing fields
                                try:
                                    from .tool_utils import preflight_missing_required_fields as _pre

                                    missing_required = _pre(tool_name, tool_args, action_context)
                                except Exception:
                                    pass
                    except Exception:
                        pass

                    if missing_required:
                        clarification_result = await handle_missing_required_fields(
                            tool_name=tool_name,
                            tool_args=tool_args,
                            action_context=action_context,
                            missing_required=missing_required,
                            method_executor=method_executor,
                            workspace_slug=workspace_slug,
                            chat_id=chat_id,
                            tool_id=tool_id,
                            current_step=current_step,
                            combined_agent_query=combined_agent_query,
                            is_project_chat=is_project_chat,
                        )

                        if clarification_result:
                            clarification_payload = clarification_result["clarification_payload"]
                            clarification_tool_message: Optional[ToolMessage] = clarification_result.get("tool_message")
                            flow_step = clarification_result["flow_step"]

                            # Add tool message to conversation
                            if clarification_tool_message is not None:
                                tool_messages.append(clarification_tool_message)

                            # Track flow step for clarification
                            tool_flow_steps.append(flow_step)
                            current_step += 1

                        # Mark and stream clarification; stop orchestration early
                        clarification_requested = True
                        try:
                            yield f"πspecial clarification blockπ: {json.dumps(clarification_payload)}\n"
                        except Exception:
                            yield f"πspecial clarification blockπ: {str(clarification_payload)}\n"

                        # Persist a message_clarifications row for deterministic follow-up handling
                        try:
                            from pi.services.retrievers.pg_store.clarifications import create_clarification

                            clar_kind = "action"  # Preflight clarifications are always for actions
                            method_names = [t.name for t in all_method_tools] if "all_method_tools" in locals() else []
                            bound_names = [t.name for t in combined_tools] if "combined_tools" in locals() else []
                            categories = list(built_categories) if "built_categories" in locals() else []

                            log.info(
                                f"ChatID: {chat_id} - Creating clarification record (preflight): kind={clar_kind}, message_id={query_id}, categories={categories}"  # noqa: E501
                            )

                            # Use the current user message id (query_id) as the owning message for the clarification record.
                            clar_id = await create_clarification(
                                db,
                                chat_id=uuid.UUID(str(chat_id)),
                                message_id=uuid.UUID(str(query_id)),
                                kind=clar_kind,
                                original_query=combined_agent_query,
                                payload=clarification_payload or {},
                                categories=[str(c) for c in categories],
                                method_tool_names=method_names,
                                bound_tool_names=bound_names,
                            )
                            log.info(f"ChatID: {chat_id} - Successfully created clarification record (preflight): id={clar_id}")
                        except Exception as e:
                            log.warning(f"ChatID: {chat_id} - Failed to create clarification record (preflight): {e}")

                        # Clear further tool calls and break
                        response.tool_calls = [] if hasattr(response, "tool_calls") else None
                        break

                    # Generate action summary for user approval
                    action_summary = await ActionSummaryGenerator.generate_action_summary([tool_call_dict], db, context=action_context)
                    if action_summary:
                        # Add artifact_id to action_summary for consistent ID across planning and execution
                        artifact_id = str(uuid.uuid4())  # Generate dummy artifact ID for artifacts table (to be implemented)
                        action_summary["artifact_id"] = artifact_id
                        # Also include the planned sequence number for UI ordering
                        with contextlib.suppress(Exception):
                            action_summary["sequence"] = current_step

                        # Clean tool_args to remove non-UUID values that should be resolved during execution
                        cleaned_args = _clean_tool_args_for_storage(tool_args)

                        # Enhance action summary with complete data BEFORE streaming
                        # Pass tool_args (not cleaned_args) because we need the actual UUIDs
                        try:
                            # Add project identifier if available
                            await _add_project_identifier(action_summary, tool_args)

                            # Add workitem/epic complete data for update operations
                            await _enhance_action_summary_with_complete_data(action_summary, tool_name, tool_args)
                        except Exception as e:
                            log.warning(f"Error enhancing action summary before streaming: {e}")

                        # Suppress duplicate planned actions within a single planning session
                        try:
                            dupe_key = f"{tool_name}:{json.dumps(cleaned_args, sort_keys=True, default=str)}"
                        except Exception:
                            dupe_key = f"{tool_name}:{str(cleaned_args)}"
                        if dupe_key in planned_action_keys:
                            continue

                        # Build planning context from previous retrieval steps
                        planning_context = {
                            "original_query": combined_agent_query,
                            "planning_timestamp": datetime.datetime.utcnow().isoformat(),
                            "conversation_context": {
                                "has_conversation_history": len(conversation_history) > 0,
                                "previous_message_count": len(conversation_history),
                            },
                        }

                        # Capture retrieval results that informed this action planning
                        retrieval_context = []
                        for step in tool_flow_steps:
                            # Include retrieval steps from this planning session
                            if (
                                step.get("is_planned") is False  # Retrieval tools are not planned
                                and step.get("execution_data", {}).get("retrieval_result")
                            ):
                                retrieval_info = {
                                    "tool_name": step.get("tool_name"),
                                    "query": step.get("execution_data", {}).get("tool_query"),
                                    "result_preview": step.get("execution_data", {}).get("result_preview"),
                                    "execution_success": step.get("execution_success"),
                                }
                                # Include structured results if available
                                if step.get("execution_data", {}).get("structured_result"):
                                    retrieval_info["structured_data"] = step.get("execution_data", {}).get("structured_result")
                                retrieval_context.append(retrieval_info)

                        planning_context["retrieval_context"] = retrieval_context
                        planning_context["retrieval_steps_count"] = len(retrieval_context)
                        # Enhanced execution data for planned actions
                        enhanced_execution_data = {
                            "args": cleaned_args,
                            "args_raw": tool_args,
                            "action_summary": action_summary,
                            "tool_id": tool_id,
                            "artifact_id": artifact_id,  # Artifact ID for frontend
                            "planning_context": planning_context,  # Rich context for follow-ups,
                            "sequence": current_step,
                        }

                        # Create artifact record in database
                        try:
                            from pi.services.retrievers.pg_store.action_artifact import create_action_artifact

                            # Extract entity and action types from tool name
                            entity_type = _extract_entity_type_from_tool_name(tool_name)
                            action_type = _extract_action_type_from_tool_name(tool_name)

                            # Prepare artifact data using the enhanced execution data
                            artifact_data = {
                                "planning_data": action_summary,
                                "tool_args": cleaned_args,
                                "tool_args_raw": tool_args,
                                "planning_context": planning_context,
                                "tool_id": tool_id,
                            }

                            # Inject artifact_sub_type into planning_data.parameters for add/remove container operations
                            try:
                                if isinstance(action_summary, dict):
                                    tn = action_summary.get("tool_name", "")
                                    if isinstance(tn, str) and "_" in tn:
                                        parts = tn.split("_")
                                        if len(parts) > 2:
                                            action_word = parts[1]
                                            if action_word in ("add", "remove"):
                                                tail = "_".join(parts[2:])
                                                sub_type = None
                                                if tail in ("work_items", "work_item"):
                                                    sub_type = "workitem"
                                                elif isinstance(tail, str) and len(tail) > 1 and tail.endswith("s"):
                                                    sub_type = tail[:-1]
                                                elif tail:
                                                    sub_type = tail

                                                if sub_type:
                                                    params = action_summary.get("parameters")
                                                    if not isinstance(params, dict):
                                                        params = {}
                                                        action_summary["parameters"] = params
                                                    if "artifact_sub_type" not in params:
                                                        params["artifact_sub_type"] = sub_type

                                                    # Normalize container properties keys for persisted planning_data
                                                    try:
                                                        # Determine container entity key from previously derived entity_type
                                                        container_key = entity_type if isinstance(entity_type, str) else None
                                                        if container_key and isinstance(params.get(container_key), dict):
                                                            container_block = params.get(container_key)
                                                            properties_block = (
                                                                container_block.get("properties") if isinstance(container_block, dict) else None
                                                            )
                                                            if isinstance(properties_block, dict):
                                                                # Rename issues -> workitem for workitem subtype
                                                                if (
                                                                    sub_type == "workitem"
                                                                    and "issues" in properties_block
                                                                    and "workitem" not in properties_block
                                                                ):
                                                                    properties_block["workitem"] = properties_block.pop("issues")
                                                                # Convert issue_id -> workitem list when feasible
                                                                if (
                                                                    sub_type == "workitem"
                                                                    and "issue_id" in properties_block
                                                                    and "workitem" not in properties_block
                                                                ):
                                                                    single_val = properties_block.get("issue_id")
                                                                    normalized_list = []
                                                                    if isinstance(single_val, dict):
                                                                        if "id" in single_val or "name" in single_val:
                                                                            # Keep only commonly used fields
                                                                            entry = {}
                                                                            if "id" in single_val:
                                                                                entry["id"] = single_val["id"]
                                                                            if "name" in single_val:
                                                                                entry["name"] = single_val["name"]
                                                                            if "identifier" in single_val:
                                                                                entry["identifier"] = single_val["identifier"]
                                                                            if entry:
                                                                                normalized_list.append(entry)
                                                                        else:
                                                                            normalized_list.append({"name": str(single_val)})
                                                                    elif single_val is not None:
                                                                        normalized_list.append({"name": str(single_val)})
                                                                    if normalized_list:
                                                                        properties_block["workitem"] = normalized_list
                                                    except Exception:
                                                        pass
                            except Exception:
                                # Non-fatal enrichment
                                pass

                            # Create the artifact record
                            artifact_result = await create_action_artifact(
                                db=db,
                                chat_id=chat_id,
                                entity=entity_type,
                                action=action_type,
                                data=artifact_data,
                                message_id=query_id,
                                sequence=current_step,
                                is_executed=False,
                            )

                            if artifact_result["message"] == "success":
                                # Update artifact_id to use the actual database ID
                                actual_artifact_id = str(artifact_result["artifact"].id)
                                enhanced_execution_data["artifact_id"] = actual_artifact_id
                                action_summary["artifact_id"] = actual_artifact_id

                            else:
                                log.error(f"Failed to create artifact for {tool_name}: {artifact_result.get("error")}")

                        except Exception as e:
                            log.error(f"Error creating artifact for {tool_name}: {e}")
                            # Continue with dummy artifact_id if creation fails

                        # Store planned action in flow steps for later execution
                        planned_action_data = {
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL,
                            "tool_name": tool_name,
                            "content": standardize_flow_step_content(action_summary, FlowStepType.TOOL),
                            "execution_data": enhanced_execution_data,
                            "is_executed": False,
                            "is_planned": True,  # This is a planned action that requires user approval
                            "execution_success": ExecutionStatus.PENDING,  # Not yet attempted
                        }
                        tool_flow_steps.append(planned_action_data)
                        planned_actions.append(action_summary)
                        planned_action_keys.add(dupe_key)

                        # Yield action summary for user approval
                        yield ActionSummaryGenerator.format_for_streaming(action_summary, str(query_id))
                        # yield "\n"

                        # Create a tool message to satisfy LLM conversation flow
                        # This indicates the action was planned rather than executed
                        tool_message = ToolMessage(
                            content=f"Action '{action_summary["action"]}' has been planned for user approval. The action will be executed after user confirmation.",  # noqa: E501
                            tool_call_id=tool_id,
                        )
                        tool_messages.append(tool_message)

                        current_step += 1
                    else:
                        # If action summary generation failed, we still need to create a tool message
                        # to satisfy the LLM conversation flow
                        tool_message = ToolMessage(content=f"Failed to generate action summary for {tool_name}", tool_call_id=tool_id)
                        tool_messages.append(tool_message)
                        current_step += 1
                else:
                    # For non-action tools (like retrieval), execute immediately
                    user_friendly_tool_name = chatbot_instance._tool_name_shown_to_user(tool_name)

                    # Yield execution message as reasoning block for flow tracking
                    # Include the tool arguments to show what query is being executed
                    tool_query = _format_tool_query_for_display(tool_name, tool_args, combined_agent_query)
                    yield f"πspecial reasoning blockπ: 🔧 Executing: {user_friendly_tool_name}: {tool_query}\n\n"

                    # Find and execute the tool
                    tool_func = next((t for t in combined_tools if t.name == tool_name), None)
                    if tool_func:
                        execution_success = ExecutionStatus.SUCCESS
                        execution_error = None

                        try:
                            # Try async invoke first, fall back to sync if needed
                            if hasattr(tool_func, "ainvoke"):
                                result = await tool_func.ainvoke(tool_args)
                            else:
                                result = tool_func.invoke(tool_args)

                            # Log tool result for debugging (truncate to keep logs sane)
                            try:
                                _result_preview = str(result)
                                if len(_result_preview) > 2000:
                                    _result_preview = _result_preview[:2000] + "... [truncated]"
                                log.info(f"ChatID: {chat_id} - TOOL RESULT ({tool_name}): {_result_preview}")
                            except Exception:
                                pass

                            # Create tool message for conversation continuity
                            tool_message = ToolMessage(content=str(result), tool_call_id=tool_id)
                            tool_messages.append(tool_message)

                        except Exception as tool_error:
                            log.warning(f"Tool execution failed: {str(tool_error)}")
                            result = f"Error: {str(tool_error)}"
                            execution_success = ExecutionStatus.FAILED
                            execution_error = str(tool_error)
                            tool_message = ToolMessage(content=str(result), tool_call_id=tool_id)
                            tool_messages.append(tool_message)

                        # Track the tool execution with enhanced context storage
                        enhanced_execution_data = {
                            "args": tool_args,
                            "retrieval_result": str(result),  # Store the actual retrieval result
                            "tool_query": tool_query,  # Store the query that was executed
                            "execution_timestamp": datetime.datetime.utcnow().isoformat(),
                        }

                        # Parse and store structured data if possible
                        try:
                            # Try to extract structured information from result
                            if hasattr(result, "__dict__"):
                                # For structured objects, store key attributes
                                enhanced_execution_data["structured_result"] = {
                                    key: value
                                    for key, value in result.__dict__.items()
                                    if not key.startswith("_") and isinstance(value, (str, int, float, bool, list, dict))
                                }
                            elif isinstance(result, dict):
                                enhanced_execution_data["structured_result"] = result
                            elif isinstance(result, list) and len(result) > 0:
                                enhanced_execution_data["result_count"] = len(result)
                                # Store first few items as examples
                                enhanced_execution_data["result_preview"] = result[:3] if len(result) > 3 else result
                        except Exception as parse_error:
                            log.debug(f"Could not parse structured result for {tool_name}: {parse_error}")

                        tool_flow_steps.append({
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL,
                            "tool_name": tool_name,
                            "content": standardize_flow_step_content(result, FlowStepType.TOOL),
                            "execution_data": enhanced_execution_data,
                            "is_executed": False,  # Retrieval tools are not "executed" by user - they run automatically
                            "is_planned": False,  # Retrieval tools are automatically executed, not planned
                            "execution_success": execution_success,
                            "execution_error": execution_error,
                        })
                        current_step += 1
                    else:
                        # Don't show tool not found errors to user - keep it internal
                        log.warning(f"Tool {tool_name} not found")
                        tool_message = ToolMessage(content=f"Tool {tool_name} not found", tool_call_id=tool_id)
                        tool_messages.append(tool_message)

            # If clarification was requested, stop further planning
            if clarification_requested:
                break

            # Add tool results to conversation and continue
            messages.extend(tool_messages)
            # Get next response from LLM
            response = await llm_with_method_tools.ainvoke(messages)

            messages.append(response)

            # Log the complete LLM response for this iteration
            try:
                response_content = str(getattr(response, "content", "") or "").strip()
                tool_calls = getattr(response, "tool_calls", None)

                log.info(f"ChatID: {chat_id} - LLM Response Content (iteration {iteration_count}): {response_content}")
                if tool_calls:
                    log.info(f"ChatID: {chat_id} - LLM Tool Calls (iteration {iteration_count}): {tool_calls}")
                else:
                    log.info(f"ChatID: {chat_id} - LLM Tool Calls (iteration {iteration_count}): None")

            except Exception as e:
                log.warning(f"ChatID: {chat_id} - Failed to log LLM response for iteration {iteration_count}: {e}")

            # Log planner decisions for this iteration
            try:
                if hasattr(response, "tool_calls") and getattr(response, "tool_calls", None):
                    tool_calls_list = getattr(response, "tool_calls", []) or []
                    tool_names = []
                    for _tc in tool_calls_list:
                        if isinstance(_tc, dict):
                            tool_names.append(_tc.get("name", ""))
                        else:
                            tool_names.append(getattr(_tc, "name", ""))

                    reasoning_text = str(getattr(response, "content", "") or "").strip()
                    reason_preview = reasoning_text or "(none)"

                    log.info(f"ChatID: {chat_id} - Planner selected tools (iteration {iteration_count}): {tool_names}")
                    log.info(f"ChatID: {chat_id} - Planner reasoning (iteration {iteration_count}): {reason_preview}")
                else:
                    # Log when no tool calls are made in iteration
                    reasoning_text = str(getattr(response, "content", "") or "").strip()
                    log.info(f"ChatID: {chat_id} - Planner selected tools (iteration {iteration_count}): []")
                    log.info(f"ChatID: {chat_id} - Planner reasoning (iteration {iteration_count}, no tools): {reasoning_text}")
            except Exception as e:
                log.warning(f"ChatID: {chat_id} - Failed to log planner decisions for iteration {iteration_count}: {e}")

            # Record planner decision for this iteration (selected tools + reasoning)
            try:
                if hasattr(response, "tool_calls") and getattr(response, "tool_calls", None):
                    for _tc in getattr(response, "tool_calls", []) or []:
                        if isinstance(_tc, dict):
                            _name = _tc.get("name", "")
                            _args = _tc.get("args", {})
                            _id = _tc.get("id", "")
                        else:
                            _name = getattr(_tc, "name", "")
                            _args = getattr(_tc, "args", {})
                            _id = getattr(_tc, "id", "")
                        selected_calls.append({"name": _name, "args": _args, "id": _id})

                    reasoning_text = str(getattr(response, "content", "") or "").strip()

                    tool_flow_steps.append({
                        "step_order": current_step,
                        "step_type": FlowStepType.TOOL,
                        "tool_name": "planner_tool_selection",
                        "content": standardize_flow_step_content(
                            {"selected_tool_calls": selected_calls, "reasoning": reasoning_text}, FlowStepType.TOOL
                        ),
                        "execution_data": {
                            "iteration": iteration_count,
                            "selected_tool_calls": selected_calls,
                            "reasoning": reasoning_text,
                        },
                        "is_planned": False,
                        "is_executed": False,
                        "execution_success": ExecutionStatus.PENDING,
                    })
                    current_step += 1
            except Exception:
                pass

            # Update loop condition for next iteration
            loop_condition = (
                (hasattr(response, "tool_calls") and getattr(response, "tool_calls", None)) or len(planned_actions) == 0
            ) and iteration_count < max_iterations

        # Log why the tool selection loop exited
        if clarification_requested:
            # Persist any steps recorded so far (including clarification)
            if tool_flow_steps:
                with contextlib.suppress(Exception):
                    async with get_streaming_db_session() as _subdb:
                        await _upsert_message_flow_steps(
                            message_id=query_id,
                            chat_id=chat_id,
                            flow_steps=tool_flow_steps,
                            db=_subdb,
                        )
            # End stream without free-form content
            yield "__FINAL_RESPONSE__"
            return
        elif iteration_count >= max_iterations:
            log.warning(f"Tool selection loop exited due to maximum iterations ({max_iterations}) reached")
            if len(planned_actions) == 0:
                # Signal failure and stop before emitting any free-form LLM content
                msg = "An unexpected error occurred. Please try again later."
                yield msg
                # Persist any retrieval steps captured so far
                # Append planning summary before persisting steps
                try:
                    tool_flow_steps.append({
                        "step_order": current_step,
                        "step_type": FlowStepType.TOOL,
                        "tool_name": "planner_summary",
                        "content": "Method planning summary",
                        "execution_data": {
                            "iteration_count": iteration_count,
                            "planned_actions_count": len(planned_actions),
                            "loop_warning_detected": loop_warning_detected,
                            "tool_calls_count": len(tool_call_history),
                            "no_actions_planned": True,
                        },
                        "is_planned": False,
                        "is_executed": False,
                        "execution_success": ExecutionStatus.SUCCESS,
                    })
                    current_step += 1
                except Exception:
                    pass
                if tool_flow_steps:
                    with contextlib.suppress(Exception):
                        async with get_streaming_db_session() as _subdb:
                            await _upsert_message_flow_steps(
                                message_id=query_id,
                                chat_id=chat_id,
                                flow_steps=tool_flow_steps,
                                db=_subdb,
                            )
                # Do not include free-form content; end stream
                yield f"__FINAL_RESPONSE__{msg}"
                return
        elif len(planned_actions) == 0:
            log.warning("Tool selection loop exited without planning any actions - checking for LLM explanation")

            # Check if LLM provided meaningful explanation for why no actions were planned
            llm_explanation = None
            if hasattr(response, "content") and response.content:
                content = str(response.content).strip()
                # If LLM provided actual explanation (not just the NO_ACTIONS_PLANNED token), use it
                if content and content != "NO_ACTIONS_PLANNED":
                    llm_explanation = content
                    log.info(f"ChatID: {chat_id} - Using LLM explanation for no-action scenario: {llm_explanation[:100]}...")

            # Use LLM explanation if available, otherwise show generic refusal
            if llm_explanation:
                # LLM provided context-aware explanation (e.g., "no unassigned items found")
                yield mask_uuids_in_text(llm_explanation) + "\n"
                yield f"__FINAL_RESPONSE__{llm_explanation}"
            else:
                # No meaningful LLM explanation - show generic refusal
                refusal_message = (
                    "I understand you'd like to perform this action, but I wasn't able to plan any actions for this request with the available tools.\n\n"  # noqa: E501
                    "**I can help you with:** work-items (create, update, assign, move), projects (create, list, manage), "
                    "cycles (create, manage, add work-items), modules (create, manage, add work-items), "
                    "labels and states (create, update), create pages\n\n"
                    "Feel free to ask me about any of these supported actions, or let me know if you'd like help with something else!"
                )
                yield refusal_message
                yield f"__FINAL_RESPONSE__{refusal_message}"

            # Persist any retrieval steps captured so far
            # Append planning summary before persisting steps
            try:
                tool_flow_steps.append({
                    "step_order": current_step,
                    "step_type": FlowStepType.TOOL,
                    "tool_name": "planner_summary",
                    "content": "Method planning summary",
                    "execution_data": {
                        "iteration_count": iteration_count,
                        "planned_actions_count": len(planned_actions),
                        "loop_warning_detected": loop_warning_detected,
                        "tool_calls_count": len(tool_call_history),
                        "no_actions_planned": len(planned_actions) == 0,
                        "exited_due_to_max_iterations": True,
                    },
                    "is_planned": False,
                    "is_executed": False,
                    "execution_success": ExecutionStatus.SUCCESS,
                })
                current_step += 1
            except Exception:
                pass
            if tool_flow_steps:
                with contextlib.suppress(Exception):
                    async with get_streaming_db_session() as _subdb:
                        await _upsert_message_flow_steps(
                            message_id=query_id,
                            chat_id=chat_id,
                            flow_steps=tool_flow_steps,
                            db=_subdb,
                        )
            return
        else:
            log.debug(f"Tool selection loop completed successfully after {iteration_count} iterations with {len(planned_actions)} planned actions")

        # Handle final response content
        final_response_chunks = []

        if hasattr(response, "content") and response.content:
            content = str(response.content).strip()

            # Check if LLM returned NO_ACTIONS_PLANNED token
            if content == "NO_ACTIONS_PLANNED":
                # Track explicit no-actions token in flow steps
                try:
                    tool_flow_steps.append({
                        "step_order": current_step,
                        "step_type": FlowStepType.TOOL,
                        "tool_name": "planner_no_actions",
                        "content": "NO_ACTIONS_PLANNED",
                        "execution_data": {
                            "reasoning": None,
                            "iteration_count": iteration_count,
                        },
                        "is_planned": False,
                        "is_executed": False,
                        "execution_success": ExecutionStatus.SUCCESS,
                    })
                    current_step += 1
                    log.info(f"ChatID: {chat_id} - Planner returned NO_ACTIONS_PLANNED token")
                except Exception:
                    pass
                # Convert to a more user-friendly message - pure LLM decision
                friendly_response = (
                    "I understand you'd like to perform an action, but I wasn't able to plan any actions for this request with the available tools.\n\n"  # noqa: E501
                    "**What you can try instead:**\n"
                    "1. Try rephrasing your request with more specific action words (create, update, move, assign, etc.)\n"
                    "2. Break down complex requests into smaller, specific actions\n"
                    "3. Ask me to search for existing items first, then perform actions on them\n\n"
                    "**I can help you with:** work-items (create, update, assign, move), projects (create, list, manage), "  # noqa: E501
                    "cycles (create, manage, add work-items), modules (create, manage, add work-items), "
                    "labels and states (create, update), create pages\n\n"
                    "Feel free to ask me about any of these supported actions, or let me know if you'd like help with something else!"  # noqa: E501
                )
                final_response_chunks.append(friendly_response + "\n")
                yield friendly_response + "\n"
            else:
                final_response_chunks.append(content + "\n")
                yield mask_uuids_in_text(content) + "\n"
        else:
            content = "Planned these actions for you"
            final_response_chunks.append(content + "\n")
            yield content + "\n"

        # Record tool executions in database
        # Append planning summary before persisting steps
        try:
            tool_flow_steps.append({
                "step_order": current_step,
                "step_type": FlowStepType.TOOL,
                "tool_name": "planner_summary",
                "content": "Method planning summary",
                "execution_data": {
                    "iteration_count": iteration_count,
                    "planned_actions_count": len(planned_actions),
                    "loop_warning_detected": loop_warning_detected,
                    "tool_calls_count": len(tool_call_history),
                    "no_actions_planned": (len(planned_actions) == 0)
                    or (hasattr(response, "content") and str(getattr(response, "content")).strip() == "NO_ACTIONS_PLANNED"),
                },
                "is_planned": False,
                "is_executed": False,
                "execution_success": ExecutionStatus.SUCCESS,
            })
            current_step += 1
        except Exception:
            pass
        if tool_flow_steps:
            async with get_streaming_db_session() as _subdb:
                flow_step_result = await _upsert_message_flow_steps(
                    message_id=query_id,
                    chat_id=chat_id,
                    flow_steps=tool_flow_steps,
                    db=_subdb,
                )

            if flow_step_result["message"] != "success":
                log.warning("Failed to record action execution in database")

        # Return the complete response for storage in chat history
        if final_response_chunks:
            # Yield a special signal that can be detected by the calling function
            # This follows the same pattern as response_processor.py
            final_response = "".join(final_response_chunks)
            yield f"__FINAL_RESPONSE__{final_response}"
        else:
            # Signal end without free-form content
            yield "__FINAL_RESPONSE__"

    except Exception:
        # Log full traceback for diagnosis
        log.error(f"ChatID: {chat_id} - Error in action execution", exc_info=True)
        # Emit user-friendly error and final response so caller can persist
        error_msg = "An unexpected error occurred. Please try again later."
        try:
            yield error_msg
            yield f"__FINAL_RESPONSE__{error_msg}"
        except Exception:
            # Best effort; if streaming breaks here, nothing else we can do
            pass
        return
