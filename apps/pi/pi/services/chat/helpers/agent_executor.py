"""Agent execution logic for single and multi-agent scenarios."""

import ast
import asyncio
import re
from collections.abc import AsyncIterator
from typing import Any
from typing import Dict
from typing import List
from typing import Tuple
from typing import Union
from typing import cast

from langchain_core.messages import AIMessage
from langchain_core.messages import BaseMessage
from langchain_core.messages import HumanMessage
from langchain_core.messages import SystemMessage
from langchain_core.messages import ToolMessage

from pi import logger
from pi.app.models.enums import ExecutionStatus
from pi.app.models.enums import FlowStepType
from pi.app.models.enums import MessageMetaStepType
from pi.core.db.plane_pi.lifecycle import get_streaming_db_session
from pi.services.chat.prompts import multi_tool_system_prompt
from pi.services.chat.utils import StandardAgentResponse
from pi.services.chat.utils import format_conversation_history
from pi.services.chat.utils import get_current_timestamp_context
from pi.services.chat.utils import mask_uuids_in_text
from pi.services.chat.utils import standardize_flow_step_content
from pi.services.retrievers.pg_store.json_serializer import sanitize_execution_data
from pi.services.retrievers.pg_store.message import upsert_message_flow_steps as _upsert_message_flow_steps
from pi.services.schemas.chat import Agents

log = logger.getChild(__name__)


async def execute_single_agent(
    chatbot_instance,
    agent,
    sub_query,
    user_meta,
    message_id,
    workspace_id,
    project_id,
    conversation_history,
    user_id,
    chat_id,
    query_flow_store,
    parsed_query,
    query_id,
    step_order,
    workspace_in_context,
    db,
    preset_tables=None,
    preset_sql_query=None,
    preset_placeholders=None,
):
    """Execute a single agent and prepare response stream."""
    if not workspace_in_context:
        return chatbot_instance.handle_generic_query_stream(
            sub_query,
            user_id,
            conversation_history,
            user_meta,
            non_plane=True,
            include_user_context_on_followup=bool(conversation_history),
        ), None

    if agent == Agents.GENERIC_AGENT:
        return chatbot_instance.handle_generic_query_stream(sub_query, user_id, conversation_history, user_meta), None

    agent_result = await chatbot_instance.handle_agent_query(
        db,
        agent,
        sub_query,
        user_meta,
        message_id,
        workspace_id,
        project_id,
        conversation_history,
        user_id,
        chat_id,
        query_flow_store,
        is_multi_agent=False,
        preset_tables=preset_tables,
        preset_sql_query=preset_sql_query,
        preset_placeholders=preset_placeholders,
    )

    # Define response variable with proper typing upfront
    response: Union[str, Dict[str, Any]]

    if isinstance(agent_result, tuple):
        intermediate_results, response = agent_result
    else:
        intermediate_results = None
        response = agent_result
    responses: List[Tuple[str, str, Union[str, Dict[str, Any]]]] = [(agent, sub_query, response)]
    formatted_responses_result = StandardAgentResponse.format_responses(responses, chat_id, query_flow_store)

    # Check if responses contain errors - if so, return error directly without LLM rewriting
    if isinstance(formatted_responses_result, dict) and formatted_responses_result.get("has_errors"):
        # Extract clean error message from the response
        error_message = StandardAgentResponse.extract_results(response)
        if not error_message:
            error_message = "An error occurred while retrieving data. Please try again later."

        # Clean up any markdown formatting from SQL agent
        error_message = error_message.strip()
        if error_message.startswith("- **Result**: "):
            error_message = error_message.replace("- **Result**: ", "")

        return chatbot_instance._create_simple_stream(error_message), None

    # Extract formatted string for normal flow
    formatted_responses = formatted_responses_result.get("formatted") if isinstance(formatted_responses_result, dict) else formatted_responses_result
    formatted_history = format_conversation_history(conversation_history)
    # Sanitize execution_data to ensure JSON serializability
    sanitized_execution_data = sanitize_execution_data(intermediate_results or {})

    flow_steps = [
        {
            "step_order": step_order,
            "step_type": FlowStepType.TOOL.value,
            "tool_name": agent.name,
            "content": standardize_flow_step_content(response, FlowStepType.TOOL),
            "execution_data": sanitized_execution_data,
        }
    ]
    try:
        async with get_streaming_db_session() as _subdb:
            flow_step_result = await asyncio.wait_for(
                _upsert_message_flow_steps(
                    message_id=query_id,
                    chat_id=chat_id,
                    flow_steps=flow_steps,
                    db=_subdb,
                ),
                timeout=2.0,
            )
    except asyncio.TimeoutError:
        log.warning(f"Timed out recording flow step for message {query_id}; continuing")
        flow_step_result = {"message": "error", "error": "timeout"}
    except Exception as e:
        log.warning(f"Failed to record flow step for message {query_id}: {e}")
        flow_step_result = {"message": "error", "error": str(e)}

    if flow_step_result["message"] != "success":
        # Log the error but continue - flow step logging is not critical for user experience
        log.warning(f"Failed to record flow step for message {query_id}: {flow_step_result.get("error", "Unknown error")}")

    return chatbot_instance.combined_response_stream(
        parsed_query,
        formatted_responses,
        formatted_history,
        user_meta,
        user_id,
        workspace_in_context=workspace_in_context,
    ), None


