import asyncio
import uuid
from collections.abc import AsyncIterator
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple
from typing import Union

from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi import settings
from pi.app.models import Message
from pi.app.models.enums import FlowStepType
from pi.app.models.enums import UserTypeChoices
from pi.app.schemas.chat import ChatRequest
from pi.services.chat.utils import resolve_workspace_slug
from pi.services.feature_flags import FeatureFlagContext
from pi.services.feature_flags import feature_flag_service
from pi.services.llm.error_handling import llm_error_handler
from pi.services.query_utils import parse_query
from pi.services.retrievers.pg_store.attachment import link_attachments_to_message
from pi.services.retrievers.pg_store.chat import check_if_chat_exists
from pi.services.retrievers.pg_store.message import upsert_message
from pi.services.retrievers.pg_store.message import upsert_message_flow_steps
from pi.services.schemas.chat import AgentQuery
from pi.services.schemas.chat import Agents
from pi.services.schemas.chat import QueryFlowStore

from .helpers import action_executor
from .helpers import agent_executor
from .helpers import agent_selector

# Import helper modules
from .helpers import response_processor
from .helpers import title_service
from .helpers import tool_utils

# from pi.services.schemas.chat import AgentOrder
from .kit import ChatKit

# Router is now created dynamically in _route_query to ensure proper token tracking
from .templates import preset_question_flow

# from .multi_tool_orch import agent_chaining_order
from .utils import StandardAgentResponse
from .utils import conv_history_from_app_query
from .utils import is_model_enabled_for_workspace
from .utils import mask_uuids_in_text
from .utils import process_conv_history
from .utils import standardize_flow_step_content

log = logger.getChild(__name__)
MAX_CHAT_LENGTH = settings.chat.MAX_CHAT_LENGTH
MENTION_TAGS = settings.chat.MENTION_TAGS

# Feature flag constant for action execution - using settings
PI_ACTION_EXECUTION = settings.feature_flags.PI_ACTION_EXECUTION


# mask_uuids_in_text moved to utils.py


