"""Action execution logic with retrieval tools."""

import contextlib
import json
from collections.abc import AsyncIterator
from typing import Any
from typing import Dict
from typing import Optional
from typing import Sequence
from typing import Union
from typing import cast

from langchain_core.messages import HumanMessage
from langchain_core.messages import SystemMessage

from pi import logger
from pi import settings
from pi.app.models.enums import MessageMetaStepType
from pi.core.db.plane_pi.lifecycle import get_streaming_db_session
from pi.services.chat.utils import get_current_timestamp_context
from pi.services.chat.utils import reasoning_dict_maker
from pi.services.retrievers.pg_store.message import upsert_message_flow_steps as _upsert_message_flow_steps
from pi.services.schemas.chat import ActionCategorySelection

from .helpers.build_mode_helpers import TOOL_NAME_TO_CATEGORY_MAP
from .helpers.build_mode_helpers import auto_resolve_missing_ids
from .helpers.build_mode_helpers import build_advisory_tool_step
from .helpers.build_mode_helpers import build_and_stream_final_response
from .helpers.build_mode_helpers import build_method_executor_and_context
from .helpers.build_mode_helpers import build_planner_summary_step
from .helpers.build_mode_helpers import build_planner_tool_selection_step
from .helpers.build_mode_helpers import build_planning_tools
from .helpers.build_mode_helpers import build_tool_orchestration_context_step
from .helpers.build_mode_helpers import enrich_tool_query_for_display
from .helpers.build_mode_helpers import execute_and_persist_clarification
from .helpers.build_mode_helpers import execute_retrieval_tool_and_build_step
from .helpers.build_mode_helpers import handle_preflight_clarification
from .helpers.build_mode_helpers import persist_skip_category_selection_step
from .helpers.build_mode_helpers import plan_action_and_prepare_outputs
from .helpers.build_mode_helpers import recover_clarification_categories
from .helpers.build_mode_helpers import run_category_router_and_persist
from .helpers.build_mode_helpers import selected_action_categories_display
from .helpers.tool_utils import build_method_prompt
from .helpers.tool_utils import classify_tool
from .helpers.tool_utils import format_tool_message_for_display
from .helpers.tool_utils import format_tool_query_for_display
from .helpers.tool_utils import preflight_missing_required_fields
from .helpers.tool_utils import stream_content_in_chunks
from .helpers.tool_utils import tool_name_shown_to_user

# from .tool_utils import log_toolset_details

log = logger.getChild(__name__)

MAX_ACTION_EXECUTOR_ITERATIONS = settings.chat.MAX_ACTION_EXECUTOR_ITERATIONS


