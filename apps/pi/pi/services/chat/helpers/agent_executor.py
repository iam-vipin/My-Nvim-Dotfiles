"""Agent execution logic for single and multi-agent scenarios."""

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
from pi.app.models.enums import FlowStepType
from pi.app.models.enums import MessageMetaStepType
from pi.core.db.plane_pi.lifecycle import get_streaming_db_session
from pi.services.chat.prompts import multi_tool_system_prompt
from pi.services.chat.utils import StandardAgentResponse
from pi.services.chat.utils import format_conversation_history
from pi.services.chat.utils import mask_uuids_in_text
from pi.services.chat.utils import standardize_flow_step_content
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
        return chatbot_instance.handle_generic_query_stream(sub_query, user_id, conversation_history, user_meta, non_plane=True), None

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
    formatted_responses = StandardAgentResponse.format_responses(responses, chat_id, query_flow_store)
    formatted_history = format_conversation_history(conversation_history)
    flow_steps = [
        {
            "step_order": step_order,
            "step_type": FlowStepType.TOOL.value,
            "tool_name": agent.name,
            "content": standardize_flow_step_content(response, FlowStepType.TOOL),
            "execution_data": intermediate_results or {},
        }
    ]
    async with get_streaming_db_session() as _subdb:
        flow_step_result = await _upsert_message_flow_steps(
            message_id=query_id,
            chat_id=chat_id,
            flow_steps=flow_steps,
            db=_subdb,
        )

    if flow_step_result["message"] != "success":
        return None, "An unexpected error occurred. Please try again"

    return chatbot_instance.combined_response_stream(parsed_query, formatted_responses, formatted_history, user_meta, user_id), None