class PlaneChatBot(ChatKit):
    def __init__(self, llm: str = "gpt-4.1", token: str | None = None):
        """Initializes PlaneChatBot with specified LLM model."""
        super().__init__(switch_llm=llm, token=token)
        self.chat_title = None

    @llm_error_handler(fallback_message="TOOL_ORCHESTRATION_FAILURE", max_retries=2, log_context="[TOOL_ORCHESTRATION]")
    async def _tool_orchestration_llm_call(self, llm_with_tools, messages):
        """Perform tool orchestration LLM call with error handling."""
        return await llm_with_tools.ainvoke(messages)

    async def _initialize_chat_context(self, data, chat_exists, db):
        """Initialize chat context and history based on whether this is a new chat."""
        # Import here to avoid circular dependency
        from pi.services.retrievers.pg_store.chat import upsert_chat
        from pi.services.retrievers.pg_store.chat import upsert_user_chat_preference

        chat_id = data.chat_id
        user_id = data.user_id
        is_new = data.is_new
        is_project_chat = data.is_project_chat or False

        is_focus_enabled = data.workspace_in_context
        focus_project_id = data.project_id or None
        focus_workspace_id = data.workspace_id or None
        if is_new:
            # For new chats, the chat record should already exist from initialize-chat endpoint
            # but if not, create it (backward compatibility)
            if not chat_exists:
                chat_result = await upsert_chat(
                    chat_id=chat_id,
                    user_id=user_id,
                    title="",
                    description="",
                    db=db,
                    workspace_id=data.workspace_id,
                    workspace_slug=data.workspace_slug,
                    is_project_chat=is_project_chat,
                    workspace_in_context=data.workspace_in_context,
                )

                # Chat search index upserted via Celery background task

                if chat_result["message"] != "success":
                    return None, "An unexpected error occurred. Please try again"
                # log.info(f"ChatID: {chat_id} - Created new chat record")

        # Create user chat preference
        try:
            user_chat_preference_result = await upsert_user_chat_preference(
                user_id=user_id,
                chat_id=chat_id,
                db=db,
                is_focus_enabled=is_focus_enabled,
                focus_project_id=focus_project_id,
                focus_workspace_id=focus_workspace_id,
            )
            if user_chat_preference_result["message"] != "success":
                return None, "An unexpected error occurred. Please try again"
            # log.info(f"ChatID: {chat_id} - Upserted user chat preference record")
        except Exception as e:
            log.error(f"Error upserting user chat preference: {e}")
            return None, "An unexpected error occurred. Please try again"

        if is_new:
            return [], None
        else:
            res = await self.retrieve_chat_history(chat_id=chat_id, db=db)
            # log.info(f"ChatID: {chat_id} - Retrieved chat history: {res}")
            return await process_conv_history(res["dialogue"], db, chat_id, user_id), None

    def _create_query_flow_store(self, data, workspace_in_context):
        """Create a query flow store to track processing of a query."""
        return {
            "is_new": data.is_new,
            "query": data.query,
            "llm": data.llm,
            "chat_id": str(data.chat_id),
            "user_id": str(data.user_id),
            "project_id": (str(data.project_id) if data.project_id else None),
            "workspace_id": (str(data.workspace_id) if data.workspace_id else None),
            "is_temp": data.is_temp,
            "parsed_query": "",
            "rewritten_query": "",  # Set equal to parsed_query for backward compatibility
            "router_result": "",
            "tool_response": "",
            "answer": "",
            "workspace_in_context": workspace_in_context,
        }

    async def _select_agents(
        self, target, parsed_query, enhanced_conversation_history, workspace_in_context, query_id, chat_id, step_order, db
    ) -> Tuple[List[AgentQuery], int, Union[str, None]]:
        """Select appropriate agents based on query and context."""
        return await agent_selector.select_agents(
            self, target, parsed_query, enhanced_conversation_history, workspace_in_context, query_id, chat_id, step_order, db
        )

    async def _execute_single_agent(
        self,
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
        enhanced_query_for_processing,
        query_id,
        step_order,
        workspace_in_context,
        db,
        preset_tables=None,
        preset_sql_query=None,
        preset_placeholders=None,
    ):
        """Execute a single agent and prepare response stream."""
        return await agent_executor.execute_single_agent(
            self,
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
            enhanced_query_for_processing,
            query_id,
            step_order,
            workspace_in_context,
            db,
            preset_tables,
            preset_sql_query,
            preset_placeholders,
        )

    async def _execute_action_with_retrieval(
        self,
        selected_agents,
        user_meta,
        workspace_id,
        workspace_slug,
        project_id,
        conversation_history,
        enhanced_conversation_history,  # 🆕 Enhanced context parameter
        user_id,
        chat_id,
        query_flow_store,
        parsed_query,
        query_id,
        step_order,
        db,
        reasoning_container=None,
        is_project_chat=None,
        pi_sidebar_open=None,
        sidebar_open_url=None,
    ) -> AsyncIterator[str]:
        """Execute action with access to retrieval tools"""
        async for chunk in action_executor.execute_action_with_retrieval(
            self,
            selected_agents,
            user_meta,
            workspace_id,
            workspace_slug,
            project_id,
            conversation_history,
            enhanced_conversation_history,  # 🆕 Pass enhanced context
            user_id,
            chat_id,
            query_flow_store,
            parsed_query,
            query_id,
            step_order,
            db,
            reasoning_container,
            is_project_chat,
            pi_sidebar_open,
            sidebar_open_url,
        ):
            yield chunk

    async def _execute_multi_agents(
        self,
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
        enhanced_query_for_processing,
        query_id,
        step_order,
        db,
        original_query,
        reasoning_container=None,
        workspace_in_context: bool | None = None,
    ) -> AsyncIterator[str]:
        """Execute multiple agents using LangChain tool calling for orchestration with real-time streaming."""
        async for chunk in agent_executor.execute_multi_agents(
            self,
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
            enhanced_query_for_processing,
            query_id,
            step_order,
            db,
            original_query,
            reasoning_container,
            workspace_in_context=workspace_in_context,
        ):
            yield chunk

    def _tool_name_to_agent(self, tool_name: str) -> str:
        """Convert tool name back to agent name for response formatting."""
        return tool_utils.tool_name_to_agent(tool_name)

    def _tool_name_shown_to_user(self, tool_name: str) -> str:
        """Convert tool name to a user-friendly name."""
        return tool_utils.tool_name_shown_to_user(tool_name)

    async def _process_attachments_for_query(
        self, attachment_ids: Optional[List[UUID4]], chat_id: UUID4, user_id: Optional[UUID4], query: str, query_id: UUID4, db: AsyncSession
    ) -> Tuple[List[Dict[str, Any]], str]:
        """
        Process attachments and extract context for a query.

        Returns:
            Tuple of (attachment_blocks, attachment_context)
        """
        attachment_blocks = []
        attachment_context = ""

        if attachment_ids and user_id:
            # Import here to avoid circular imports
            from pi.services.chat.utils import process_message_attachments_for_llm

            # Convert UUID list to string list for processing
            attachment_id_strings = [str(aid) for aid in attachment_ids]
            attachment_blocks = await process_message_attachments_for_llm(
                attachment_ids=attachment_id_strings,
                chat_id=chat_id,
                user_id=user_id,
                db=db,
            )
            log.info(f"ChatID: {chat_id} - Processed {len(attachment_blocks)} attachments for LLM")

            # Extract context from attachments to enhance query understanding
            if attachment_blocks:
                attachment_context = await self.extract_attachment_context(
                    attachment_blocks=attachment_blocks, user_query=query, db=db, message_id=query_id
                )
                if attachment_context:
                    log.info(f"ChatID: {chat_id} - Extracted attachment context: {attachment_context[:200]}...")

        # Set attachment blocks context for tool execution
        self._current_attachment_blocks = attachment_blocks

        return attachment_blocks, attachment_context

    def _agent_to_tool_name(self, agent_name: str) -> str:
        """Convert agent name to corresponding tool name."""
        return tool_utils.agent_to_tool_name(agent_name)

    async def _process_response(self, base_stream, chat_id, query_id, response_id, switch_llm, db, reasoning=""):
        """Process streaming response and store the final result."""
        async for chunk in response_processor.process_response(base_stream, chat_id, query_id, response_id, switch_llm, db, reasoning):
            yield chunk

    async def process_query_stream(self, data: ChatRequest, db: AsyncSession) -> AsyncIterator[str]:
        """
        This method takes a user query, processes it through various stages (parsing, routing, agent selection, agent execution),
        and streams back the response chunks as they're generated.

        Steps in the Process

        1. Initialize the Query Context
         - Takes a ChatRequest object containing the query, workspace/project context, user info
         - Sets up a QueryFlowStore to track the query's journey through the system
         - Determines if the workspace should be included in context

        2. Chat History Management
         - For new chats, creates a record in the database
         - For existing chats, retrieves conversation history
         - Processes and formats the history for context

        3. Query Processing
         - Parses the query to extract any specific targets (via parse_query)
         - Creates a user message record in the database
         - Context enhancement is now integrated into the router step

        4. Agent Selection
         - Determines which agent(s) should handle the query:
           ~ For targeted queries, uses the appropriate agent
           ~ For general queries with workspace context, uses a router to decompose the query
           ~ Without workspace context, defaults to a generic agent
         - Records routing decisions as flow steps

        5. Agent Execution
         - For single-agent cases:
           ~ Calls the appropriate handler based on agent type
           ~ Processes the response and prepares it for streaming
         - For multi-agent cases:
           ~ Prioritizes and executes multiple agents
           ~ Collects and formats responses from all agents
           ~ Combines them into a coherent answer

        6. Response Streaming
         - Streams the response chunks to the user as they're generated
         - Collects the full response for database storage

        7. Database Updates
         - Creates an assistant message record with the final response
         - For new chats, generates a title based on the query and response
        """

        # Extract data
        query = data.query
        switch_llm = data.llm
        workspace_id = str(data.workspace_id) if data.workspace_id else None
        project_id = str(data.project_id) if data.project_id else None
        chat_id = data.chat_id
        user_id = data.user_id
        # is_temp = data.is_temp
        user_meta = data.context
        workspace_in_context = data.workspace_in_context if await is_model_enabled_for_workspace(str(chat_id), switch_llm, db) else False
        workspace_slug = data.workspace_slug
        attachment_ids = data.attachment_ids or []
        request_source = data.source
        step_order = 0

        # If workspace_id is None but project_id is provided, resolve workspace_id from project_id
        if not workspace_id and project_id:
            try:
                from pi.app.api.v1.helpers.plane_sql_queries import resolve_workspace_id_from_project_id

                resolved_workspace_id = await resolve_workspace_id_from_project_id(project_id)
                if resolved_workspace_id:
                    workspace_id = str(resolved_workspace_id)
                    log.info(f"Resolved workspace_id {workspace_id} from project_id {project_id}")
            except Exception as e:
                log.error(f"Failed to resolve workspace_id from project_id {project_id}: {e}")

        # Initialize variables for use in finally block
        parsed_query = query
        final_response = ""
        reasoning = ""  # Single string to collect reasoning blocks
        chat_exists = False

        # Create or reuse message ids
        # If a queued token_id is provided (from two-step flow), reuse it as the user message id
        query_id = None
        try:
            token_id = None
            if isinstance(user_meta, dict):
                token_id = user_meta.get("token_id")
            if token_id:
                query_id = uuid.UUID(str(token_id))
        except Exception:
            query_id = None
        if query_id is None:
            query_id = uuid.uuid4()
        response_id = uuid.uuid4()

        # Validate chat_id is always provided
        if chat_id is None:
            final_response = "Chat ID is required. For new chats, call /initialize-chat/ first."  # Set final_response for title generation
            yield final_response
            return

        chat_exists = await check_if_chat_exists(chat_id, db)
        if not chat_exists:
            log.warning(f"ChatID: {chat_id} - Chat does not exist. Creating a new chat in the database")

        # Initialize query flow store
        query_flow_store = self._create_query_flow_store(data, workspace_in_context)

        # Parse query to detect target and get clean parsed content
        target, parsed_query = parse_query(query)

        # Initialize chat and get conversation history
        conversation_history_dict, error = await self._initialize_chat_context(data, chat_exists, db)
        if error:
            final_response = error  # Set final_response for title generation
            yield error
            return

        # Collect all the previous previous attachments to pass to llm
        all_attachment_ids = attachment_ids.copy() if attachment_ids else []

        if not data.is_new and conversation_history_dict:
            # Get raw conversation history with attachments
            from pi.services.retrievers.pg_store.chat import retrieve_chat_history

            raw_history = await retrieve_chat_history(chat_id=chat_id, db=db, dialogue_object=True)

            if raw_history.get("dialogue"):
                # Collect ALL attachments from ALL messages in history
                attachment_count = 0
                for qa_pair in raw_history["dialogue"]:
                    if qa_pair.get("attachments"):
                        for att in qa_pair["attachments"]:
                            att_id = att.get("id")
                            if att_id and att_id not in [str(aid) for aid in all_attachment_ids]:
                                all_attachment_ids.append(uuid.UUID(att_id))
                                attachment_count += 1

                if attachment_count > 0:
                    log.info(f"ChatID: {chat_id} - Collected {attachment_count} attachments from conversation history")

        if not workspace_slug:
            # Use the resolved workspace_id (which might have been resolved from project_id)
            # Convert string workspace_id to UUID if needed
            workspace_uuid = uuid.UUID(workspace_id) if workspace_id else None
            workspace_slug = await resolve_workspace_slug(workspace_uuid, data.workspace_slug)

        # TODO: Include storing parent_id as well
        # Reuse existing message row if query_id originated from a queued token; otherwise insert a new row.
        user_message_result = await upsert_message(
            message_id=query_id,
            chat_id=chat_id,
            content=query,
            parsed_content=parsed_query,
            user_type=UserTypeChoices.USER.value,
            llm_model=switch_llm,
            workspace_slug=workspace_slug,
            db=db,
        )

        if user_message_result["message"] != "success":
            # Database insert operation failed, both user and assistant messages will not be stored
            final_response = "An unexpected error occurred. Please try again"  # Set final_response for title generation
            yield final_response
            return

        # Process all attachments for LLM (current + all from history)
        attachment_blocks, attachment_context = await self._process_attachments_for_query(
            all_attachment_ids, chat_id, user_id, parsed_query, query_id, db
        )

        # Create enhanced query for routing/agent selection if we have attachment context
        # But keep parsed_query clean for database storage
        enhanced_query_for_processing = self.enhance_query_with_context(parsed_query, attachment_context)
        if attachment_context:
            log.info(f"ChatID: {chat_id} - Enhanced query with attachment context for routing")

        # Link attachments to the created message
        if data.attachment_ids:
            await link_attachments_to_message(attachment_ids=data.attachment_ids, message_id=query_id, chat_id=data.chat_id, user_id=user_id, db=db)

        # log input and other important info:
        log.info(f"ChatID: {chat_id} - Input query: {query}")
        log.info(f"ChatID: {chat_id} - Enhanced query: {enhanced_query_for_processing}")
        log.info(f"ChatID: {chat_id} - Attachment context: {attachment_context}")
        log.info(f"ChatID: {chat_id} - User meta: {user_meta}")
        log.info(f"ChatID: {chat_id} - Workspace in context: {workspace_in_context}")
        log.info(f"ChatID: {chat_id} - Workspace slug: {workspace_slug}")
        log.info(f"ChatID: {chat_id} - Workspace ID: {workspace_id}")
        log.info(f"ChatID: {chat_id} - Is New Chat: {data.is_new}")
        log.info(f"ChatID: {chat_id} - Source: {data.source}")
        log.info(f"ChatID: {chat_id} - Is Project Chat: {data.is_project_chat}")
        log.info(f"ChatID: {chat_id} - User ID: {user_id}")
        log.info(f"ChatID: {chat_id} - Project ID: {project_id}")
        log.info(f"ChatID: {chat_id} - LLM: {switch_llm}")

        # Handle case where conversation_history_dict might be None or a list
        if data.source == "app":
            query, enhanced_conversation_history, conversation_history = conv_history_from_app_query(query)
            parsed_query = query
            # As of now, no attachments from external app queries are supported.
            enhanced_query_for_processing = query
        else:
            if conversation_history_dict is None or isinstance(conversation_history_dict, list):
                conversation_history = []
                enhanced_conversation_history = ""
            else:
                conversation_history = conversation_history_dict["langchain_conv_history"]
                enhanced_conversation_history = conversation_history_dict["enhanced_conv_history"]

        if not data.is_new:
            try:
                # If a clarification is pending, enrich user_meta with context from message_clarifications
                from pi.services.retrievers.pg_store.clarifications import get_latest_pending_for_chat as _get_pending_clar

                log.info(f"ChatID: {chat_id} - Checking for pending clarifications...")
                clar_row = await _get_pending_clar(db=db, chat_id=uuid.UUID(str(chat_id)))
                if clar_row:
                    clar_payload = clar_row.payload or {}
                    log.info(
                        f"ChatID: {chat_id} - Found pending clarification, enriching user_meta. Kind: {clar_row.kind}, Categories: {clar_row.categories}"  # noqa: E501
                    )
                    user_meta["clarification_context"] = {
                        "reason": clar_payload.get("reason"),
                        "missing_fields": clar_payload.get("missing_fields") or [],
                        "disambiguation_options": clar_payload.get("disambiguation_options") or [],
                        "category_hints": clar_payload.get("category_hints") or [],
                        "answer_text": parsed_query,
                        "original_query": clar_row.original_query,  # CRITICAL: Include original query for full context
                        "clarifies_message_id": str(clar_row.message_id),
                    }
                    log.info(f"ChatID: {chat_id} - Enriched user_meta with clarification_context")
                    # Record a clarification_response flow step for traceability (not marking resolved yet)
                    try:
                        await upsert_message_flow_steps(
                            message_id=query_id,
                            chat_id=chat_id,
                            flow_steps=[
                                {
                                    "step_order": step_order + 1,
                                    "step_type": FlowStepType.TOOL.value,
                                    "tool_name": "clarification_response",
                                    "content": standardize_flow_step_content(user_meta.get("clarification_context", {}), FlowStepType.TOOL),
                                    "execution_data": {
                                        "clarifies_message_id": str(clar_row.message_id),
                                        "clarification_resolved": False,
                                    },
                                }
                            ],
                            db=db,
                        )
                        # Push subsequent steps by +1
                        step_order = step_order + 2
                    except Exception:
                        pass
                else:
                    log.info(f"ChatID: {chat_id} - No pending clarification found")
            except Exception as _e:
                log.warning(f"ChatID: {chat_id} - Clarification table check failed: {_e}")

        # Check if the query is a preset question
        preset_query_steps = preset_question_flow(query)
        if preset_query_steps:
            log.info(f"ChatID: {chat_id} - Using preset question flow for: {query}")
            log.info(f"ChatID: {chat_id} - Preset query steps: {preset_query_steps}")

        try:
            # Set token tracking context for this query
            self.set_token_tracking_context(query_id, db, chat_id=str(chat_id))

            # Set attachment blocks context for tool execution
            self._current_attachment_blocks = attachment_blocks

            reasoning_chunk = "🤖 Understanding the query...\n\n"
            reasoning += reasoning_chunk
            yield f"πspecial reasoning blockπ: {reasoning_chunk}"

            # Query already parsed above, just set step_order
            step_order = 1

            reasoning_chunk = "🤖 Curating the ideal response path...\n\n"
            reasoning += reasoning_chunk
            yield f"πspecial reasoning blockπ: {reasoning_chunk}"

            # Select appropriate agents
            if preset_query_steps:
                # Use preset agents instead of routing
                selected_agents = []
                for step in preset_query_steps:
                    reasoning_messages = step.get("reasoning_messages", [])
                    agents = step.get("agents", [])

                    # Show preset reasoning messages
                    for reasoning_msg in reasoning_messages:
                        masked_reasoning_msg = mask_uuids_in_text(reasoning_msg)
                        reasoning_chunk = f"{masked_reasoning_msg}\n\n"
                        reasoning += reasoning_chunk
                        yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                    # Convert preset agents to AgentQuery format
                    for agent_config in agents:
                        agent_name = agent_config.get("agent")
                        agent_query = agent_config.get("query")
                        if agent_name and agent_query:
                            selected_agents.append(AgentQuery(agent=agent_name, query=agent_query))

                # Record preset routing as flow step
                if selected_agents:
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

                    # Ensure routing flow step insert cannot stall the stream
                    try:
                        flow_step_result = await asyncio.wait_for(
                            upsert_message_flow_steps(
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
                            ),
                            timeout=2.0,
                        )
                    except asyncio.TimeoutError:
                        log.warning("Timed out recording RAG routing flow step; continuing")
                        flow_step_result = {"message": "error", "error": "timeout"}

                    if flow_step_result["message"] != "success":
                        # Log the error but continue - flow step logging is not critical for user experience
                        log.warning(f"Failed to record RAG routing flow step: {flow_step_result.get("error", "Unknown error")}")
                        # Continue with response generation - user should still get their answer

                    step_order += 1
                error = None
            elif isinstance(user_meta, dict) and user_meta.get("clarification_context"):
                # Skip routing for clarification follow-up and use deterministic clarification record
                log.info(f"ChatID: {chat_id} - Processing clarification follow-up, skipping router")
                try:
                    from pi.services.retrievers.pg_store.clarifications import get_latest_pending_for_chat
                    from pi.services.retrievers.pg_store.clarifications import resolve_clarification

                    selected_agents = []
                    clar_row = await get_latest_pending_for_chat(db=db, chat_id=uuid.UUID(str(chat_id)))

                    if clar_row:
                        # Build agents based on stored kind
                        if (clar_row.kind or "").lower() == "action":
                            selected_agents.append(AgentQuery(agent=Agents.PLANE_ACTION_EXECUTOR_AGENT, query=parsed_query))
                            flow_kind = "action"
                        else:
                            for agent_name in clar_row.categories or []:
                                selected_agents.append(AgentQuery(agent=agent_name, query=parsed_query))
                            flow_kind = "retrieval"

                        # Record skipped routing as flow step
                        routing_content = [{"tool": agent.agent, "query": agent.query} for agent in selected_agents]
                        flow_step_result = await upsert_message_flow_steps(
                            message_id=query_id,
                            chat_id=chat_id,
                            flow_steps=[
                                {
                                    "step_order": step_order,
                                    "step_type": FlowStepType.ROUTING.value,
                                    "tool_name": "clarification_skip_router",
                                    "content": standardize_flow_step_content(routing_content, FlowStepType.ROUTING),
                                    "execution_data": {
                                        "skipped_routing": True,
                                        "source": "clarification_followup",
                                        "flow": flow_kind,
                                        "raw_user_input": parsed_query,
                                    },
                                }
                            ],
                            db=db,
                        )
                        if flow_step_result["message"] != "success":
                            log.warning("Failed to record skipped routing flow step")
                        step_order += 1

                        # Mark clarification as resolved
                        try:
                            await resolve_clarification(
                                db,
                                clarification_id=clar_row.id,
                                answer_text=parsed_query,
                                resolved_by_message_id=query_id,
                            )
                        except Exception as e:
                            log.warning(f"ChatID: {chat_id} - Failed to resolve clarification: {e}")

                        error = None
                    else:
                        # No clarification record found - fall back to regular routing
                        selected_agents, step_order, error = await self._select_agents(
                            target,
                            enhanced_query_for_processing,
                            enhanced_conversation_history,
                            workspace_in_context,
                            query_id,
                            chat_id,
                            step_order,
                            db,
                        )

                except Exception as e:
                    log.error(f"ChatID: {chat_id} - Error processing clarification follow-up: {e}")
                    selected_agents, step_order, error = await self._select_agents(
                        target, enhanced_query_for_processing, enhanced_conversation_history, workspace_in_context, query_id, chat_id, step_order, db
                    )
            else:
                # Regular agent selection
                selected_agents, step_order, error = await self._select_agents(
                    target, enhanced_query_for_processing, enhanced_conversation_history, workspace_in_context, query_id, chat_id, step_order, db
                )

            if error:
                # Store error message
                await upsert_message(
                    message_id=response_id,
                    chat_id=chat_id,
                    content=error,
                    user_type=UserTypeChoices.ASSISTANT.value,
                    parent_id=query_id,
                    llm_model=switch_llm,
                    reasoning=reasoning,
                    db=db,
                )

                # Error message search index upserted via Celery background task

                final_response = error  # Set final_response for title generation
                yield error
                return

            # Check if action execution agent is present
            has_action_agent = any(agent.agent == Agents.PLANE_ACTION_EXECUTOR_AGENT for agent in selected_agents)
            # Execute agent(s) and get response stream
            if has_action_agent:
                ### add feature flag check here
                # Create feature flag context with user and workspace information
                try:
                    feature_context = FeatureFlagContext(user_id=str(user_id), workspace_slug=workspace_slug)
                    # log.info(f"Checking action execution feature flag for user {user_id} in workspace {workspace_slug}")
                    is_action_execution_enabled = await feature_flag_service.is_action_execution_enabled(feature_context)
                    # log.info(f"Action execution feature flag result: {is_action_execution_enabled}")
                except Exception as e:
                    log.error(f"Error checking action execution feature flag: {e}")
                    # Default to disabled if feature flag check fails
                    is_action_execution_enabled = False
                if not is_action_execution_enabled:
                    # Feature flag check failed - show message that action execution is not available
                    # This prevents the action execution agent from running when the feature is disabled
                    reasoning_chunk = "🎯 Planning to execute action..\n\n"
                    reasoning += reasoning_chunk
                    yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                    # Yield final response status to signal end of reasoning
                    reasoning_chunk = "📝 Generating final response...\n\n"
                    reasoning += reasoning_chunk
                    yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                    # Add a small delay to ensure chunks are processed separately
                    await asyncio.sleep(0.01)
                    # Now yield the actual response content (not during reasoning)
                    # static_response = "Action execution is not available yet in your workspace. Please contact your administrator to enable this feature. In the meantime, I can help you with any other questions."  # noqa E501

                    static_response = (
                        "Action execution is not available yet. It is coming soon. In the meantime, I can help you with any other questions."  # noqa E501
                    )
                    yield static_response

                    # Save the response to database
                    assistant_message_result = await upsert_message(
                        message_id=response_id,
                        chat_id=chat_id,
                        content=static_response,
                        user_type=UserTypeChoices.ASSISTANT,
                        parent_id=query_id,
                        llm_model=switch_llm,
                        reasoning=reasoning,
                        db=db,
                    )

                    if assistant_message_result["message"] != "success":
                        yield "An unexpected error occurred. Please try again"

                    # Static response search index upserted via Celery background task

                    final_response = static_response

                elif request_source == "mobile":
                    static_response = "Action execution is not available yet in the mobile app. This feature is coming soon! Meanwhile, you can try it on the web app, or let me know how else I can assist you."  # noqa E501
                    yield static_response

                    assistant_message_result = await upsert_message(
                        message_id=response_id,
                        chat_id=chat_id,
                        content=static_response,
                        user_type=UserTypeChoices.ASSISTANT,
                        parent_id=query_id,
                        llm_model=switch_llm,
                        reasoning=reasoning,
                        db=db,
                    )

                    if assistant_message_result["message"] != "success":
                        yield "An unexpected error occurred. Please try again"

                    final_response = static_response

                else:
                    # Feature flag check passed - proceed with action execution
                    # Execute agent(s) and get response stream
                    # Special handling for action execution agent (with or without retrieval tools)
                    reasoning_chunk = "🎯 Planning to execute action using:\n\n"
                    reasoning += reasoning_chunk
                    yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                    agent_queries = []
                    for i, agent in enumerate(selected_agents, 1):
                        tool_name = self._agent_to_tool_name(agent.agent)
                        user_friendly_name = self._tool_name_shown_to_user(tool_name)
                        agent_query = agent.query
                        masked_agent_query = mask_uuids_in_text(agent_query)
                        agent_queries.append(agent_query)
                        if tool_name == "action_executor_agent":  # Updated to match new naming
                            reasoning_chunk = f"&nbsp;&nbsp;&nbsp;{i}. {user_friendly_name} to process the request: '{masked_agent_query}'\n\n"
                        else:
                            reasoning_chunk = f"&nbsp;&nbsp;&nbsp;{i}. {user_friendly_name} to get details about: '{masked_agent_query}'\n\n"
                        reasoning += reasoning_chunk
                        yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                    # Action execution with hierarchical flow - stream tool execution details and final response
                    final_response_chunks = []
                    collecting_final_response = False
                    final_response = ""  # Initialize final_response variable

                    # Create a container for reasoning to allow modification by reference
                    reasoning_container = {"content": reasoning}
                    combined_agent_query = "\n".join(agent_queries)
                    clarification_saved = False
                    async for chunk in self._execute_action_with_retrieval(
                        selected_agents,
                        user_meta,
                        workspace_id,
                        workspace_slug,
                        project_id,
                        conversation_history,
                        enhanced_conversation_history,  # 🔥 NEW: Pass enhanced context separately
                        str(user_id),
                        str(chat_id),
                        query_flow_store,
                        combined_agent_query,
                        query_id,
                        step_order,
                        db,
                        reasoning_container=reasoning_container,
                        is_project_chat=data.is_project_chat,
                        pi_sidebar_open=data.pi_sidebar_open,
                        sidebar_open_url=data.sidebar_open_url,
                    ):  # type: ignore
                        # Persist clarification as assistant message when encountered
                        if not clarification_saved and chunk.startswith("πspecial clarification blockπ: "):
                            try:
                                import json as _json

                                from pi.services.chat.helpers.tool_utils import format_clarification_as_text as _fmt_clar

                                clar_content = chunk.replace("πspecial clarification blockπ: ", "")
                                try:
                                    clar_data = _json.loads(clar_content)
                                except Exception:
                                    clar_data = {"raw": clar_content}
                                clar_text = _fmt_clar(clar_data)
                                # Save the clarification prompt as an assistant message
                                await upsert_message(
                                    message_id=response_id,
                                    chat_id=chat_id,
                                    content=clar_text,
                                    user_type=UserTypeChoices.ASSISTANT,
                                    parent_id=query_id,
                                    llm_model=switch_llm,
                                    reasoning=reasoning_container.get("content", reasoning),
                                    db=db,
                                )
                            except Exception:
                                pass
                            finally:
                                clarification_saved = True

                        # Check if this chunk indicates we're starting the final response
                        if chunk == "πspecial reasoning blockπ: 📝 Generating final response...\n\n":
                            collecting_final_response = True
                            yield chunk
                            continue

                        # Check if this chunk contains the final response signal from action executor
                        if chunk.startswith("__FINAL_RESPONSE__"):
                            # Extract the final response from the special signal
                            final_response = chunk[len("__FINAL_RESPONSE__") :]
                            continue

                        # If we're collecting the final response (after the status message)
                        if collecting_final_response:
                            final_response_chunks.append(chunk)

                        yield chunk

                    # Update reasoning from the container
                    reasoning = reasoning_container["content"]

                    # If we didn't get a final response signal, combine the collected chunks
                    if not final_response:
                        final_response = "".join(final_response_chunks)

                    # Save assistant message with reasoning blocks
                    if final_response:
                        assistant_message_result = await upsert_message(
                            message_id=response_id,
                            chat_id=chat_id,
                            content=final_response,
                            user_type=UserTypeChoices.ASSISTANT,
                            parent_id=query_id,
                            llm_model=switch_llm,
                            reasoning=reasoning,
                            db=db,
                        )

                        if assistant_message_result["message"] != "success":
                            final_response = "An unexpected error occurred. Please try again"
                            yield final_response

                        # log.info(f"ChatID: {chat_id} - Final Response: {final_response}")

            elif len(selected_agents) == 1 and (selected_agents[0].agent == "generic_agent" or preset_query_steps):
                # Handle only generic agent or preset queries with single agent execution
                # Get preset parameters if available
                preset_tables = None
                preset_sql_query = None
                preset_placeholders = None
                if preset_query_steps and selected_agents[0].agent == "plane_structured_database_agent":
                    for step in preset_query_steps:
                        agents = step.get("agents", [])
                        for agent_config in agents:
                            if agent_config.get("agent") == "plane_structured_database_agent":
                                preset_tables = agent_config.get("tables", [])
                                preset_sql_query = agent_config.get("sql_query")
                                preset_placeholders = agent_config.get("placeholders_in_order", [])
                                break
                        if preset_sql_query:
                            break
                base_stream, error = await self._execute_single_agent(
                    selected_agents[0].agent,
                    selected_agents[0].query,
                    user_meta,
                    query_id,
                    workspace_id,
                    project_id,
                    conversation_history,
                    str(user_id),
                    str(chat_id),
                    query_flow_store,
                    enhanced_query_for_processing,
                    query_id,
                    step_order,
                    workspace_in_context,
                    db,
                    preset_tables,
                    preset_sql_query,
                    preset_placeholders,
                )
                if error:
                    # Store error message
                    await upsert_message(
                        message_id=response_id,
                        chat_id=chat_id,
                        content=error,
                        user_type=UserTypeChoices.ASSISTANT.value,
                        parent_id=query_id,
                        llm_model=switch_llm,
                        reasoning=reasoning,
                        db=db,
                    )

                    # Error message search index upserted via Celery background task

                    final_response = error  # Set final_response for title generation
                    yield error
                    return

                # Yield final response status
                reasoning_chunk = "📝 Generating final response...\n\n"
                reasoning += reasoning_chunk
                yield f"πspecial reasoning blockπ: {reasoning_chunk}"
                # Process and stream response
                final_response = ""
                async for chunk in self._process_response(base_stream, chat_id, query_id, response_id, switch_llm, db, reasoning):
                    if chunk.startswith("__FINAL_RESPONSE__"):
                        # Extract the final response from the special signal
                        final_response = chunk[len("__FINAL_RESPONSE__") :]
                    else:
                        yield chunk

            else:
                # Stream selected agents
                reasoning_chunk = "🎯 Planning to execute the below steps:\n\n"
                reasoning += reasoning_chunk
                yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                for i, agent in enumerate(selected_agents, 1):
                    tool_name = self._agent_to_tool_name(agent.agent)
                    user_friendly_name = self._tool_name_shown_to_user(tool_name)
                    masked_agent_query = mask_uuids_in_text(agent.query)
                    reasoning_chunk = f"&nbsp;&nbsp;&nbsp;{i}. {user_friendly_name} to get details about: '{masked_agent_query}'\n\n"
                    reasoning += reasoning_chunk
                    yield f"πspecial reasoning blockπ: {reasoning_chunk}"

                # Multi-agent execution - stream tool execution details and final response
                final_response_chunks = []
                collecting_final_response = False

                # Create a container for reasoning to allow modification by reference
                reasoning_container = {"content": reasoning}
                clarification_saved_multi = False

                async for chunk in self._execute_multi_agents(
                    selected_agents,
                    user_meta,
                    workspace_id,
                    workspace_slug,
                    project_id,
                    conversation_history,
                    enhanced_conversation_history,
                    str(user_id),
                    str(chat_id),
                    query_flow_store,
                    enhanced_query_for_processing,
                    query_id,
                    step_order,
                    db,
                    parsed_query,
                    reasoning_container=reasoning_container,
                    workspace_in_context=workspace_in_context,
                ):
                    # Persist clarification as assistant message when encountered
                    if not clarification_saved_multi and chunk.startswith("πspecial clarification blockπ: "):
                        try:
                            import json as _json

                            from pi.services.chat.helpers.tool_utils import format_clarification_as_text as _fmt_clar

                            clar_content = chunk.replace("πspecial clarification blockπ: ", "")
                            try:
                                clar_data = _json.loads(clar_content)
                            except Exception:
                                clar_data = {"raw": clar_content}
                            clar_text = _fmt_clar(clar_data)
                            await upsert_message(
                                message_id=response_id,
                                chat_id=chat_id,
                                content=clar_text,
                                user_type=UserTypeChoices.ASSISTANT,
                                parent_id=query_id,
                                llm_model=switch_llm,
                                reasoning=reasoning_container.get("content", reasoning),
                                db=db,
                            )
                        except Exception:
                            pass
                        finally:
                            clarification_saved_multi = True

                    # Handle explicit final response marker (defensive)
                    if chunk.startswith("__FINAL_RESPONSE__"):
                        final_response = chunk[len("__FINAL_RESPONSE__") :]
                        # Do not yield marker chunks to the client
                        continue

                    # Check if this chunk indicates we're starting the final response
                    if chunk == "πspecial reasoning blockπ: 📝 Generating final response...\n\n":
                        collecting_final_response = True
                        yield chunk
                        continue

                    # If we're collecting the final response (after the status message)
                    if collecting_final_response:
                        final_response_chunks.append(chunk)

                    yield chunk

                # Update reasoning from the container
                reasoning = reasoning_container["content"]

                # Combine the final response chunks
                final_response = "".join(final_response_chunks)

                # Save assistant message with reasoning blocks
                if final_response:
                    assistant_message_result = await upsert_message(
                        message_id=response_id,
                        chat_id=chat_id,
                        content=final_response,
                        user_type=UserTypeChoices.ASSISTANT.value,
                        parent_id=query_id,
                        llm_model=switch_llm,
                        reasoning=reasoning,
                        db=db,
                    )

                    # Assistant message search index upserted via Celery background task

                    if assistant_message_result["message"] != "success":
                        final_response = "An unexpected error occurred. Please try again"  # Set final_response for title generation
                        yield final_response
                        return

                    log.info(f"ChatID: {chat_id} - Final Response: {final_response}")

            if final_response:
                query_flow_store["answer"] = final_response

            # Set rewritten_query equal to parsed_query for backward compatibility
            query_flow_store["rewritten_query"] = parsed_query

        except asyncio.CancelledError:
            # Client disconnected - save a timeout message before propagating
            log.warning(f"ChatID: {chat_id} - Stream cancelled by client, persisting timeout message")
            final_response = "Your request timed out. Please try again."
            try:
                await asyncio.shield(
                    upsert_message(
                        message_id=response_id,
                        chat_id=chat_id,
                        content=final_response,
                        user_type=UserTypeChoices.ASSISTANT,
                        parent_id=query_id,
                        llm_model=switch_llm,
                        reasoning=reasoning,
                        db=db,
                    )
                )
            except Exception as e:
                log.error(f"ChatID: {chat_id} - Failed to persist timeout message: {e}")
            # Re-raise so the endpoint handler can log and clean up
            raise

        except Exception as e:
            log.error(f"Error processing query: {str(e)}")
            query_flow_store["answer"] = f"Error processing query: {str(e)}"
            final_response = "An unexpected error occurred. Please try again"  # Set final_response for title generation
            await upsert_message(
                message_id=response_id,
                chat_id=chat_id,
                content=final_response,
                user_type=UserTypeChoices.ASSISTANT,
                parent_id=query_id,
                llm_model=switch_llm,
                reasoning=reasoning,
                db=db,
            )

            # Assistant message search index upserted via Celery background task

            yield f"error: '{final_response}'"

        finally:
            # Generate chat title for new chats BEFORE clearing token tracking context
            # Check if this is the first message by looking at sequence number
            try:
                # Import here to avoid circular dependency
                from sqlalchemy import select

                from pi.app.models import Message

                # Get the message sequence number to determine if this is a new chat
                stmt = select(Message).where(Message.id == query_id)  # type: ignore[arg-type]
                result = await db.execute(stmt)
                message = result.scalar_one_or_none()

                if message:
                    message_sequence = message.sequence
                    is_first_message = message_sequence == 1
                else:
                    log.warning(f"ChatID: {chat_id} - Message {query_id} not found for sequence check")
                    message_sequence = None
                    is_first_message = False

                if is_first_message:
                    try:
                        # For error scenarios, use the user's question directly as title
                        is_error_response = (
                            not final_response
                            or final_response.startswith("An unexpected error occurred")
                            or final_response == "TOOL_ORCHESTRATION_FAILURE"
                            or final_response.startswith("Action execution is not available")
                            or final_response.startswith("Chat ID is required")
                            or final_response.startswith("Your request timed out")
                        )

                        if is_error_response:
                            # Use the user's original question as title, with some cleanup
                            title = (parsed_query if parsed_query is not None else query).strip()
                            # Truncate if too long (keeping it under ~60 characters for readability)
                            if len(title) > 60:
                                title = title[:57] + "..."
                            await self.set_chat_title_directly(chat_id, title, db)
                        elif final_response:
                            # For successful responses, generate title using LLM
                            chat_history = [parsed_query if parsed_query is not None else query, final_response]
                            # Ensure both elements are strings
                            chat_history = [str(item) for item in chat_history if item is not None]
                            if len(chat_history) >= 2:  # Make sure we have both query and response
                                title = await self.generate_title(chat_id, chat_history, db)
                                # Generated chat title search index upserted via Celery background task
                            else:
                                log.warning(f"ChatID: {chat_id} - Not enough valid content to generate title")
                                title = (parsed_query if parsed_query is not None else query).strip()
                                # Truncate if too long (keeping it under ~60 characters for readability)
                                if len(title) > 60:
                                    title = title[:57] + "..."
                                await self.set_chat_title_directly(chat_id, title, db)
                        else:
                            log.warning(f"ChatID: {chat_id} - No final_response available for title generation")
                        if title:
                            log.info(f"ChatID: {chat_id} - Generated title: {title}")
                    except Exception as e:
                        log.error(f"Error generating title: {str(e)}")

            except Exception as e:
                log.error(f"Error checking message sequence for title generation: {str(e)}")

            # Clear token tracking context and attachment blocks
            self.clear_token_tracking_context()
            self._current_attachment_blocks = None  # type: ignore[assignment]

    async def handle_agent_query(
        self,
        db: AsyncSession,
        agent: str,
        query: str,
        user_meta: dict,
        message_id: UUID4,
        workspace_id: str,
        project_id: str,
        conv_hist: list,
        user_id: str,
        chat_id: str,
        query_flow_store: QueryFlowStore,
        vector_search_issue_ids: list[str] | None = None,
        vector_search_page_ids: list[str] | None = None,
        is_multi_agent: bool | None = False,
        preset_tables: list[str] | None = None,
        preset_sql_query: str | None = None,
        preset_placeholders: list[str] | None = None,
    ) -> str | tuple[dict, str] | Dict[str, Any]:
        if vector_search_issue_ids is None:
            vector_search_issue_ids = []
        if vector_search_page_ids is None:
            vector_search_page_ids = []

        if agent == Agents.GENERIC_AGENT:
            # Get attachment blocks from the main processing context
            attachment_blocks = self.get_current_attachment_blocks()
            return await self.handle_generic_query(query, user_id, conv_hist, attachment_blocks=attachment_blocks)

        if agent == Agents.PLANE_STRUCTURED_DATABASE_AGENT:
            # Convert conversation history to list of strings for conv_history parameter
            conv_history_strings = []
            if conv_hist:
                for msg in conv_hist:
                    if hasattr(msg, "content"):
                        conv_history_strings.append(msg.content)
                    else:
                        conv_history_strings.append(str(msg))

            # Get attachment blocks from the main processing context
            attachment_blocks = self.get_current_attachment_blocks()

            return await self.handle_structured_db_query(
                db=db,
                query=query,
                user_id=str(user_id),
                query_flow_store=query_flow_store,
                message_id=message_id,
                project_id=(str(project_id) if project_id else None),
                workspace_id=(str(workspace_id) if workspace_id else None),
                chat_id=str(chat_id),
                vector_search_issue_ids=vector_search_issue_ids,
                vector_search_page_ids=vector_search_page_ids,
                is_multi_agent=is_multi_agent,
                user_meta=user_meta,
                conv_history=conv_history_strings,
                preset_tables=preset_tables,
                preset_sql_query=preset_sql_query,
                preset_placeholders=preset_placeholders,
                attachment_blocks=attachment_blocks,
            )
        if agent == Agents.PLANE_VECTOR_SEARCH_AGENT:
            return await self.handle_vector_search_query(query, workspace_id, project_id, user_id, vector_search_issue_ids)
        if agent == Agents.PLANE_PAGES_AGENT:
            return await self.handle_pages_query(query, workspace_id, project_id, user_id, vector_search_page_ids)
        if agent == Agents.PLANE_DOCS_AGENT:
            return await self.handle_docs_query(query)
        if agent == Agents.PLANE_ACTION_EXECUTOR_AGENT:
            # Action execution is now handled through the hierarchical flow in process_query_stream
            # This path should not be reached anymore
            log.warning("handle_agent_query called for action executor - this should be handled in process_query_stream")
            return StandardAgentResponse.create_response("Action execution should be handled through the main query processing flow.")
        else:
            log.error(f"Unknown agent type encountered: {agent}. Fallback to generic agent.")
            return await self.handle_generic_query(query, user_id, conv_hist)  # fallback to generic agent

    async def generate_title(self, chat_id: UUID4, chat_history: list[str], db: AsyncSession) -> str:
        """Generate a title for a chat using the first question-answer pair and update it in the database."""
        return await title_service.generate_title(self, chat_id, chat_history, db)

    async def set_chat_title_directly(self, chat_id: UUID4, title: str, db: AsyncSession) -> None:
        """Set a chat title directly without LLM generation."""
        await title_service.set_chat_title_directly(chat_id, title, db)

    async def get_title(self, chat_id: UUID4, messages: list[Message], db: AsyncSession) -> str:
        """Get or generate a title for a chat."""
        return await title_service.get_title(self, chat_id, messages, db)
