"""Agent selection and routing logic."""

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
        if target:
            selected_agents = [AgentQuery(agent=Agents.PLANE_STRUCTURED_DATABASE_AGENT, query=parsed_query)]
        else:
            # Prepare context-aware prompt for the enhanced router
            if enhanced_conversation_history:
                custom_prompt = f"Here is the conversation history for context:\n\n{enhanced_conversation_history}\n\nNew user query: {parsed_query}"
            else:
                custom_prompt = f"Here is the user query: {parsed_query}"

            # Create router dynamically with tracking context
            route_query_type: Type[BaseModel] = RouteQuery  # type: ignore[assignment]
            structured_decomposer = chatbot_instance.decomposer_llm.with_structured_output(route_query_type, include_raw=True)
            structured_decomposer.set_tracking_context(query_id, db, MessageMetaStepType.ROUTER)

            # Create dynamic router chain
            router_prompt_template = ChatPromptTemplate.from_messages([
                ("system", router_prompt),
                ("human", "{custom_prompt}"),
            ])
            dynamic_router = router_prompt_template | structured_decomposer

            # handle openai.LengthFinishReasonError by retrying once with a slightly higher temperature
            try:
                routing_result = cast(RoutingResult, await dynamic_router.ainvoke({"custom_prompt": custom_prompt}))
            except LengthFinishReasonError as e:
                log.error(f"Error during routing: {e}")

                # Determine a new temperature (current + 0.1, capped at 1.0)
                base_temp: float = 0.0  # decomposer_llm default temperature
                new_temp: float = min(round(base_temp + 0.1, 2), 1.0)

                log.debug("Retrying routing with increased temperature. Old: %s, New: %s", base_temp, new_temp)

                # Create new decomposer LLM with higher temperature and structured output
                retry_decomposer_config = LLMConfig(model=settings.llm_model.GPT_4_1, temperature=new_temp, streaming=False)
                retry_decomposer_llm = create_openai_llm(retry_decomposer_config)

                # Create new structured output and router
                # Use the same type alias; mypy: no-redef warning avoided by reusing existing name
                route_query_type_retry: Type[BaseModel] = RouteQuery  # type: ignore[assignment]
                retry_json_llm = retry_decomposer_llm.with_structured_output(route_query_type_retry, include_raw=True)

                # Set tracking context on the structured LLM instance
                retry_json_llm.set_tracking_context(query_id, db, MessageMetaStepType.ROUTER)

                retry_prompt = ChatPromptTemplate.from_messages([
                    ("system", router_prompt),
                    ("human", "{custom_prompt}"),
                ])
                retry_router = retry_prompt | retry_json_llm

                routing_result = cast(RoutingResult, await retry_router.ainvoke({"custom_prompt": custom_prompt}))

            if routing_result["parsed"] is not None:
                parsed_result = routing_result["parsed"]
                selected_agents = parsed_result.decomposed_queries

                routing_content = [{"tool": agent.agent.name, "query": agent.query} for agent in selected_agents]
                flow_step_result = await upsert_message_flow_steps(
                    message_id=query_id,
                    chat_id=chat_id,
                    flow_steps=[
                        {
                            "step_order": step_order,
                            "step_type": FlowStepType.ROUTING.value,
                            "tool_name": None,
                            "content": standardize_flow_step_content(routing_content, FlowStepType.ROUTING),
                            "execution_data": {},
                        }
                    ],
                    db=db,
                )

                if flow_step_result["message"] != "success":
                    error_message = "An unexpected error occurred. Please try again"

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
                    "execution_data": {},
                }
            ],
            db=db,
        )

        if flow_step_result["message"] != "success":
            error_message = "An unexpected error occurred. Please try again"

        step_order += 1

    return selected_agents, step_order, error_message
