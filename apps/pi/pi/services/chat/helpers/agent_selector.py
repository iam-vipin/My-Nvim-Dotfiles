"""Agent selection and routing logic."""

import time
from typing import List
from typing import Tuple
from typing import Type
from typing import Union
from typing import cast

from langchain_core.prompts import ChatPromptTemplate
from openai import LengthFinishReasonError  # type: ignore[attr-defined]
from pydantic.v1 import BaseModel

from pi import logger
from pi import settings
from pi.app.models.enums import FlowStepType
from pi.app.models.enums import MessageMetaStepType
from pi.services.chat.prompts import router_prompt
from pi.services.chat.utils import standardize_flow_step_content
from pi.services.llm.llms import LLMConfig
from pi.services.llm.llms import create_openai_llm
from pi.services.retrievers.pg_store.message import upsert_message_flow_steps
from pi.services.schemas.chat import AgentQuery
from pi.services.schemas.chat import Agents
from pi.services.schemas.chat import RouteQuery
from pi.services.schemas.chat import RoutingResult

log = logger.getChild(__name__)


async def select_agents(
    chatbot_instance, target, parsed_query, enhanced_conversation_history, workspace_in_context, query_id, chat_id, step_order, db
) -> Tuple[List[AgentQuery], int, Union[str, None]]:
    """Select appropriate agents based on query and context."""
    selected_agents: list[AgentQuery] = []
    error_message = None

    if workspace_in_context:
        # Prepare context-aware prompt for the enhanced router
        if enhanced_conversation_history:
            custom_prompt = f"Here is the conversation history for context:\n\n{enhanced_conversation_history}\n\nNew user query: {parsed_query}"
        else:
            custom_prompt = f"Here is the user query: {parsed_query}"

        if target:
            # Append note about resolved entity ID to existing prompt
            note = f"""Please note that the user has mentioned a specific entity of type {target} using the 'mentions'(@entity_name) syntax in their query.
I resolved the UUID of this entity and enhanced the user query with it above.
Since this is a UUID, please always include the structured DB agent in the selected agents list."""  # noqa: E501
            custom_prompt = f"{custom_prompt}\n\n{note}"

        log.info("************************************************")
        log.info(f"ChatID: {chat_id} - Router custom prompt: {custom_prompt}")
        log.info("************************************************")
        # Create router dynamically with tracking context
        route_query_type: Type[BaseModel] = RouteQuery  # type: ignore[assignment]
        structured_decomposer = chatbot_instance.decomposer_llm.with_structured_output(
            route_query_type,
            include_raw=True,
            method="json_mode",
        )
        structured_decomposer.set_tracking_context(query_id, db, MessageMetaStepType.ROUTER, chat_id=str(chat_id))

        # Create dynamic router chain
        json_schema_hint = '{"decomposed_queries": [{"agent": "<agent_name>", "query": "<query_text>"}]}'
        router_prompt_template = ChatPromptTemplate.from_messages([
            (
                "system",
                "{base_prompt}\n\nRespond **only** in valid JSON format matching this schema:\n{json_schema_hint}",
            ),
            ("human", "{custom_prompt}"),
        ]).partial(base_prompt=router_prompt, json_schema_hint=json_schema_hint)
        dynamic_router = router_prompt_template | structured_decomposer

        # handle openai.LengthFinishReasonError by retrying once with a slightly higher temperature
        try:
            router_start = time.time()
            log.info(f"ChatID: {chat_id} - Starting router LLM call")
            routing_result = cast(RoutingResult, await dynamic_router.ainvoke({"custom_prompt": custom_prompt}))
            router_elapsed = time.time() - router_start
            log.info(f"ChatID: {chat_id} - Router LLM call completed in {router_elapsed:.2f}s")
        except LengthFinishReasonError as e:
            log.error(f"Error during routing: {e}")

            # Determine a new temperature (current + 0.1, capped at 1.0)
            base_temp: float = 0.0  # decomposer_llm default temperature
            new_temp: float = min(round(base_temp + 0.1, 2), 1.0)

            log.debug("Retrying routing with increased temperature. Old: %s, New: %s", base_temp, new_temp)

            # Create new decomposer LLM with higher temperature and structured output
            # Switch to GPT-4o to mitigate length-finish errors during structured parsing
            retry_decomposer_config = LLMConfig(model=settings.llm_model.GPT_4O, temperature=new_temp, streaming=False)
            retry_decomposer_llm = create_openai_llm(retry_decomposer_config)

            # Create new structured output and router
            # Use the same type alias; mypy: no-redef warning avoided by reusing existing name
            route_query_type_retry: Type[BaseModel] = RouteQuery  # type: ignore[assignment]
            retry_json_llm = retry_decomposer_llm.with_structured_output(
                route_query_type_retry,
                include_raw=True,
                method="json_mode",
            )

            # Set tracking context on the structured LLM instance
            retry_json_llm.set_tracking_context(query_id, db, MessageMetaStepType.ROUTER, chat_id=str(chat_id))

            retry_prompt = ChatPromptTemplate.from_messages([
                ("system", router_prompt),
                ("human", "{custom_prompt}"),
            ])
            retry_router = retry_prompt | retry_json_llm

            retry_start = time.time()
            log.info(f"ChatID: {chat_id} - Starting retry router LLM call")
            routing_result = cast(RoutingResult, await retry_router.ainvoke({"custom_prompt": custom_prompt}))
            retry_elapsed = time.time() - retry_start
            log.info(f"ChatID: {chat_id} - Retry router LLM call completed in {retry_elapsed:.2f}s")

        if routing_result["parsed"] is not None:
            parsed_result = routing_result["parsed"]
            selected_agents = parsed_result.decomposed_queries
            log.info(f"ChatID: {chat_id} - Selected agents before target check: {selected_agents}")
            if target:
                # look if the actions agent is not in the selected_agents list and plane_structured_database_agent is in the selected_agents list
                if Agents.PLANE_ACTION_EXECUTOR_AGENT not in [
                    agent.agent.name for agent in selected_agents
                ] and Agents.PLANE_STRUCTURED_DATABASE_AGENT in [agent.agent.name for agent in selected_agents]:
                    selected_agents.append(AgentQuery(agent=Agents.PLANE_STRUCTURED_DATABASE_AGENT, query=parsed_query))
                    log.info(f"ChatID: {chat_id} - Added plane_structured_database_agent to selected agents: {selected_agents}")
            routing_content = [{"tool": agent.agent.name, "query": agent.query} for agent in selected_agents]
            # Log enhanced history storage
            history_preview = enhanced_conversation_history[:200] if enhanced_conversation_history else "(empty)"
            log.info(
                f"ChatID: {chat_id} - Storing enhanced conversation history in routing step (length={len(enhanced_conversation_history or "")}): {history_preview}"  # noqa: E501
            )
            flow_step_result = await upsert_message_flow_steps(
                message_id=query_id,
                chat_id=chat_id,
                flow_steps=[
                    {
                        "step_order": step_order,
                        "step_type": FlowStepType.ROUTING.value,
                        "tool_name": None,
                        "content": standardize_flow_step_content(routing_content, FlowStepType.ROUTING),
                        "execution_data": {"enhanced_conversation_history": enhanced_conversation_history},
                    }
                ],
                db=db,
            )

            if flow_step_result["message"] != "success":
                # Log the error but continue - flow step logging is not critical for user experience
                log.warning(f"Failed to record agent selection flow step: {flow_step_result.get("error", "Unknown error")}")
                # Continue with agent selection - user should still get their answer

            step_order += 1
        else:
            log.error("Failed to parse the routing result. Fallback to generic agent.")
            selected_agents = [AgentQuery(agent=Agents.GENERIC_AGENT, query=parsed_query)]
    else:
        agent_query_generic = AgentQuery(agent=Agents.GENERIC_AGENT, query=parsed_query)
        selected_agents = [agent_query_generic]

        flow_step_result = await upsert_message_flow_steps(
            message_id=query_id,
            chat_id=chat_id,
            flow_steps=[
                {
                    "step_order": step_order,
                    "step_type": FlowStepType.ROUTING.value,
                    "tool_name": None,
                    "content": f"Generic agent: {parsed_query}",
                    "execution_data": {"enhanced_conversation_history": enhanced_conversation_history},
                }
            ],
            db=db,
        )

        if flow_step_result["message"] != "success":
            # Log the error but continue - flow step logging is not critical for user experience
            log.warning(f"Failed to record agent selection result flow step: {flow_step_result.get("error", "Unknown error")}")
            # Continue with returning selected agents - user should still get their answer

        step_order += 1

    return selected_agents, step_order, error_message