async def execute_multi_agents(
    chatbot_instance,
    selected_agents,
    user_meta,
    workspace_id,
    workspace_slug,
    project_id,
    conversation_history,
    user_id,
    chat_id,
    query_flow_store,
    parsed_query,
    query_id,
    step_order,
    db,
    original_query,
    reasoning_container=None,
) -> AsyncIterator[str]:
    """Execute multiple agents using LangChain tool calling for orchestration with real-time streaming."""

    # Reset shared state for this query
    chatbot_instance.vector_search_issue_ids = []
    chatbot_instance.vector_search_page_ids = []
    # Reset stored agent responses for clean state
    chatbot_instance.agent_responses = {}

    # Get tools for selected agents
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
        error_msg = "❌ No valid tools found for selected agents\n\n"
        if reasoning_container is not None:
            reasoning_container["content"] += error_msg
        yield f"πspecial reasoning blockπ: {error_msg}"
        return

    custom_prompt = """Selected tools and their queries: \n"""
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
    llm_with_tools.set_tracking_context(query_id, db, MessageMetaStepType.TOOL_ORCHESTRATION)

    # Track execution
    tool_flow_steps = []
    current_step = step_order
    messages: List[BaseMessage] = []
    responses: List[Tuple[str, str, Union[str, Dict[str, Any]]]] = []

    messages.append(SystemMessage(content=multi_tool_system_prompt))

    try:
        query_to_use = parsed_query
        messages.append(HumanMessage(content=custom_prompt + f"\n\nUser Query: {query_to_use}"))

        # Yield initial status
        reasoning_chunk = "🤖 Retrieving information...\n\n"
        if reasoning_container is not None:
            reasoning_container["content"] += reasoning_chunk
        yield f"πspecial reasoning blockπ: {reasoning_chunk}"

        # Initial invocation of LLM with tools
        llm_response = await chatbot_instance._tool_orchestration_llm_call(llm_with_tools, messages)

        # Handle failure case
        if llm_response == "TOOL_ORCHESTRATION_FAILURE":
            error_msg = "❌ Error in tool orchestration. Please try again\n\n"
            if reasoning_container is not None:
                reasoning_container["content"] += error_msg
            yield f"πspecial reasoning blockπ: {error_msg}"
            return

        ai_message = cast(AIMessage, llm_response)
        messages.append(ai_message)

        if not ai_message.tool_calls:
            log.info(f"ChatID: {chat_id} - No tool calls found in the initial LLM response. {ai_message.content}")
            responses.append((Agents.GENERIC_AGENT, query_to_use, ai_message.content))  # type: ignore

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
                    try:
                        # Execute the clarification tool to get payload
                        tool_to_execute = next((t for t in tools if t.name == tool_name), None)
                        result = await tool_to_execute.ainvoke(tool_args) if tool_to_execute else "{}"
                    except Exception as e:
                        log.error(f"ChatID: {chat_id} - Clarification tool failed: {e}")
                        result = "{}"

                    # Persist flow step with clarification_pending
                    try:
                        from pi.app.models.enums import ExecutionStatus
                        from pi.services.chat.utils import standardize_flow_step_content as _std

                        payload = str(result)
                        tool_flow_steps.append({
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL,
                            "tool_name": "ask_for_clarification",
                            "content": _std(payload, FlowStepType.TOOL),
                            "execution_data": {
                                "args": tool_args,
                                "clarification_pending": True,
                                "clarification_payload": payload,
                                # Store planning context to avoid re-routing on follow-up
                                "selected_categories": [agent.agent for agent in selected_agents],
                                "bound_tool_names": [t.name for t in tools],
                                # CRITICAL: Store the original query so we can reconstruct full context on clarification follow-up
                                "original_query": original_query,
                            },
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
                    try:
                        # Execute the tool
                        tool_result = await tool_to_execute.ainvoke(tool_args)

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

                        tool_flow_steps.append({
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL.value,
                            "tool_name": tool_name,
                            "content": standardize_flow_step_content(tool_result, FlowStepType.TOOL),
                            "execution_data": execution_data,
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
                        user_friendly_tool_name = chatbot_instance._tool_name_shown_to_user(tool_name)
                        reasoning_chunk = f"❌ Error executing {user_friendly_tool_name}: {str(e)}\n\n"
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

                        tool_flow_steps.append({
                            "step_order": current_step,
                            "step_type": FlowStepType.TOOL,
                            "tool_name": tool_name,
                            "content": f"Error: {str(e)}",
                            "execution_data": error_execution_data,
                        })
                        current_step += 1

                        error_message = ToolMessage(content=f"Error executing {tool_name}: {str(e)}", tool_call_id=str(tool_id or ""))
                        tool_messages.append(error_message)
                else:
                    log.error(f"ChatID: {chat_id} - Tool {tool_name} not found")
                    user_friendly_tool_name = chatbot_instance._tool_name_shown_to_user(tool_name)
                    reasoning_chunk = f"❌ {user_friendly_tool_name} not found\n\n"
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
                error_msg = "❌ Error in tool orchestration. Please try again\n\n"
                if reasoning_container is not None:
                    reasoning_container["content"] += error_msg
                yield f"πspecial reasoning blockπ: {error_msg}"
                return

            ai_message = cast(AIMessage, llm_response)
            messages.append(ai_message)

        # Add all tool flow steps to database
        if tool_flow_steps:
            async with get_streaming_db_session() as _subdb:
                flow_steps_result = await _upsert_message_flow_steps(message_id=query_id, chat_id=chat_id, flow_steps=tool_flow_steps, db=_subdb)
            if flow_steps_result["message"] != "success":
                error_msg = "❌ An unexpected error occurred. Please try again\n\n"
                if reasoning_container is not None:
                    reasoning_container["content"] += error_msg
                yield f"πspecial reasoning blockπ: {error_msg}"
                return

        # Yield final status
        reasoning_chunk = "📝 Generating final response...\n\n"
        if reasoning_container is not None:
            reasoning_container["content"] += reasoning_chunk
        yield f"πspecial reasoning blockπ: {reasoning_chunk}"

        # Format responses for the combination prompt
        formatted_responses = StandardAgentResponse.format_responses(responses, chat_id, query_flow_store)
        formatted_history = format_conversation_history(conversation_history)

        # Stream the combined response
        async for chunk in chatbot_instance.combined_response_stream(parsed_query, formatted_responses, formatted_history, user_meta, user_id):
            yield chunk
    except Exception as e:
        log.error(f"ChatID: {chat_id} - Error in LangChain tool orchestration: {str(e)}")
        error_msg = "❌ Error orchestrating retrieval tools\n\n"
        if reasoning_container is not None:
            reasoning_container["content"] += error_msg
        yield f"πspecial reasoning blockπ: {error_msg}"