async def execute_multi_agents(
    chatbot_instance,
    selected_agents,
    user_meta,
    workspace_id,
    workspace_slug,
    project_id,
    conversation_history,
    enhanced_conversation_history,
    user_id,
    chat_id,
    query_flow_store,
    parsed_query,
    query_id,
    step_order,
    db,
    original_query,
    reasoning_container=None,
    workspace_in_context: bool | None = None,
) -> AsyncIterator[str]:
    """Execute multiple agents using LangChain tool calling for orchestration with real-time streaming."""

    log.info(f"ChatID: {chat_id} - Starting multi-agent execution with {len(selected_agents)} agent(s): {[agent.agent for agent in selected_agents]}")

    # Reset shared state for this query
    chatbot_instance.vector_search_issue_ids = []
    chatbot_instance.vector_search_page_ids = []
    # Reset stored agent responses for clean state
    chatbot_instance.agent_responses = {}

    # Get tools for selected agents
    log.info(f"ChatID: {chat_id} - Fetching tools for selected agents")
    tools = await chatbot_instance._get_selected_tools(
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
    )

    if not tools:
        log.error(f"ChatID: {chat_id} - No valid tools found for selected agents")
        # Finalize with a user-friendly message so caller can persist
        yield "πspecial reasoning blockπ: 📝 Generating final response...\n\n"
        yield "An unexpected error occurred. Please try again later."
        return

    custom_prompt = (
        "⚠️ IMPORTANT: The router has suggested the following tools, but you MUST override "
        "this selection if a more specialized tool is available.\n\n"
        "Suggested tools and their queries: \n"
    )
    # Map agent names to actual tool names to match bound tools
    agent_to_tool_map = {
        "plane_structured_database_agent": "structured_db_tool",
        "plane_vector_search_agent": "vector_search_tool",
        "plane_pages_agent": "pages_search_tool",
        "plane_docs_agent": "docs_search_tool",
        "generic_agent": "generic_query_tool",
    }
    tool_entries = []
    for agent in selected_agents:
        tool_name = agent_to_tool_map.get(agent.agent, agent.agent)
        tool_entries.append(f"Tool Name: {tool_name};\nTool Query: {agent.query}")
    custom_prompt += "\n\n".join(tool_entries)
    # Inject enhanced conversation history if available to guide orchestration
    try:
        if enhanced_conversation_history and isinstance(enhanced_conversation_history, str) and enhanced_conversation_history.strip():
            custom_prompt += f"\n\n**CONVERSATION HISTORY & ACTION CONTEXT:**\n{enhanced_conversation_history}\n"
    except Exception:
        pass

    # Provide PROJECT/USER/TIME context to the tool planner
    context_block = ""
    try:
        # Project scoping (project chat)
        if project_id:
            context_block += f"\n\n**🔥 PROJECT CONTEXT (CRITICAL):**\nProject ID: {project_id}\n\n**IMPORTANT SCOPING RULES:**\n- This is a PROJECT-LEVEL chat - ALL operations are scoped to THIS PROJECT ONLY\n- When the request mentions 'current cycle', 'current module', 'work items', etc. - it means ONLY within THIS PROJECT\n- Use this project_id for ALL tools that accept project_id parameter\n- DO NOT query across all projects - scope everything to THIS specific project\n- User refers to 'this project'/'the project'/'current project' = use this project_id"  # noqa: E501
        else:
            # Workspace-level context (no specific project)
            context_block += f"\n\n**🌐 WORKSPACE CONTEXT (CRITICAL):**\nWorkspace ID: {workspace_id}\n\n**IMPORTANT SCOPING RULES:**\n- This is a WORKSPACE-LEVEL chat - queries can span MULTIPLE PROJECTS\n- When the request mentions 'last cycle', 'this cycle', 'work items', etc. WITHOUT specifying a project - it could be in ANY project\n- Use list_member_projects (without limit or with high limit) to get ALL projects in the workspace\n- Then iterate through projects to find relevant cycles/modules/work-items\n- CRITICAL: Do NOT limit to 1 project unless the user specifically names or refers to a specific project"  # noqa: E501

        # User context
        if user_id:
            context_block += "\n**USER CONTEXT:**\n" f"User ID: {user_id}\n" "- Use this to resolve pronouns like 'me', 'my', 'assigned to me'.\n"
        # Date/time context
        dt_ctx = None
        try:
            dt_ctx = await get_current_timestamp_context(user_id)
        except Exception:
            dt_ctx = None
        if dt_ctx:
            context_block += f"\n{dt_ctx}\n"
    except Exception:
        # Non-fatal; continue without context block if any error occurs
        pass

    # CRITICAL: Inject clarification context if this is a follow-up to ask_for_clarification
    if user_meta and isinstance(user_meta, dict) and user_meta.get("clarification_context"):
        clar_ctx = user_meta["clarification_context"]
        original_query_text = clar_ctx.get("original_query")
        reason = clar_ctx.get("reason")
        disambig_options = clar_ctx.get("disambiguation_options") or []
        answer_text = clar_ctx.get("answer_text")

        custom_prompt += "\n\n**CLARIFICATION CONTEXT:**\n"
        # CRITICAL: Include the original query to maintain full context
        if original_query_text:
            custom_prompt += f"Original user request: {original_query_text}\n"
        if reason:
            custom_prompt += f"Clarification reason: {reason}\n"
        if disambig_options:
            custom_prompt += "The user was previously shown these options:\n"
            for idx, opt in enumerate(disambig_options, 1):
                if isinstance(opt, dict):
                    opt_id = opt.get("id")
                    opt_name = opt.get("name") or opt.get("display_name") or ""
                    opt_identifier = opt.get("identifier") or ""
                    opt_email = opt.get("email") or ""

                    # Format based on what fields are available
                    if opt_email:
                        # User entity
                        custom_prompt += f"  {idx}. {opt_name} ({opt_email}) → UUID: {opt_id}\n"
                    elif opt_identifier:
                        # Project/workitem entity
                        custom_prompt += f"  {idx}. {opt_name} (Identifier: {opt_identifier}) → UUID: {opt_id}\n"
                    else:
                        # Generic entity
                        custom_prompt += f"  {idx}. {opt_name} → UUID: {opt_id}\n"
        if answer_text:
            custom_prompt += f"\nUser's clarification answer: {answer_text}\n"
        custom_prompt += "\nIMPORTANT: The current user message is a clarification response to the original request above. Use the clarification answer to resolve missing information and continue with the ORIGINAL request, not as a new standalone request.\n"  # noqa E501

    # Bind tools to the LLM
    llm_with_tools = chatbot_instance.tool_llm.bind_tools(tools)

    # Set tracking context on the bound LLM instance
    llm_with_tools.set_tracking_context(query_id, db, MessageMetaStepType.TOOL_ORCHESTRATION, chat_id=str(chat_id))

    # Track execution
    tool_flow_steps: List[Dict[str, Any]] = []
    current_step = step_order
    messages: List[BaseMessage] = []
    responses: List[Tuple[str, str, Union[str, Dict[str, Any]]]] = []

    messages.append(SystemMessage(content=multi_tool_system_prompt))

    # Prepend context at the top of the prompt for better LLM comprehension
    if context_block.strip():
        custom_prompt = f"{context_block}\n\n{custom_prompt}"

    try:
        query_to_use = parsed_query
        messages.append(HumanMessage(content=custom_prompt + f"\n\nUser Query: {query_to_use}"))

        # Record the tool orchestration context (enhanced conversation history) before any tool planning/execution
        try:
            if enhanced_conversation_history and isinstance(enhanced_conversation_history, str) and enhanced_conversation_history.strip():
                tool_flow_steps.append({
                    "step_order": current_step,
                    "step_type": FlowStepType.TOOL.value,
                    "tool_name": "tool_orchestration_context",
                    "content": "Context used for tool orchestration",
                    "execution_data": {"enhanced_conversation_history": enhanced_conversation_history},
                    "is_planned": False,
                    "is_executed": False,
                })
                current_step += 1
        except Exception:
            pass
        # log.info("************************************************")
        # log.info(f"ChatID: {chat_id} - multi-agent custom prompt: {custom_prompt}")
        # log.info("************************************************")
        # Log what's sent to the tool selection LLM
        log.info(f"ChatID: {chat_id} - Tool selection LLM input - Query: {query_to_use}")
        log.info(f"ChatID: {chat_id} - Tool selection LLM input - Available tools: {[t.name for t in tools]}")

        # Yield initial status
        reasoning_chunk = "🤖 Retrieving information...\n\n"
        if reasoning_container is not None:
            reasoning_container["content"] += reasoning_chunk
        yield f"πspecial reasoning blockπ: {reasoning_chunk}"

        # Initial invocation of LLM with tools
        llm_response = await chatbot_instance._tool_orchestration_llm_call(llm_with_tools, messages)

        # Handle failure case
        if llm_response == "TOOL_ORCHESTRATION_FAILURE":
            # Persist any steps captured so far
            if tool_flow_steps:
                try:
                    async with get_streaming_db_session() as _subdb:
                        await _upsert_message_flow_steps(
                            message_id=query_id,
                            chat_id=chat_id,
                            flow_steps=tool_flow_steps,
                            db=_subdb,
                        )
                except Exception as _e:
                    log.warning(f"ChatID: {chat_id} - Failed to persist tool flow steps on failure: {_e}")
            # Finalize with a short fallback message so caller can persist
            yield "πspecial reasoning blockπ: 📝 Generating final response...\n\n"
            yield "An unexpected error occurred. Please try again later."
            return

        ai_message = cast(AIMessage, llm_response)
        messages.append(ai_message)

        if not ai_message.tool_calls:
            log.info(f"ChatID: {chat_id} - No tool calls found in the initial LLM response. {ai_message.content}")
            responses.append((Agents.GENERIC_AGENT, query_to_use, ai_message.content))  # type: ignore
        else:
            # Log the tool calls selected by the LLM
            tool_calls_summary = [(tc["name"], tc.get("args", {})) for tc in ai_message.tool_calls]
            log.info(f"ChatID: {chat_id} - Tool selection LLM chose {len(ai_message.tool_calls)} tool(s): {tool_calls_summary}")

        # Process tool calls iteratively
        while ai_message.tool_calls:
            # Execute all tool calls
            tool_messages = []
            for tool_call in ai_message.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                tool_id = tool_call["id"]
                # Intercept clarification requests and short-circuit
                if tool_name == "ask_for_clarification":
                    log.info(f"ChatID: {chat_id} - Clarification requested by LLM: {tool_args.get("reason", "No reason provided")}")
                    try:
                        # Execute the clarification tool to get payload
                        tool_to_execute = next((t for t in tools if t.name == tool_name), None)
                        result = await tool_to_execute.ainvoke(tool_args) if tool_to_execute else "{}"
                    except Exception as e:
                        log.error(f"ChatID: {chat_id} - Clarification tool failed: {e}")
                        result = "{}"

                    # Persist flow step with clarification_pending
                    try:
                        from pi.services.chat.utils import standardize_flow_step_content as _std

                        payload = str(result)
                        clarification_execution_data = {
                            "args": tool_args,
                            "clarification_pending": True,
                            "clarification_payload": payload,
                            # Store planning context to avoid re-routing on follow-up
                            "selected_categories": [agent.agent for agent in selected_agents],
                            "bound_tool_names": [t.name for t in tools],
                            # CRITICAL: Store the original query so we can reconstruct full context on clarification follow-up
                            "original_query": original_query,
                        }

                        # Sanitize execution_data to ensure JSON serializability
                        sanitized_clarification_data = sanitize_execution_data(clarification_execution_data)

                        tool_flow_steps.append({
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL,
                            "tool_name": "ask_for_clarification",
                            "content": _std(payload, FlowStepType.TOOL),
                            "execution_data": sanitized_clarification_data,
                            "is_planned": False,
                            "is_executed": False,
                            "execution_success": ExecutionStatus.PENDING,
                        })
                        current_step += 1
                    except Exception:
                        pass

                    # Persist immediately since we return right after streaming
                    try:
                        async with get_streaming_db_session() as _subdb:
                            flow_steps_result = await _upsert_message_flow_steps(
                                message_id=query_id,
                                chat_id=chat_id,
                                flow_steps=tool_flow_steps,
                                db=_subdb,
                            )
                            if flow_steps_result.get("message") != "success":
                                log.warning("Failed to record clarification flow step")
                    except Exception as e:
                        log.error(f"ChatID: {chat_id} - Failed to persist clarification flow step: {e}")

                    # Stream clarification block and stop orchestration
                    try:
                        yield f"πspecial clarification blockπ: {result}\n"
                    except Exception:
                        yield f"πspecial clarification blockπ: {str(result)}\n"
                    return
                # Yield tool execution start (robust to different arg schemas)
                if tool_name != "generic_query_tool":
                    try:
                        from pi.services.chat.helpers.tool_utils import format_tool_query_for_display

                        user_friendly_tool_name = chatbot_instance._tool_name_shown_to_user(tool_name)
                        # Build a readable query snippet depending on tool schema
                        display_arg = format_tool_query_for_display(tool_name, tool_args, user_query=query_to_use)
                        masked_display = mask_uuids_in_text(display_arg or (query_to_use or "the request"))
                        reasoning_chunk = f"🔧 Performing {user_friendly_tool_name.lower()} to pull details about: {masked_display}\n\n"
                    except Exception:
                        user_friendly_tool_name = chatbot_instance._tool_name_shown_to_user(tool_name)
                        reasoning_chunk = f"🔧 Performing {user_friendly_tool_name.lower()}\n\n"
                    if reasoning_container is not None:
                        reasoning_container["content"] += reasoning_chunk
                    yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                # Find and execute the tool
                tool_to_execute = next((t for t in tools if t.name == tool_name), None)
                if tool_to_execute:
                    log.info(f"ChatID: {chat_id} - Executing tool: {tool_name} with args: {str(tool_args)[:100]}")
                    try:
                        # Execute the tool directly; endpoint-level SSE heartbeat will keep the stream alive
                        tool_result = await tool_to_execute.ainvoke(tool_args)

                        # Log brief output for observability
                        result_preview = str(tool_result)[:200] if tool_result else "None"
                        log.info(f"ChatID: {chat_id} - Tool {tool_name} result preview: {result_preview}")
                        log.debug(f"ChatID: {chat_id} - Tool {tool_name} completed successfully")

                        # Yield tool completion and result
                        if not tool_name == "generic_query_tool":
                            user_friendly_tool_name = chatbot_instance._tool_name_shown_to_user(tool_name)
                            reasoning_chunk = f"✅ {user_friendly_tool_name} execution completed\n\n"
                            if reasoning_container is not None:
                                reasoning_container["content"] += reasoning_chunk
                            yield f"πspecial reasoning blockπ: {reasoning_chunk}"
                        # yield f"📊 Result: {str(tool_result)[:200]}{'...' if len(str(tool_result)) > 200 else ''}\n\n"

                        # Record the tool execution with standardized execution_data format
                        execution_data: Dict[str, Any] = {
                            "tool_args": tool_args,
                            "tool_name": tool_name,
                            "execution_status": "success",
                            # "timestamp": await get_current_timestamp_context(user_id),
                        }

                        stored_response = chatbot_instance.agent_responses.get(tool_name)

                        if tool_name == "structured_db_tool":
                            # For structured_db_tool, include full intermediate_results for SQL debugging
                            if stored_response and "intermediate_results" in stored_response:
                                execution_data["intermediate_results"] = stored_response["intermediate_results"]
                                # Extract key debugging info to top level for easier access
                                ir = stored_response["intermediate_results"]
                                execution_data["sql_query"] = ir.get("generated_sql", "")
                                execution_data["final_query"] = ir.get("final_query", "")
                                execution_data["relevant_tables"] = ir.get("relevant_tables", [])
                            execution_data["tool_type"] = "database_query"

                        elif tool_name in ["vector_search_tool", "pages_search_tool", "docs_search_tool"]:
                            # For search tools, standardize search metadata
                            if stored_response:
                                entity_urls = stored_response.get("entity_urls") or []
                                execution_data["entity_urls"] = entity_urls
                                execution_data["results_count"] = len(entity_urls)
                                execution_data["search_query"] = tool_args.get("query", "")
                                # Include execution metadata if available
                                if "execution_metadata" in stored_response:
                                    execution_data["search_metadata"] = stored_response["execution_metadata"]
                            execution_data["tool_type"] = "semantic_search"

                        elif tool_name == "generic_query_tool":
                            execution_data["tool_type"] = "generic_llm"
                            if stored_response and isinstance(stored_response, dict):
                                execution_data.update({k: v for k, v in stored_response.items() if k not in ["results", "tool_args"]})
                        else:
                            # For other tools, include any available stored response data
                            execution_data["tool_type"] = "unknown"
                            if stored_response and isinstance(stored_response, dict):
                                execution_data.update({k: v for k, v in stored_response.items() if k not in ["results", "tool_args"]})

                        # Sanitize execution_data to ensure JSON serializability
                        sanitized_execution_data = sanitize_execution_data(execution_data)

                        # Extract key facts from tool_result and enrich execution_data
                        try:
                            facts: Dict[str, Any] = {}
                            result_str = str(tool_result) if tool_result is not None else ""

                            # Extract explicit entity lines from success formatter
                            m_url = re.search(r"^Entity URL:\s*(.+)$", result_str, flags=re.MULTILINE)
                            if m_url:
                                facts["entity_url"] = m_url.group(1).strip()
                            m_eid = re.search(r"^Entity ID:\s*(.+)$", result_str, flags=re.MULTILINE)
                            if m_eid:
                                facts["entity_id"] = m_eid.group(1).strip()
                            m_ename = re.search(r"^Entity Name:\s*(.+)$", result_str, flags=re.MULTILINE)
                            if m_ename:
                                facts["entity_name"] = m_ename.group(1).strip()
                            m_etype = re.search(r"^Entity Type:\s*(.+)$", result_str, flags=re.MULTILINE)
                            if m_etype:
                                facts["entity_type"] = m_etype.group(1).strip()
                            m_eident = re.search(r"^Entity Identifier:\s*(.+)$", result_str, flags=re.MULTILINE)
                            if m_eident:
                                facts["entity_identifier"] = m_eident.group(1).strip()

                            # Extract Result: payload and try to parse dict/list safely
                            m_res = re.search(r"\n\nResult:\s*(\{[\s\S]*?\}|\[[\s\S]*?\])", result_str)
                            if m_res:
                                payload = m_res.group(1)
                                try:
                                    parsed = ast.literal_eval(payload)
                                    if isinstance(parsed, dict):
                                        for k in ("id", "identifier", "project_id", "workspace_id", "name"):
                                            v = parsed.get(k)
                                            if v:
                                                facts[k] = v
                                        # Common list containers
                                        for list_key in ("projects", "cycles", "results", "items"):
                                            if isinstance(parsed.get(list_key), list):
                                                lst = parsed.get(list_key) or []
                                                facts[f"{list_key}_count"] = len(lst)
                                                ids = []
                                                for it in lst[:3]:
                                                    if isinstance(it, dict) and it.get("id"):
                                                        ids.append(str(it.get("id")))
                                                if ids:
                                                    facts[f"{list_key}_ids_preview"] = ids
                                    elif isinstance(parsed, list):
                                        facts["list_count"] = len(parsed)
                                        ids = []
                                        for it in parsed[:3]:
                                            if isinstance(it, dict) and it.get("id"):
                                                ids.append(str(it.get("id")))
                                        if ids:
                                            facts["ids_preview"] = ids
                                except Exception:
                                    pass

                            # Always include a concise args summary as fallback
                            try:
                                if isinstance(tool_args, dict):
                                    arg_keys = [
                                        k for k in ("project_id", "module_id", "cycle_id", "issue_id", "name", "identifier") if k in tool_args
                                    ]
                                    if arg_keys:
                                        facts["args_summary"] = {k: tool_args.get(k) for k in arg_keys}
                            except Exception:
                                pass

                            if facts:
                                # Merge into sanitized_execution_data
                                if isinstance(sanitized_execution_data, dict):
                                    sanitized_execution_data["facts"] = facts
                        except Exception:
                            pass

                        tool_flow_steps.append({
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL.value,
                            "tool_name": tool_name,
                            "content": standardize_flow_step_content(tool_result, FlowStepType.TOOL),
                            "execution_data": sanitized_execution_data,
                            "execution_success": ExecutionStatus.SUCCESS,  # Mark as SUCCESS after successful execution
                        })
                        current_step += 1

                        # Add to responses for final formatting
                        agent_name = chatbot_instance._tool_name_to_agent(tool_name)

                        # Generic approach: Check if any agent has stored entity URLs
                        response_with_urls: Union[str, Dict[str, Any]] = tool_result
                        stored_response = chatbot_instance.agent_responses.get(tool_name)
                        if stored_response and stored_response.get("entity_urls"):
                            response_with_urls = stored_response

                        responses.append((agent_name, str(tool_args), response_with_urls))

                        # Create tool message
                        tool_message = ToolMessage(content=str(tool_result), tool_call_id=tool_id or "")
                        tool_messages.append(tool_message)

                    except Exception as e:
                        log.error(f"ChatID: {chat_id} - Error executing tool {tool_name}: {str(e)}")
                        # Use a generic, user-friendly reasoning message
                        reasoning_chunk = "❌ Encountered an unexpected error.\n\n"
                        if reasoning_container is not None:
                            reasoning_container["content"] += reasoning_chunk
                        yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                        # Record the failed tool execution with error details
                        error_execution_data = {
                            "tool_args": tool_args,
                            "tool_name": tool_name,
                            "execution_status": "error",
                            "error_message": str(e),
                            "tool_type": "unknown",
                        }

                        # Sanitize error execution_data to ensure JSON serializability
                        sanitized_error_execution_data = sanitize_execution_data(error_execution_data)

                        tool_flow_steps.append({
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL,
                            "tool_name": tool_name,
                            "content": f"Error: {str(e)}",
                            "execution_data": sanitized_error_execution_data,
                            "execution_success": ExecutionStatus.FAILED,  # Mark as FAILED on error
                            "execution_error": str(e),
                        })
                        current_step += 1

                        error_message = ToolMessage(content=f"Error executing {tool_name}: {str(e)}", tool_call_id=str(tool_id or ""))
                        tool_messages.append(error_message)
                else:
                    log.error(f"ChatID: {chat_id} - Tool {tool_name} not found")
                    # Generic, user-friendly status instead of internal details
                    reasoning_chunk = "⚠️ A required capability was unavailable.\n\n"
                    if reasoning_container is not None:
                        reasoning_container["content"] += reasoning_chunk
                    yield f"πspecial reasoning blockπ: {reasoning_chunk}"
                    error_message = ToolMessage(content=f"Tool {tool_name} not found", tool_call_id=str(tool_id or ""))
                    tool_messages.append(error_message)

            # Add tool messages to conversation
            messages.extend(tool_messages)

            # Yield status before getting next LLM response
            reasoning_chunk = "🤖 Analyzing results...\n\n"
            if reasoning_container is not None:
                reasoning_container["content"] += reasoning_chunk
            yield f"πspecial reasoning blockπ: {reasoning_chunk}"

            # Get next response from LLM
            llm_response = await chatbot_instance._tool_orchestration_llm_call(llm_with_tools, messages)

            # Handle failure case
            if llm_response == "TOOL_ORCHESTRATION_FAILURE":
                # Finalize with a short fallback message so caller can persist
                yield "πspecial reasoning blockπ: 📝 Generating final response...\n\n"
                yield "An unexpected error occurred. Please try again later."
                return

            ai_message = cast(AIMessage, llm_response)
            messages.append(ai_message)

            # Log any follow-up tool calls
            if ai_message.tool_calls:
                tool_calls_summary = [(tc["name"], tc.get("args", {})) for tc in ai_message.tool_calls]
                log.info(f"ChatID: {chat_id} - Tool selection LLM follow-up: {len(ai_message.tool_calls)} tool(s): {tool_calls_summary}")

        # Add all tool flow steps to database
        if tool_flow_steps:
            try:
                async with get_streaming_db_session() as _subdb:
                    flow_steps_result = await asyncio.wait_for(
                        _upsert_message_flow_steps(
                            message_id=query_id,
                            chat_id=chat_id,
                            flow_steps=tool_flow_steps,
                            db=_subdb,
                        ),
                        timeout=2.0,
                    )
            except asyncio.TimeoutError:
                log.warning(f"Timed out recording tool flow steps for message {query_id}; continuing")
                flow_steps_result = {"message": "error", "error": "timeout"}
            except Exception as e:
                log.warning(f"Failed to record tool flow steps for message {query_id}: {e}")
                flow_steps_result = {"message": "error", "error": str(e)}
            if flow_steps_result["message"] != "success":
                # Log the error but continue - flow step logging is not critical for user experience
                log.warning(f"Failed to record flow steps for message {query_id}: {flow_steps_result.get("error", "Unknown error")}")
                # Continue with response generation - user should still get their answer

        # Yield final status
        reasoning_chunk = "📝 Generating final response...\n\n"
        if reasoning_container is not None:
            reasoning_container["content"] += reasoning_chunk
        yield f"πspecial reasoning blockπ: {reasoning_chunk}"

        # Format responses for the combination prompt
        log.info(f"ChatID: {chat_id} - Multi-agent execution completed. Processing {len(responses)} response(s) from agents")
        formatted_responses_result = StandardAgentResponse.format_responses(responses, chat_id, query_flow_store)

        # Check if responses contain errors - if so, return error directly without LLM rewriting
        if isinstance(formatted_responses_result, dict) and formatted_responses_result.get("has_errors"):
            log.warning(f"ChatID: {chat_id} - Error detected in agent responses, bypassing LLM combination")
            # Use friendly generic message for end users
            clean_error_msg: str = "An unexpected error occurred. Please try again later."

            # Persist steps before returning early
            if tool_flow_steps:
                try:
                    async with get_streaming_db_session() as _subdb:
                        await _upsert_message_flow_steps(
                            message_id=query_id,
                            chat_id=chat_id,
                            flow_steps=tool_flow_steps,
                            db=_subdb,
                        )
                except Exception as _e:
                    log.warning(f"ChatID: {chat_id} - Failed to persist tool flow steps on retrieval error: {_e}")

            # Finalize so caller can persist a proper assistant message
            yield "πspecial reasoning blockπ: 📝 Generating final response...\n\n"
            yield clean_error_msg
            return

        # Extract formatted string for normal flow
        log.info(f"ChatID: {chat_id} - All agents completed successfully, proceeding to LLM combination")
        formatted_responses = (
            formatted_responses_result.get("formatted") if isinstance(formatted_responses_result, dict) else formatted_responses_result
        )
        formatted_history = format_conversation_history(conversation_history)

        # Stream the combined response
        log.debug(f"ChatID: {chat_id} - Starting combined_response_stream with {len(conversation_history)} history messages")
        async for chunk in chatbot_instance.combined_response_stream(
            parsed_query,
            formatted_responses,
            formatted_history,
            user_meta,
            user_id,
            workspace_in_context=workspace_in_context,
        ):
            yield chunk
        log.info(f"ChatID: {chat_id} - Multi-agent flow completed successfully")
    except Exception as e:
        log.error(f"ChatID: {chat_id} - Error in LangChain tool orchestration: {str(e)}")
        yield "πspecial reasoning blockπ: 📝 Generating final response...\n\n"
        yield "An unexpected error occurred. Please try again later."