async def execute_tools_for_build_mode(
    chatbot_instance,
    selected_tools,
    user_meta,
    workspace_id,
    workspace_slug,
    project_id,
    conversation_history,
    enhanced_conversation_history,  # 🆕 Enhanced context with action details
    user_id,
    chat_id,
    query_flow_store,
    combined_tool_query,
    query_id,
    step_order,
    db,
    reasoning_container=None,
    is_project_chat=None,
    pi_sidebar_open=None,
    sidebar_open_url=None,
) -> AsyncIterator[Union[str, Dict[str, Any]]]:
    """
    Execute action planner with access to retrieval tools
    Steps:
    1. Category Selection (Programmatic + LLM Router)
    2. Method Planning & Execution
    3. Tool Execution
    4. Final Response
    """
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

        # Build sdk method caller (executor) early for both Phase 1 (advisory) and Phase 2 (planning)
        method_executor, context, workspace_slug = await build_method_executor_and_context(
            chatbot_instance=chatbot_instance,
            user_id=user_id,
            workspace_id=workspace_id,
            project_id=project_id,
            conversation_history=conversation_history,
            user_meta=user_meta,
            is_project_chat=is_project_chat,
            chat_id=chat_id,
            db=db,
        )
        # Update project_id from normalized context
        project_id = context["project_id"]

        current_step = step_order
        tool_flow_steps = []

        # Check if resuming after clarification and recover categories
        selections_list: Sequence[Union[ActionCategorySelection, Dict[str, Optional[str]]]]
        skip_category_selection, selections_list, clar_ctx = await recover_clarification_categories(
            user_meta=user_meta,
            chat_id=chat_id,
            db=db,
        )

        if not skip_category_selection:
            # ----- PHASE 1: Category Selection (Programmatic + LLM Router) -----
            # Yield early reasoning chunk to provide immediate feedback (similar to ask mode)
            stage = "build_beginning"
            content = ""
            reasoning_chunk_dict = reasoning_dict_maker(stage=stage, tool_name="", tool_query="", content=content)
            if reasoning_container is not None:
                reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]

            ## change point: "πspecial reasoning blockπ:
            yield reasoning_chunk_dict

            # Advisory step (direct function call, not tool invocation)
            try:
                advisory_text, advisory_step, current_step = await build_advisory_tool_step(
                    combined_tool_query=combined_tool_query,
                    current_step=current_step,
                )
                tool_flow_steps.append(advisory_step)
            except Exception as e:
                log.warning(f"Category advisory generation failed: {str(e)}")
                msg = "An unexpected error occurred. Please try again later."
                yield msg
                yield f"__FINAL_RESPONSE__{msg}"
                return

            # Router and persistence (LLM call)
            selections_list, current_step = await run_category_router_and_persist(
                chatbot_instance=chatbot_instance,
                advisory_text=advisory_text,
                combined_tool_query=combined_tool_query,
                enhanced_conversation_history=enhanced_conversation_history,
                query_id=query_id,
                chat_id=chat_id,
                current_step=current_step,
                db=db,
            )
            # Stream category routing decisions as reasoning for frontend visibility
            try:
                if selections_list:
                    try:
                        content = selected_action_categories_display(selections_list)
                        stage = "selected_action_categories"
                        reasoning_chunk_dict = reasoning_dict_maker(stage=stage, tool_name="", tool_query="", content=content)
                        if reasoning_container is not None:
                            reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]

                        ## change point: "πspecial reasoning blockπ:
                        yield reasoning_chunk_dict

                    except Exception as e:
                        log.info(f"ChatID: {chat_id} - Error in reasoning chunk creation in selected_action_categories: {e}", exc_info=True)
                        pass

            except Exception as e:
                log.info(f"ChatID: {chat_id} - Error in advisory step in selected_action_categories: {e}", exc_info=True)
                pass
            if not selections_list:
                log.info(f"ChatID: {chat_id} - Category router returned empty list - unsupported action request")

        else:
            # Record that we skipped category selection due to clarification context
            # Yield early reasoning chunk for clarification follow-ups

            stage = "actions_clarification_followup"

            content = ""
            reasoning_chunk_dict = reasoning_dict_maker(stage=stage, tool_name="", tool_query="", content=content)
            if reasoning_container is not None:
                reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]

            ## change point: "πspecial reasoning blockπ:
            yield reasoning_chunk_dict

            current_step = await persist_skip_category_selection_step(
                selections_list=cast(Sequence[Dict[str, Optional[str]]], selections_list),
                current_step=current_step,
                enhanced_conversation_history=enhanced_conversation_history,
                query_id=query_id,
                chat_id=chat_id,
                db=db,
            )

        # ----- PHASE 2: Method Planning & Execution -----
        # method_executor already built above; now build the tools
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

        combined_tools, all_method_tools, built_categories = build_planning_tools(
            chatbot_instance=chatbot_instance,
            selections_list=selections_list,
            method_executor=method_executor,
            context=context,
            fresh_retrieval_tools=fresh_retrieval_tools,
        )
        if not combined_tools:
            log.warning("No method or retrieval tools available for selected categories")
            msg = "An unexpected error occurred. Please try again later."
            yield msg
            yield f"__FINAL_RESPONSE__{msg}"
            return

        # Build the planning prompt via shared helper, pass previously derived clar_ctx
        method_prompt = build_method_prompt(
            combined_tool_query,
            project_id,
            user_id,
            workspace_id,
            enhanced_conversation_history,
            clarification_context=clar_ctx,
            user_meta=user_meta,
        )

        date_time_context = await get_current_timestamp_context(user_id)
        method_prompt = f"{method_prompt}\n\n{date_time_context}"

        # Record the tool orchestration context (enhanced conversation history) before planning
        try:
            step_ctx, next_step_ctx = build_tool_orchestration_context_step(
                current_step=current_step,
                enhanced_conversation_history=enhanced_conversation_history,
                combined_tool_query=combined_tool_query,
                built_categories=built_categories,
                all_method_tools=all_method_tools,
                combined_tools=combined_tools,
            )
            if step_ctx is not None:
                tool_flow_steps.append(step_ctx)
                current_step = next_step_ctx
        except Exception:
            pass

        # Log the full method planning prompt and context for debugging
        try:
            # Determine if this is a clarification follow-up (raw user input) or router-synthesized query
            is_clarification_followup = bool(user_meta and isinstance(user_meta, dict) and user_meta.get("clarification_context"))
            query_label = "User Intent (clarification response)" if is_clarification_followup else "User Intent"

            # Log comprehensive debugging information
            log.info(f"ChatID: {chat_id} - {query_label}: {combined_tool_query}")
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
        messages = [SystemMessage(content=method_prompt), HumanMessage(content=combined_tool_query)]

        # log.info(f"ChatID: {chat_id} - Build mode LLM input - System Prompt:\n{"=" * 80}\n{method_prompt}\n{"=" * 80}")
        # log.info(f"ChatID: {chat_id} - Build mode LLM input - User Message:\n{"=" * 80}\n{combined_tool_query}\n{"=" * 80}")

        # Re-bind LLM with the full toolset (action methods + retrieval)
        # Some LangChain/OpenAI versions default to no tool calls if not specified.
        # deduplicate tools
        combined_tools = list({tool.name: tool for tool in combined_tools}.values())
        llm_with_method_tools = chatbot_instance.tool_llm.bind_tools(combined_tools)
        # Set tracking context for method planning LLM calls
        llm_with_method_tools.set_tracking_context(query_id, db, MessageMetaStepType.ACTION_METHOD_PLANNING, chat_id=str(chat_id))

        stage = "planner_tool_selection_calling"
        reasoning_chunk_dict = reasoning_dict_maker(stage=stage, tool_name="", tool_query="", content="")
        if reasoning_container is not None:
            reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]
        yield reasoning_chunk_dict

        # Continue iterative tool calling with method tools
        response = await llm_with_method_tools.ainvoke(messages)
        messages.append(response)
        # Stream planner's initial reasoning (if present and not a control token)
        # Only stream as reasoning if there are tool calls coming (not the final response)
        # This represents the LLM's internal thinking/reasoning process

        # Log LLM's initial response for debugging
        log.info(f"ChatID: {chat_id} - LLM INITIAL RESPONSE")
        try:
            _has_tool_calls = hasattr(response, "tool_calls") and bool(getattr(response, "tool_calls", None))
        except Exception:
            _has_tool_calls = False
        log.info(f"ChatID: {chat_id} - Has Tool Calls: {_has_tool_calls}")

        if _has_tool_calls:
            # Yield reasoning chunk for the planner tool selection
            try:
                _content_preview = str(getattr(response, "content", "") or "").strip()
                if _content_preview:
                    ## change point: "πspecial reasoning blockπ:
                    stage = "planner_tool_selection"
                    reasoning_chunk_dict = reasoning_dict_maker(stage=stage, tool_name="", tool_query="", content=_content_preview)
                    if reasoning_container is not None:
                        reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]
                    yield reasoning_chunk_dict

            except Exception:
                pass

        # Log planner decisions immediately (before flow step creation)
        try:
            if _has_tool_calls:
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
            selection_step, next_step_sel = build_planner_tool_selection_step(response, current_step=current_step)
            if selection_step is not None:
                tool_flow_steps.append(selection_step)
                current_step = next_step_sel
        except Exception:
            pass

        # Handle iterative method tool calling until completion
        planned_actions: list = []
        max_iterations = MAX_ACTION_EXECUTOR_ITERATIONS  # Safety limit to prevent infinite loops
        iteration_count = 0
        loop_warning_detected = False

        # Continue the loop until either:
        # 1. No more tool calls are returned by the LLM, OR
        # 2. At least one action has been planned (to handle simple requests)
        # 3. Maximum iterations reached (safety check)
        loop_condition = (_has_tool_calls or len(planned_actions) == 0) and iteration_count < max_iterations

        # Track tool calls to detect loops
        tool_call_history = []

        while loop_condition:
            iteration_count += 1
            tool_messages = []

            # If no tool calls in this response, the LLM has finished its work
            # Either it has planned actions, or it's providing a final answer (retrieval-only)
            if not _has_tool_calls:
                log.info(f"ChatID: {chat_id} - No tool calls returned; LLM has finished (planned {len(planned_actions)} actions)")
                break

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

                # Special handling for clarification tool
                elif tool_name == "ask_for_clarification":
                    flow_step, tool_message, next_step, stream_chunk = await execute_and_persist_clarification(
                        tool_args=tool_args,
                        tool_id=tool_id,
                        combined_tools=combined_tools,
                        combined_tool_query=combined_tool_query,
                        current_step=current_step,
                        built_categories=list(built_categories) if "built_categories" in locals() else [],
                        all_method_tools=list(all_method_tools) if "all_method_tools" in locals() else [],
                        chat_id=chat_id,
                        query_id=query_id,
                        db=db,
                    )
                    if tool_message is not None:
                        tool_messages.append(tool_message)
                    if flow_step is not None:
                        tool_flow_steps.append(flow_step)
                    current_step = next_step
                    yield stream_chunk

                    clarification_requested = True
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
                    # Build context for entity resolution
                    action_context = {
                        "workspace_slug": workspace_slug,
                        "project_id": project_id,
                        "workspace_id": workspace_id,
                    }

                    # Preflight: ensure required fields exist before planning actions
                    try:
                        missing_required = preflight_missing_required_fields(tool_name, tool_args, action_context)
                    except Exception:
                        missing_required = []

                    # Attempt auto-resolution before asking user
                    did_resolve = await auto_resolve_missing_ids(
                        tool_name=tool_name,
                        tool_args=tool_args,
                        missing_required=missing_required,
                        combined_tools=combined_tools,
                        workspace_slug=workspace_slug,
                    )
                    if did_resolve:
                        with contextlib.suppress(Exception):
                            missing_required = preflight_missing_required_fields(tool_name, tool_args, action_context)

                    if missing_required:
                        clar_req, clar_payload, clar_tool_msg, clar_flow_step, next_step = await handle_preflight_clarification(
                            tool_name=tool_name,
                            tool_args=tool_args,
                            action_context=action_context,
                            missing_required=missing_required,
                            method_executor=method_executor,
                            workspace_slug=workspace_slug,
                            chat_id=chat_id,
                            tool_id=tool_id,
                            current_step=current_step,
                            combined_tool_query=combined_tool_query,
                            is_project_chat=is_project_chat,
                            built_categories=list(built_categories) if "built_categories" in locals() else [],
                            all_method_tools=list(all_method_tools) if "all_method_tools" in locals() else [],
                            combined_tools=combined_tools,
                            query_id=query_id,
                            db=db,
                        )
                        if clar_req:
                            if clar_tool_msg is not None:
                                tool_messages.append(clar_tool_msg)
                            if clar_flow_step is not None:
                                tool_flow_steps.append(clar_flow_step)
                            current_step = next_step
                            clarification_requested = True
                            try:
                                yield f"πspecial clarification blockπ: {json.dumps(clar_payload)}\n"
                            except Exception:
                                yield f"πspecial clarification blockπ: {str(clar_payload)}\n"
                            response.tool_calls = [] if hasattr(response, "tool_calls") else None
                            break

                    stage = "planner_tool_selection_final"
                    user_friendly_tool_name = TOOL_NAME_TO_CATEGORY_MAP.get(tool_name, {}).get("front_facing_name", tool_name)
                    if "name" in tool_args or "title" in tool_args:
                        tq = f"{tool_args.get("name", tool_args.get("title", ""))}"
                    else:
                        tq = ""
                    reasoning_chunk_dict = reasoning_dict_maker(stage=stage, tool_name=user_friendly_tool_name, tool_query=tq, content="")
                    if reasoning_container is not None:
                        reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]

                    yield reasoning_chunk_dict

                    planned_step, action_summary, tool_message_ack, next_step = await plan_action_and_prepare_outputs(
                        tool_name=tool_name,
                        tool_args=tool_args,
                        tool_id=tool_id,
                        current_step=current_step,
                        chat_id=chat_id,
                        query_id=query_id,
                        conversation_history=conversation_history,
                        combined_tool_query=combined_tool_query,
                        db=db,
                        project_id=project_id,
                        workspace_slug=workspace_slug,
                    )
                    # log planned step
                    yield f"πspecial actions blockπ: {json.dumps(action_summary, default=str)}"
                    # Record the planned action and tool execution result
                    if tool_message_ack is not None:
                        tool_messages.append(tool_message_ack)
                    if planned_step is not None:
                        tool_flow_steps.append(planned_step)
                    current_step = next_step

                    planned_actions.append(action_summary)

                else:
                    # Format and enrich tool query for display before execution
                    tool_query = format_tool_query_for_display(tool_name, tool_args, combined_tool_query)
                    tool_query = await enrich_tool_query_for_display(tool_name, tool_args, tool_query)

                    # Yield execution reasoning block with enhanced query before execution
                    ## change point: "πspecial reasoning blockπ:
                    stage = "retrieval_tool_execution"
                    user_friendly_tool_name = tool_name_shown_to_user(tool_name)
                    content = ""
                    reasoning_chunk_dict = reasoning_dict_maker(
                        stage=stage, tool_name=user_friendly_tool_name, tool_query=tool_query, content=content
                    )
                    if reasoning_container is not None:
                        reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]
                    yield reasoning_chunk_dict

                    # For non-action tools (retrieval), execute via helper
                    result = await execute_retrieval_tool_and_build_step(
                        tool_name=tool_name,
                        tool_id=tool_id,
                        tool_args=tool_args,
                        combined_tool_query=combined_tool_query,
                        combined_tools=combined_tools,
                        query_flow_store=query_flow_store,
                        current_step=current_step,
                        tool_query=tool_query,
                    )
                    (
                        flow_step,
                        tool_message,
                        next_step_exec,
                        tool_query,
                        execution_success,
                        execution_error,
                    ) = result  # type: ignore[assignment]
                    log.info(f"ChatID: {chat_id} - Tool {tool_name} result: {tool_message.content}")
                    if tool_message is not None:
                        tool_messages.append(tool_message)
                        # Format tool message content for user-friendly display (remove UUIDs, URLs, etc.)
                        ## change point: "πspecial reasoning blockπ:
                        stage = "retrieval_tool_execution_message"
                        cleaned_content = format_tool_message_for_display(tool_message.content)
                        user_friendly_tool_name = tool_name_shown_to_user(tool_name)
                        content = f"{user_friendly_tool_name}'s result: {cleaned_content}\n\n"
                        reasoning_chunk_dict = reasoning_dict_maker(
                            stage=stage, tool_name=user_friendly_tool_name, tool_query=tool_query, content=content
                        )
                        if reasoning_container is not None:
                            reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]
                        yield reasoning_chunk_dict
                    else:
                        tool_messages.append(tool_message)
                    if flow_step is not None:
                        tool_flow_steps.append(flow_step)
                    current_step = next_step_exec

            # If clarification was requested, stop further planning
            if clarification_requested:
                break

            # Add tool results to conversation and continue
            messages.extend(tool_messages)

            # # Log the messages being sent to the LLM (includes tool results)
            # log.info(f"ChatID: {chat_id} - Build mode LLM iteration {iteration_count} - Messages count: {len(messages)}")
            # try:
            #     # Log last few messages for context (tool results + conversation)
            #     last_messages_preview = []
            #     for message_preview in messages[-3:]:  # Last 3 messages
            #         if hasattr(message_preview, "content"):
            #             content_preview = str(message_preview.content)[:200] + "..." if
            #                   len(str(message_preview.content)) > 200 else str(message_preview.content)
            #             last_messages_preview.append(f"{message_preview.__class__.__name__}: {content_preview}")
            #     log.info(f"ChatID: {chat_id} - Build mode LLM iteration {iteration_count} - Recent messages:\n" + "\n".join(last_messages_preview))
            # except Exception:
            #     pass

            # Get next response from LLM
            response = await llm_with_method_tools.ainvoke(messages)

            messages.append(response)
            # Stream planner reasoning for this iteration (if present and not a control token)
            # Only stream as reasoning if there are more tool calls coming (not the final response)
            # This represents the LLM's internal thinking/reasoning process
            has_more_tool_calls = bool(getattr(response, "tool_calls", None))
            if has_more_tool_calls:
                try:
                    _iter_content = str(getattr(response, "content", "") or "").strip()
                    if _iter_content:
                        ## change point: "πspecial reasoning blockπ:
                        stage = "planner_tool_selection"
                        reasoning_chunk_dict = reasoning_dict_maker(stage=stage, tool_name="", tool_query="", content=_iter_content)
                        if reasoning_container is not None:
                            reasoning_container["content"] += reasoning_chunk_dict["header"] + reasoning_chunk_dict["content"]
                        yield reasoning_chunk_dict
                except Exception:
                    pass

            # update _has_tool_calls
            _has_tool_calls = has_more_tool_calls

            # Log planner decisions for this iteration
            try:
                if _has_tool_calls:
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
                selection_step, next_step_sel = build_planner_tool_selection_step(response, current_step=current_step)
                if selection_step is not None:
                    try:
                        ed = selection_step.setdefault("execution_data", {})
                        ed["iteration"] = iteration_count
                    except Exception:
                        pass
                    tool_flow_steps.append(selection_step)
                    current_step = next_step_sel
            except Exception:
                pass

            # Update loop condition for next iteration
            loop_condition = (_has_tool_calls or len(planned_actions) == 0) and iteration_count < max_iterations

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
                    step, next_step_ps = build_planner_summary_step(
                        current_step=current_step,
                        iteration_count=iteration_count,
                        planned_actions_count=len(planned_actions),
                        loop_warning_detected=loop_warning_detected,
                        tool_calls_count=len(tool_call_history),
                    )
                    tool_flow_steps.append(step)
                    current_step = next_step_ps
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
            # No actions planned - this is a retrieval-only query or unsupported feature request
            # The LLM should have provided an answer/explanation in its content
            log.info(f"ChatID: {chat_id} - No actions planned; streaming LLM's response as final answer")

            # Stream the LLM's content as the final answer
            if hasattr(response, "content") and response.content:
                content = str(response.content).strip()
                if content:
                    # Stream the content in chunks for better UX
                    async for stream_chunk in stream_content_in_chunks(content):
                        yield stream_chunk
                    yield "\n"
                else:
                    # Fallback if no content provided
                    fallback_msg = "I wasn't able to find a suitable response. Could you please rephrase your request?"
                    yield fallback_msg
                    yield "\n"
                    content = fallback_msg
            else:
                # Fallback if no content attribute
                fallback_msg = "I wasn't able to find a suitable response. Could you please rephrase your request?"
                yield fallback_msg
                yield "\n"
                content = fallback_msg

            # Record the flow steps
            try:
                step, next_step_ps = build_planner_summary_step(
                    current_step=current_step,
                    iteration_count=iteration_count,
                    planned_actions_count=0,
                    loop_warning_detected=loop_warning_detected,
                    tool_calls_count=len(tool_call_history),
                )
                tool_flow_steps.append(step)
                current_step = next_step_ps
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

            yield f"__FINAL_RESPONSE__{content}"
            return
        else:
            log.debug(f"Tool selection loop completed successfully after {iteration_count} iterations with {len(planned_actions)} planned actions")

        # Build final response and optional planner_no_actions step
        final_response_chunks, current_step, no_actions_step = await build_and_stream_final_response(
            response=response,
            current_step=current_step,
            iteration_count=iteration_count,
            chat_id=chat_id,
        )
        if no_actions_step is not None:
            tool_flow_steps.append(no_actions_step)

        # Stream final response chunks - stream actual content
        for chunk in final_response_chunks:
            # Check if this is the actual response content
            if hasattr(response, "content") and response.content:
                content = str(response.content).strip()
                # Stream actual content
                if content:
                    chunk_without_newline = chunk.rstrip("\n")
                    # Check if this chunk matches the actual content (it should be content + "\n")
                    if chunk_without_newline == content:
                        # This is the actual response content - stream it in chunks
                        async for stream_chunk in stream_content_in_chunks(chunk_without_newline):
                            yield stream_chunk
                        # Add newline if it was in the original chunk
                        if chunk.endswith("\n"):
                            yield "\n"
                        continue

            # Other message types - yield directly
            yield chunk

        # Record tool executions in database
        # Append planning summary before persisting steps
        try:
            step, next_step_ps = build_planner_summary_step(
                current_step=current_step,
                iteration_count=iteration_count,
                planned_actions_count=len(planned_actions),
                loop_warning_detected=loop_warning_detected,
                tool_calls_count=len(tool_call_history),
            )
            tool_flow_steps.append(step)
            current_step = next_step_ps
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
