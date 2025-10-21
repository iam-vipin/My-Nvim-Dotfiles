import json
from collections.abc import AsyncIterator
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi import settings
from pi.agents.sql_agent import text2sql
from pi.agents.sql_agent.tools import construct_entity_urls_vectordb
from pi.agents.sql_agent.tools import extract_ids_from_sql_result
from pi.agents.sql_agent.tools import format_as_bullet_points
from pi.app.models.enums import MessageMetaStepType

# Import new modular tools from actions service
from pi.services.actions.tools import get_tools_for_category
from pi.services.chat.utils import get_current_timestamp_context
from pi.services.llm import llms
from pi.services.llm.error_handling import llm_error_handler
from pi.services.llm.error_handling import streaming_error_handler

# from pi.services.retrievers import thread_store
from pi.services.retrievers import pg_store
from pi.services.retrievers.docs_search import DocsRetriever
from pi.services.retrievers.issue_search import IssueRetriever
from pi.services.retrievers.pages_search import PageChunkRetriever
from pi.services.schemas.chat import Agents
from pi.services.schemas.chat import QueryFlowStore

from .mixins import AttachmentMixin
from .prompts import combination_system_prompt
from .prompts import combination_user_prompt
from .prompts import generic_prompt as GENERIC_PROMPT
from .prompts import generic_prompt_non_plane
from .prompts import title_generation_prompt
from .utils import StandardAgentResponse
from .utils import format_message_with_attachments

log = logger.getChild(__name__)
NON_PLANE_TEMPERATURE = settings.llm_config.CONTEXT_OFF_TEMPERATURE


class ChatKit(AttachmentMixin):
    def __init__(self, switch_llm: str = "gpt-4o") -> None:
        """Initializes ChatKit with LLM models and retrieval components."""

        # Use factory to create tracked tool LLM
        from pi.services.llm.llms import LLMConfig
        from pi.services.llm.llms import create_openai_llm

        # Store original switch_llm value to determine if custom model was requested
        use_custom_model = switch_llm is not None

        # Model name mapping for user-friendly names to actual LiteLLM model names
        model_name_mapping = {
            "claude-sonnet-4": settings.llm_model.LITE_LLM_CLAUDE_SONNET_4,
        }

        if not switch_llm:
            switch_llm = settings.llm_model.GPT_4_1
            TOOL_LLM = settings.llm_model.GPT_4_1
            tool_config = LLMConfig(model=TOOL_LLM, temperature=0.2, streaming=False)
        else:
            # Map user-friendly model names to actual model names
            actual_model_name = model_name_mapping.get(switch_llm, switch_llm)

            if switch_llm in model_name_mapping:
                # This is a LiteLLM model
                TOOL_LLM = actual_model_name
                tool_config = LLMConfig(
                    model=TOOL_LLM,
                    temperature=0.2,
                    streaming=False,
                    base_url=settings.llm_config.LITE_LLM_HOST,
                    api_key=settings.llm_config.LITE_LLM_API_KEY,
                )
            else:
                # This is a regular OpenAI model
                TOOL_LLM = switch_llm
                tool_config = LLMConfig(model=TOOL_LLM, temperature=0.2, streaming=False)

        # Initialize LLMs using LLMFactory with switch_llm support
        if use_custom_model:
            # For custom models, try LiteLLM configs with model-type naming convention
            self.llm = llms.LLMFactory.get_default_llm(f"{switch_llm}-default")
            self.stream_llm = llms.LLMFactory.get_stream_llm(f"{switch_llm}-stream")
            self.decomposer_llm = llms.LLMFactory.get_decomposer_llm(f"{switch_llm}-decomposer")
            self.fast_llm = llms.LLMFactory.get_fast_llm(streaming=False, model_name=f"{switch_llm}-fast")
        else:
            # Use default global instances
            self.llm = llms.llm
            self.stream_llm = llms.stream_llm
            self.decomposer_llm = llms.decomposer_llm
            self.fast_llm = llms.fast_llm

        self.switch_llm = switch_llm
        self.chat_llm = llms.get_chat_llm(switch_llm)

        self.tool_llm = create_openai_llm(tool_config)
        self.issue_retriever = IssueRetriever(
            num_docs=settings.chat.NUM_SIMILAR_DOCS, chunk_similarity_threshold=settings.vector_db.ISSUE_VECTOR_SEARCH_CUTOFF
        )
        self.page_retriever = PageChunkRetriever(
            num_docs=settings.chat.NUM_SIMILAR_DOCS, chunk_similarity_threshold=settings.vector_db.PAGE_VECTOR_SEARCH_CUTOFF
        )
        self.docs_retriever = DocsRetriever(
            num_docs=settings.chat.NUM_SIMILAR_DOCS, chunk_similarity_threshold=settings.vector_db.DOC_VECTOR_SEARCH_CUTOFF
        )

        # Note: PlaneActionsExecutor will be initialized per-request with user context
        # since API keys are workspace-specific and obtained dynamically
        self.plane_actions_executor = None

        # Initialize shared state for tool calls
        self.vector_search_issue_ids: list[str] = []
        self.vector_search_page_ids: list[str] = []
        self.current_context: dict[str, Any] = {}
        # Store standardized agent responses for URL access
        self.agent_responses: dict[str, Dict[str, Any]] = {}

        # Token tracking context (set externally when needed)
        self._token_tracking_context: Optional[Dict[str, Any]] = None

    def _store_agent_response(self, tool_name: str, response: Dict[str, Any]) -> None:
        """Store standardized agent response for later URL access"""
        self.agent_responses[tool_name] = response

    def _get_stored_response(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Get stored agent response"""
        return self.agent_responses.get(tool_name)

    def set_token_tracking_context(self, message_id: UUID4, db: AsyncSession) -> None:
        """Set token tracking context for this chat session"""
        self._token_tracking_context = {"message_id": message_id, "db": db}

    def clear_token_tracking_context(self) -> None:
        """Clear token tracking context"""
        self._token_tracking_context = None

    async def extract_attachment_context(self, attachment_blocks: List[Dict[str, Any]], user_query: str, db: AsyncSession, message_id: UUID4) -> str:
        """
        Extract relevant context from attachments to enhance user query understanding.

        Args:
            attachment_blocks: List of processed attachment content blocks
            user_query: The original user query
            db: Database session for LLM tracking
            message_id: Message ID for tracking

        Returns:
            String containing extracted context from attachments
        """
        if not attachment_blocks:
            return ""

        try:
            from pi import settings
            from pi.app.models.enums import MessageMetaStepType
            from pi.services.llm.llms import LLMConfig
            from pi.services.llm.llms import create_openai_llm

            # Create a lightweight LLM for context extraction
            context_llm_config = LLMConfig(
                model=settings.llm_model.GPT_4_1,
                temperature=0.1,
                streaming=False,
            )
            context_llm = create_openai_llm(context_llm_config)
            context_llm.set_tracking_context(message_id, db, MessageMetaStepType.ATTACHMENT_CONTEXT_EXTRACTION)

            # Create shorter, more generic context extraction prompt
            context_prompt = """Analyze the attachment(s) and extract key information relevant to the user's query.

Focus on:
- Text content, labels, headings
- UI elements (buttons, forms, navigation)
- Error messages or status indicators
- People, names, or user information
- Technical details or functionality
- Data, numbers, or metrics shown
- Any relevant context for answering the query

User Query: {user_query}

Provide concise, relevant context from the attachment(s):"""

            # Create message with attachments using mixin method
            context_message = self.create_message_with_attachments(context_prompt.format(user_query=user_query), attachment_blocks)

            response = await context_llm.ainvoke([context_message])

            if hasattr(response, "content"):
                return str(response.content).strip()
            else:
                return str(response).strip()

        except Exception as e:
            log.error(f"Error extracting attachment context: {e}")
            return ""

    async def _create_entity_urls_for_vector_search(self, entity_ids: List[str], entity_type: str) -> Optional[List[Dict[str, str]]]:
        """Generic method to create entity URLs for any vector search type"""
        if not entity_ids:
            return None

        try:
            api_base_url = settings.plane_api.FRONTEND_URL
            # Create the entity_ids dict dynamically based on type
            entity_ids_dict: Dict[str, List[str]] = {"issues": [], "pages": [], "cycles": [], "modules": []}
            if entity_type == "issues":
                entity_ids_dict["issues"] = entity_ids
            elif entity_type == "pages":
                entity_ids_dict["pages"] = entity_ids
            # Can easily extend for other types like cycles, modules, etc.

            return await construct_entity_urls_vectordb(entity_ids=entity_ids_dict, api_base_url=api_base_url)
        except Exception as e:
            log.error(f"Error constructing entity URLs for {entity_type}: {e}")
            return None

    async def _create_entity_urls_for_docs_search(self, retrieved_docs: List[Any]) -> Optional[List[Dict[str, str]]]:
        """Create entity URLs for the documentation search.
        input: retrieved_docs - list of Document objects from docs retriever
        output: entity_urls - list of URL dictionaries"""

        if not retrieved_docs:
            return None

        entity_urls = []
        mdx = False
        try:
            for doc in retrieved_docs:
                section = doc.metadata.get("section")
                subsection = doc.metadata.get("subsection")
                doc_id = doc.metadata.get("id")

                if not section or not subsection:
                    continue

                # skip these irrelevant subsections
                if subsection in ["new_doc", "your-work copy", "your-work copy 2", "your-work copy 3"]:
                    continue
                try:
                    if "/" in section:
                        doc_type, section_name = section.split("/", 1)
                    elif section == "docs":
                        doc_type = "docs"
                        section_name = None
                        mdx = True
                    elif "mdx" in section:
                        doc_type = "docs"
                        section_name = None
                        mdx = True
                    else:
                        doc_type = section
                        section_name = None
                except Exception as e:
                    log.error(f"Error constructing entity URL for doc {doc_id}: {e}")
                    continue

                if doc_type == "docs":
                    api_base_url = settings.vector_db.DOCS_URL_BASE
                elif doc_type == "api-reference":
                    api_base_url = f"{settings.vector_db.DEVELOPER_DOCS_URL_BASE}/{doc_type}"
                else:
                    continue

                try:
                    if section_name:
                        url = f"{api_base_url}/{section_name}/{subsection}"
                    elif doc_type and not mdx:
                        url = f"{api_base_url}/{doc_type}/{subsection}"
                    else:
                        url = f"{api_base_url}/{subsection}"

                    entity_urls.append({"name": subsection, "id": doc_id, "url": url, "type": "doc"})
                except Exception as e:
                    log.error(f"Error constructing entity URL for doc {doc_id}: {e}")
                    continue
        except Exception as e:
            log.error(f"Error constructing entity URLs for docs search: {e}")
            return None

        return entity_urls or None

    async def _create_entity_urls_for_db_search(
        self, query_execution_result: str, query_flow_store: QueryFlowStore, intermediate_results: Dict[str, Any], chat_id: str | None = None
    ) -> Optional[List[Dict[str, str]]]:
        """Create entity URLs for the query execution result"""
        entity_urls = None
        try:
            extracted_ids = extract_ids_from_sql_result(query_execution_result)

            # Construct URLs using dynamic function (no need for user_meta)
            if any(extracted_ids.values()):
                api_base_url = settings.plane_api.FRONTEND_URL

                entity_urls = await construct_entity_urls_vectordb(entity_ids=extracted_ids, api_base_url=api_base_url)

                # intermediate_results["entity_urls"] = entity_urls

                query_flow_store["tool_response"] += f"Entity extraction: {sum(len(ids) for ids in extracted_ids.values())} entities found\n"
                if entity_urls:
                    intermediate_results["urls"] = entity_urls
                    query_flow_store["tool_response"] += f"Entity URLs: {len(entity_urls)} URLs constructed\n"
                    for url_info in entity_urls:
                        query_flow_store["tool_response"] += f"  - {url_info["type"]}: {url_info["name"]} - URL: {url_info["url"]}\n"

        except Exception as e:
            log.error(f"Error extracting entity IDs for chat {chat_id or "unknown chat_id"}: {e}")

        return entity_urls

    def _create_auth_required_tools(
        self,
        workspace_id: str,
        user_id: str,
        chat_id: Optional[str] = None,
        message_token: Optional[str] = None,
        is_project_chat: Optional[bool] = None,
        project_id: Optional[str] = None,
        pi_sidebar_open: Optional[bool] = None,
        sidebar_open_url: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ):
        """Create tools that inform user about missing OAuth authorization."""
        from urllib.parse import urlparse

        from langchain_core.tools import tool

        from pi.config import settings
        from pi.services.actions.oauth_url_encoder import OAuthUrlEncoder

        # Use internal API URL if properly configured, otherwise derive from OAuth redirect URI
        if settings.server.INTERNAL_API_URL and not settings.server.INTERNAL_API_URL.endswith("plane-pi.plane.so"):
            base_url = settings.server.INTERNAL_API_URL.rstrip("/")
        else:
            # Fall back to OAuth redirect URI host (which contains the ngrok URL)
            redirect = urlparse(settings.plane_api.OAUTH_REDIRECT_URI)
            base_url = f"{redirect.scheme}://{redirect.netloc}"

        # Create clean, encrypted OAuth URL
        oauth_encoder = OAuthUrlEncoder()

        oauth_params = {
            "user_id": user_id,
            "workspace_id": workspace_id,
        }

        # Add optional context parameters
        if chat_id:
            oauth_params["chat_id"] = chat_id
        if message_token:
            oauth_params["message_token"] = message_token
        if is_project_chat is not None:
            oauth_params["is_project_chat"] = str(is_project_chat).lower()
        if project_id:
            oauth_params["project_id"] = project_id
        if pi_sidebar_open is not None:
            oauth_params["pi_sidebar_open"] = str(pi_sidebar_open).lower()
        if sidebar_open_url:
            oauth_params["sidebar_open_url"] = sidebar_open_url
        if workspace_slug:
            oauth_params["workspace_slug"] = workspace_slug

        # Generate clean URL
        clean_url = oauth_encoder.generate_clean_oauth_url(base_url, oauth_params)

        @tool
        async def oauth_authorization_required(query: str) -> str:
            """Inform user that OAuth authorization is required and provide a link to connect."""
            # Extract a brief description of what the user was trying to do
            user_intent = query.strip()
            if len(user_intent) > 100:
                user_intent = user_intent[:97] + "..."

            return (
                "🔐 **Plane authorization required**\n\n"
                f"I need your permission to perform actions in Plane for your request:\n"
                f'**"{user_intent}"**\n\n'
                "Please authorize PiChat by clicking the link below:\n"
                f"[Authorize PiChat]({clean_url})\n\n"
                "After authorizing, come back and repeat your request."
            )

        return [oauth_authorization_required]

    def _create_auth_error_tools(self, error_message: str):
        """Create tools that inform user about authentication errors."""
        from langchain_core.tools import tool

        @tool
        async def oauth_authentication_error(query: str) -> str:
            """Inform user about authentication error when trying to perform actions."""
            return (
                f"🚫 **Authentication Error**\n\n"
                f"There was an issue with your Plane workspace authorization:\n"
                f"`{error_message}`\n\n"
                f"**To resolve this:**\n"
                f"1. Check your workspace connection in PiChat settings\n"
                f"2. Re-authorize PiChat if needed\n"
                f"3. Try your request again\n\n"
                f"If the problem persists, please contact support."
            )

        return [oauth_authentication_error]

    async def _get_oauth_token_for_user(self, db: AsyncSession, user_id: str, workspace_id: str) -> Optional[str]:
        """Get OAuth token for user, attempting refresh if needed."""
        try:
            from uuid import UUID

            from pi.services.actions.oauth_service import PlaneOAuthService

            # Ensure proper UUID conversion
            user_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
            workspace_uuid = UUID(workspace_id) if isinstance(workspace_id, str) else workspace_id

            oauth_service = PlaneOAuthService()
            token = await oauth_service.get_valid_token(db=db, user_id=user_uuid, workspace_id=workspace_uuid)
            if token:
                return token
            else:
                return None
        except Exception as e:
            log.error(f"Error getting OAuth token for user {user_id}, workspace {workspace_id}: {e}")
            return None

    def _create_tools(
        self, db, user_meta, workspace_id, project_id, user_id, chat_id, query_flow_store, conversation_history, message_id, is_project_chat=None
    ):
        """Create LangChain tools with access to current execution context."""

        @tool
        async def ask_for_clarification(
            reason: str,
            questions: List[str],
            missing_fields: Optional[List[str]] = None,
            disambiguation_options: Optional[List[Dict[str, Any]]] = None,
            category_hints: Optional[List[str]] = None,
        ) -> str:
            """Use this when the user's request is ambiguous or missing required information.

            Provide short, specific clarification question(s) to the user and include any helpful
            disambiguation options you already know (e.g., candidate users named "John").

            Args:
                reason: Short description of why clarification is needed (e.g., "Multiple users named John").
                questions: List of concrete questions to ask the user to resolve ambiguity.
                missing_fields: Optional list of required fields that are missing from the user's request.
                disambiguation_options: Optional list of candidate options to present (e.g., [{"name": "John A", "id": "..."}]).
                category_hints: Optional list of action categories likely involved (e.g., ["workitems", "users"]).

            Returns:
                JSON string echoing the provided structure for downstream handling.
            """

            # Auto-populate disambiguation options if empty but category_hints provided
            options_to_use = disambiguation_options or []

            # For pages category, ALWAYS auto-populate projects regardless of what LLM provided
            # This ensures consistency even when LLM is non-deterministic
            hints_lower = {str(h).lower() for h in (category_hints or []) if h}
            should_force_populate = ("pages" in hints_lower) and (is_project_chat is not True)

            if not options_to_use or should_force_populate:
                from pi.services.chat.utils import auto_populate_disambiguation_options

                auto_populated = await auto_populate_disambiguation_options(
                    category_hints=category_hints,
                    missing_fields=missing_fields,
                    workspace_id=workspace_id,
                    project_id=project_id,
                    user_id=user_id,
                    chat_id=chat_id,
                )
                # For pages, merge auto-populated projects with any LLM-provided options
                if should_force_populate and auto_populated:
                    # Remove any workspace scope options the LLM might have added
                    llm_options = [o for o in options_to_use if not (isinstance(o, dict) and o.get("id") == "__workspace_scope__")]
                    options_to_use = llm_options + auto_populated
                else:
                    options_to_use.extend(auto_populated)

            # Inject Workspace-level scope option for Pages when not in project chat
            try:
                if ("pages" in hints_lower) and (is_project_chat is not True):
                    has_workspace = any(isinstance(o, dict) and o.get("id") == "__workspace_scope__" for o in options_to_use)
                    if not has_workspace:
                        options_to_use = [
                            {
                                "id": "__workspace_scope__",
                                "name": "Workspace level",
                                "type": "scope",
                                "description": "Create page at workspace level (accessible across all projects)",
                            }
                        ] + options_to_use
                    # If LLM asked a project-only question, replace with scope-aware phrasing
                    questions = ["Where would you like to create this page?"]
            except Exception:
                pass

            # Best-effort: enrich disambiguation options with entity URLs using available context
            enhanced_options: List[Dict[str, Any]] = []
            ws_slug: Optional[str] = None
            try:
                if workspace_id:
                    from pi.app.api.v1.helpers.plane_sql_queries import get_workspace_slug as _get_ws_slug

                    ws_slug = await _get_ws_slug(workspace_id)
            except Exception:
                ws_slug = None

            base_url = settings.plane_api.FRONTEND_URL
            for opt in options_to_use:
                # Elements are typed as Dict[str, Any]; no need for isinstance guard
                opt2 = dict(opt)
                if ws_slug:
                    opt_type = opt.get("type")
                    # Explicit handling based on known types first
                    if opt.get("email") and opt.get("id"):
                        # User-like entity by presence of email
                        opt2["url"] = f"{base_url}/{ws_slug}/profile/{opt.get("id")}/"
                        opt2["type"] = opt_type or "user"
                    elif opt_type == "user" and opt.get("id"):
                        opt2["url"] = f"{base_url}/{ws_slug}/profile/{opt.get("id")}/"
                        opt2["type"] = "user"
                    elif opt_type == "project" and opt.get("id"):
                        # Project overview URL
                        opt2["url"] = f"{base_url}/{ws_slug}/projects/{opt.get("id")}/overview/"
                        opt2["type"] = "project"
                    elif (opt_type == "workitem" and opt.get("identifier")) or (
                        not opt_type and opt.get("identifier") and "-" in str(opt.get("identifier"))
                    ):
                        # Work-item browse URL when identifier is of the form PROJ-SEQ
                        opt2["url"] = f"{base_url}/{ws_slug}/browse/{opt.get("identifier")}/"
                        opt2["type"] = "workitem"
                    elif opt.get("id") and (opt2.get("type") != "scope"):
                        # Fallback: if we have an id but no stronger signal, assume project overview
                        opt2["url"] = f"{base_url}/{ws_slug}/projects/{opt.get("id")}/overview/"
                        opt2["type"] = opt_type or "project"
                enhanced_options.append(opt2)

            payload: Dict[str, Any] = {
                "reason": reason,
                "questions": questions,
                "missing_fields": missing_fields or [],
                "disambiguation_options": enhanced_options,
                "category_hints": category_hints or [],
            }
            # Log outgoing clarification payload built by the tool
            try:
                import json as _json

                log.info(f"ChatID: {chat_id} - ASK_FOR_CLARIFICATION tool payload (outgoing): {_json.dumps(payload, default=str)}")
            except Exception:
                pass
            # The action executor intercepts this tool call and streams a dedicated clarification event.
            return json.dumps(payload)

        @tool
        async def vector_search_tool(query: str) -> str:
            """Search for issues using semantic vector search. Use this first when you need to find issues related to specific topics or keywords.
            Remember that this tool is designed to search for issues, not to retrieve detailed information or metadata about them."""
            try:
                result = await self.handle_vector_search_query(query, workspace_id, project_id, user_id, self.vector_search_issue_ids)

                # Store the standardized response for entity URL access
                self._store_agent_response("vector_search_tool", result)

                # Extract and return the results text
                return StandardAgentResponse.extract_results(result)
            except Exception as e:
                log.error(f"Error in vector_search_tool: {str(e)}")
                return f"Error searching for issues: {str(e)}"

        @tool
        async def structured_db_tool(query: str, issue_ids: Optional[List[str]] = None, page_ids: Optional[List[str]] = None) -> str:
            """Query the structured database to get detailed information about work-items, including status, assignees, projects, modules, cycles, and everything else stored in the Plane database.
            Can filter by specific work-item IDs or page IDs, if provided."""  # noqa: E501
            try:
                # Use provided IDs or fall back to accumulated IDs
                use_issue_ids = issue_ids or self.vector_search_issue_ids
                use_page_ids = page_ids or self.vector_search_page_ids

                if not use_issue_ids and not use_page_ids:
                    # set multi_tool to false to prevent text2sql refusal
                    multi_tool = False
                else:
                    multi_tool = True

                # Get attachment blocks from the shared context
                attachment_blocks = self.get_current_attachment_blocks()

                response = await self.handle_structured_db_query(
                    db,
                    query,
                    user_id,
                    query_flow_store,
                    message_id,
                    project_id,
                    workspace_id,
                    chat_id,
                    use_issue_ids,
                    use_page_ids,
                    multi_tool,
                    user_meta,
                    conversation_history,
                    attachment_blocks=attachment_blocks,
                )

                # Store the standardized response for entity URL access
                self._store_agent_response("structured_db_tool", response)

                # Extract and return the results text
                return StandardAgentResponse.extract_results(response)
            except Exception as e:
                log.error(f"Error in structured_db_tool: {str(e)}")
                return f"Error querying database: {str(e)}"

        @tool
        async def pages_search_tool(query: str) -> str:
            """Search for pages using semantic vector search. Use this when looking for documentation pages or wiki content not for page metadata."""
            try:
                result = await self.handle_pages_query(query, workspace_id, project_id, user_id, self.vector_search_page_ids)

                # Store the standardized response for entity URL access
                self._store_agent_response("pages_search_tool", result)

                # Extract and return the results text
                return StandardAgentResponse.extract_results(result)
            except Exception as e:
                log.error(f"Error in pages_search_tool: {str(e)}")
                return f"Error searching for pages: {str(e)}"

        @tool
        async def docs_search_tool(query: str) -> str:
            """Search the documentation knowledge base for help articles and guides."""
            try:
                result = await self.handle_docs_query(query)

                # Store the standardized response for consistency
                self._store_agent_response("docs_search_tool", result)

                # Extract and return the results text
                return StandardAgentResponse.extract_results(result)
            except Exception as e:
                log.error(f"Error in docs_search_tool: {str(e)}")
                return f"Error searching documentation: {str(e)}"

        @tool
        async def generic_query_tool(query: str) -> str:
            """Handle general questions that don't require specific data retrieval from the workspace."""
            try:
                # Get attachment blocks from the shared context
                attachment_blocks = self.get_current_attachment_blocks()
                result = await self.handle_generic_query(query, user_id, conversation_history, attachment_blocks=attachment_blocks)

                # Store the standardized response for consistency
                self._store_agent_response("generic_query_tool", result)

                # Extract and return the results text
                return StandardAgentResponse.extract_results(result)
            except Exception as e:
                log.error(f"Error in generic_query_tool: {str(e)}")
                return f"Error handling generic query: {str(e)}"

        return [ask_for_clarification, vector_search_tool, structured_db_tool, pages_search_tool, docs_search_tool, generic_query_tool]

    async def _get_selected_tools(
        self,
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
        message_id,
        is_project_chat=None,
        pi_sidebar_open=None,
        sidebar_open_url=None,
    ):
        """Get tools based on selected agents, with dynamic OAuth token retrieval for action agents."""

        # Check for action executor agent
        is_action_agent = any(agent_query.agent == Agents.PLANE_ACTION_EXECUTOR_AGENT for agent_query in selected_agents)
        if is_action_agent:
            # Build context for selector and executor - prefer provided workspace_slug; resolve only if missing
            if not workspace_slug:
                from pi.app.api.v1.helpers.plane_sql_queries import get_workspace_slug

                workspace_slug = await get_workspace_slug(workspace_id)
            if not workspace_slug:
                log.warning(f"Could not resolve workspace slug for workspace {workspace_id}")
                return self._create_auth_error_tools(f"Could not resolve workspace information for {workspace_id}")

            # Get OAuth token for user and workspace (development mode will return hardcoded API key)
            access_token = await self._get_oauth_token_for_user(db, user_id, workspace_id)

            if not access_token:
                # No valid OAuth token - return special "auth required" tool
                log.info(f"OAuth required for user {user_id} in workspace {workspace_id}")
                return self._create_auth_required_tools(
                    workspace_id,
                    user_id,
                    chat_id,
                    str(message_id),
                    is_project_chat=is_project_chat,
                    project_id=project_id,
                    pi_sidebar_open=pi_sidebar_open,
                    sidebar_open_url=sidebar_open_url,
                    workspace_slug=workspace_slug,
                )

            # Initialize the executor with OAuth token or API key
            action_tools: list = []
            try:
                from pi.services.actions.category_selector import CategorySelector
                from pi.services.actions.method_executor import MethodExecutor
                from pi.services.actions.plane_actions_executor import PlaneActionsExecutor

                # Create actions executor
                if access_token and access_token.startswith("plane_api_"):
                    actions_executor = PlaneActionsExecutor(api_key=access_token, base_url=settings.plane_api.HOST)
                else:
                    actions_executor = PlaneActionsExecutor(access_token=access_token, base_url=settings.plane_api.HOST)

                # Create hierarchical tools
                category_selector = CategorySelector()
                method_executor = MethodExecutor(actions_executor)

                @tool
                async def get_available_plane_actions(user_intent: str) -> str:
                    """
                    Return available Plane API methods across all categories (advisory catalog).
                    Used to inform the LLM router; does not decide categories itself.
                    Categories include: cycles, workitems (for issues/tasks), projects, labels, states, modules, pages, assets, users, intake, members, activity, attachments, comments, links, properties, types, worklogs.
                    """  # noqa: E501
                    categories = category_selector.get_available_categories()

                    lines: list[str] = []
                    lines.append("Available Plane action categories and methods:\n")
                    for cat, description in categories.items():
                        try:
                            cat_methods = method_executor.get_category_methods(cat)
                            method_names = ", ".join(cat_methods.keys()) if cat_methods else "-"
                        except Exception as exc:
                            log.warning(f"Failed to get methods for category '{cat}': {exc}")
                            method_names = "(error retrieving methods)"
                        lines.append(f"- {cat}: {description}")
                        lines.append(f"  Methods: {method_names}")

                    return "\n".join(lines)

                action_tools = [get_available_plane_actions]

            except Exception as e:
                log.error(f"Error creating action tools: {e}")
                return self._create_auth_error_tools(str(e))

            # ALSO include existing retrieval tools so LLM can mix retrieval + actions
            all_static_tools = self._create_tools(
                db,
                user_meta,
                workspace_id,
                project_id,
                user_id,
                chat_id,
                query_flow_store,
                conversation_history,
                message_id,
                is_project_chat=is_project_chat,
            )
            # Combine action tools with retrieval tools
            combined_tools = action_tools + all_static_tools
            return combined_tools

        # Default: static retrieval tools
        agent_to_tool_map = {
            Agents.PLANE_STRUCTURED_DATABASE_AGENT: "structured_db_tool",
            Agents.PLANE_VECTOR_SEARCH_AGENT: "vector_search_tool",
            Agents.PLANE_PAGES_AGENT: "pages_search_tool",
            Agents.PLANE_DOCS_AGENT: "docs_search_tool",
            Agents.GENERIC_AGENT: "generic_query_tool",
        }
        all_tools = self._create_tools(
            db,
            user_meta,
            workspace_id,
            project_id,
            user_id,
            chat_id,
            query_flow_store,
            conversation_history,
            message_id,
            is_project_chat=is_project_chat,
        )
        selected_tool_names = [agent_to_tool_map.get(agent_query.agent) for agent_query in selected_agents]
        tools = [tool for tool in all_tools if tool.name in selected_tool_names]

        # Inject entity search tools so retrieval-only flows can disambiguate entities
        try:
            from pi.services.actions.tools.entity_search import get_entity_search_tools

            # Build minimal context for entity search
            search_ctx = {"workspace_slug": workspace_slug, "project_id": project_id}
            entity_tools = get_entity_search_tools(method_executor=None, context=search_ctx) or []
            # Merge while avoiding duplicates by name
            existing = {getattr(t, "name", "") for t in tools}
            for t in entity_tools:
                if getattr(t, "name", "") not in existing:
                    tools.append(t)
        except Exception:
            # Best-effort only; skip if unavailable
            pass
        # Always include clarification tool for retrieval flows so LLM can resolve ambiguity
        try:
            clar_tool = next((t for t in all_tools if getattr(t, "name", "") == "ask_for_clarification"), None)
            if clar_tool and all(getattr(t, "name", "") != "ask_for_clarification" for t in tools):
                tools = [clar_tool] + tools
        except Exception:
            pass
        return tools

    def _build_method_tools(self, category: str, method_executor, context: dict):
        """Build method-specific tools for the selected category using modular structure"""
        return get_tools_for_category(category, method_executor, context)

    def _build_planning_method_tools(self, category: str, method_executor, context: dict):
        """Build planning-time tools for a category.

        Note: Entity search tools are now included directly in each category's tool provider,
        so this function just returns the category tools without additional augmentation.
        """
        # Get the category tools (which now include entity search tools)
        tools = get_tools_for_category(category, method_executor, context) or []
        return tools

    @llm_error_handler(fallback_message="New Conversation", max_retries=1, log_context="[TITLE_GENERATION]")
    async def title_generation(self, chat_history: list[str]) -> str:
        title_prompt = title_generation_prompt

        # Convert the chat history to a string format
        history_str = "\n".join(chat_history)

        # Set tracking context for title generation
        if self._token_tracking_context:
            self.fast_llm.set_tracking_context(
                self._token_tracking_context["message_id"], self._token_tracking_context["db"], MessageMetaStepType.TITLE_GENERATION
            )

        # Get title from LLM
        title_llm_chain = title_prompt | self.fast_llm
        llm_response = await title_llm_chain.ainvoke({"chat_history": history_str})
        title = llm_response.content if hasattr(llm_response, "content") else str(llm_response)

        return title

    @llm_error_handler(
        fallback_message="I'm having trouble processing your request right now. Please try again later.", max_retries=2, log_context="[GENERIC_QUERY]"
    )
    async def handle_generic_query(
        self,
        query: str,
        user_id: str,
        conversation_history: list[BaseMessage],
        user_meta: Optional[dict[str, Any]] = None,
        attachment_blocks: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Handle generic queries using LLM without database or vector search.
        input: query - user query
        output: Generic response based on LLM knowledge only
        """
        if user_meta is None:
            user_meta = {}
        date_time_context = await get_current_timestamp_context(user_id)
        first_name = user_meta.get("first_name") or user_meta.get("firstName", "")
        last_name = user_meta.get("last_name") or user_meta.get("lastName", "")

        # Compose user context for possible use in system prompt
        time_user_context = f"{date_time_context}\n\n**User's Firstname**: {first_name} and Lastname: {last_name}"

        # Compose message content with attachments if present
        time_context_query = f"{query}\n\n**Context**: {date_time_context}"
        message_content = time_context_query if not attachment_blocks else format_message_with_attachments(time_context_query, attachment_blocks)

        recent_history = [(m.type, m.content) for m in conversation_history]
        system_prompt = GENERIC_PROMPT

        if conversation_history:
            system_prompt = f"{system_prompt}\n\n{date_time_context}\n\nSkip greetings and get straight to the point."
        else:
            system_prompt = f"{system_prompt}\n\n{time_user_context}"

        recent_history = [(m.type, m.content) for m in conversation_history]

        generic_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("placeholder", "{recent_history}"),
            ("human", "{question}"),
        ])

        # Set tracking context for generic query
        if self._token_tracking_context:
            self.chat_llm.set_tracking_context(
                self._token_tracking_context["message_id"], self._token_tracking_context["db"], MessageMetaStepType.COMBINATION
            )

        # Use LLM chain
        generic_llm_chain = generic_prompt | self.chat_llm
        llm_response = await generic_llm_chain.ainvoke({"question": message_content, "recent_history": recent_history})
        response_content = llm_response.content if hasattr(llm_response, "content") else str(llm_response)

        return StandardAgentResponse.create_response(response_content)

    async def handle_generic_query_stream(
        self,
        query: str,
        user_id: str,
        conv_history: list[BaseMessage],
        user_meta: dict[str, Any],
        non_plane: bool = False,
        attachment_blocks: Optional[List[Dict[str, Any]]] = None,
    ) -> AsyncIterator[str]:
        date_time_context = await get_current_timestamp_context(user_id)
        first_name = user_meta.get("first_name") or user_meta.get("firstName", "")
        last_name = user_meta.get("last_name") or user_meta.get("lastName", "")

        time_user_context = f"{date_time_context}\n\n**User's Firstname**: {first_name} and Lastname: {last_name}"

        if non_plane:
            system_prompt = generic_prompt_non_plane
        else:
            system_prompt = GENERIC_PROMPT

        if conv_history:
            system_prompt = f"{system_prompt}\n\n{date_time_context}\n\nSkip greetings and get straight to the point."
        else:
            system_prompt = f"{system_prompt}\n\n{time_user_context}"

        recent_history = [(m.type, m.content) for m in conv_history]

        # Format message content with attachments if present
        message_content = query if not attachment_blocks else format_message_with_attachments(query, attachment_blocks)

        generic_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("placeholder", "{recent_history}"),
            ("human", "{question}"),
        ])

        # Set tracking context for generic query
        if self._token_tracking_context:
            self.chat_llm.set_tracking_context(
                self._token_tracking_context["message_id"], self._token_tracking_context["db"], MessageMetaStepType.COMBINATION
            )

        # Use LLM chain for streaming
        generic_llm_chain = generic_prompt | self.chat_llm

        # Use streaming error handler context manager
        async with streaming_error_handler("[GENERIC_QUERY_STREAM]") as error_context:
            try:
                if non_plane:
                    stream_generator = generic_llm_chain.astream(
                        {"question": message_content, "recent_history": recent_history}, temperature=NON_PLANE_TEMPERATURE
                    )
                else:
                    stream_generator = generic_llm_chain.astream({"question": message_content, "recent_history": recent_history})

                async for chunk in stream_generator:
                    error_context.add_chunk(chunk)
                    content = chunk.content if hasattr(chunk, "content") else str(chunk)
                    yield content

            except Exception:
                # Error was handled by context manager, yield fallback message
                fallback_message = "I'm having trouble processing your request right now. Please try again later."
                yield fallback_message

    async def handle_structured_db_query(
        self,
        db: AsyncSession,
        query: str,
        user_id: str,
        query_flow_store: QueryFlowStore,
        message_id: UUID4,
        project_id: Optional[str] = None,
        workspace_id: Optional[str] = None,
        chat_id: Optional[str] = None,
        vector_search_issue_ids: Optional[List[str]] = None,
        vector_search_page_ids: Optional[List[str]] = None,
        is_multi_agent: Optional[bool] = False,
        user_meta: Optional[Dict[str, Any]] = None,
        conv_history: Optional[List[str]] = None,
        preset_tables: Optional[List[str]] = None,
        preset_sql_query: Optional[str] = None,
        preset_placeholders: Optional[List[str]] = None,
        attachment_blocks: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:  # noqa: E501
        timestamp_context = await get_current_timestamp_context(user_id)
        # time_context_query = f"{query}\n\n**Context**: {timestamp_context}"
        if user_meta:
            user_meta["time_context"] = timestamp_context
        else:
            user_meta = {"time_context": timestamp_context}

        intermediate_results, response_data = await text2sql(
            db,
            query,
            user_id,
            query_flow_store,
            message_id,
            project_id,
            workspace_id,
            chat_id,
            vector_search_issue_ids,
            vector_search_page_ids,
            is_multi_agent,
            user_meta,
            conv_history,
            preset_tables,
            preset_sql_query,
            preset_placeholders,
            attachment_blocks,
        )  # noqa: E501

        query_execution_result: str = response_data.get("results", "")

        entity_urls = await self._create_entity_urls_for_db_search(query_execution_result, query_flow_store, intermediate_results, chat_id)

        # Format results into a string, passing SQL query so we can detect LIMIT clauses
        sql_query_for_format = intermediate_results.get("generated_sql") if isinstance(intermediate_results, dict) else None
        formatted_query_result = await format_as_bullet_points(query_execution_result, sql_query_for_format)

        return StandardAgentResponse.create_response(formatted_query_result, entity_urls, intermediate_results=intermediate_results)

    async def handle_vector_search_query(
        self, query: str, workspace_id: str, project_id: str, user_id: str, vector_search_issue_ids: list[str]
    ) -> Dict[str, Any]:
        try:
            retrieved_issues = await self.issue_retriever.ainvoke(query, project_id=project_id, workspace_id=workspace_id, user_id=user_id)
        except ValueError as e:
            log.error(f"Error retrieving issues during vector search: {e}")
            return StandardAgentResponse.create_response("Sorry, I couldn't retrieve the issues at this time. Please try again later.")

        # Extract issue IDs directly from retrieved_docs
        original_count = len(vector_search_issue_ids)
        for doc in retrieved_issues:
            issue_id = doc.metadata.get("issue_id")
            if issue_id:
                vector_search_issue_ids.append(issue_id)

        # Format the retrieved results
        formatted_results = self.format_retrieved_results(retrieved_issues, "issues")

        # Generate entity URLs using the generic method
        entity_urls = await self._create_entity_urls_for_vector_search(vector_search_issue_ids, "issues")

        # Include execution metadata for debugging
        execution_metadata = {
            "search_query": query,
            "total_results": len(retrieved_issues),
            "issue_ids_found": len(vector_search_issue_ids) - original_count,
            "workspace_id": workspace_id,
            "project_id": project_id,
            "similarity_threshold": getattr(self.issue_retriever, "chunk_similarity_threshold", None),
            "max_results": getattr(self.issue_retriever, "num_docs", None),
        }

        return StandardAgentResponse.create_response(formatted_results, entity_urls, execution_metadata=execution_metadata)

    async def handle_pages_query(
        self, query: str, workspace_id: str, project_id: str, user_id: str, vector_search_page_ids: list[str]
    ) -> Dict[str, Any]:
        try:
            retrieved_pages = await self.page_retriever.ainvoke(query, workspace_id=workspace_id, project_id=project_id, user_id=user_id)
        except ValueError as e:
            log.error(f"Error retrieving pages during vector search: {e}")
            return StandardAgentResponse.create_response("Sorry, I couldn't retrieve the pages at this time. Please try again later.")

        # Extract page IDs directly from retrieved_docs
        original_count = len(vector_search_page_ids)
        for doc in retrieved_pages:
            page_id = doc.metadata.get("page_id")
            if page_id:
                vector_search_page_ids.append(page_id)

        # Format the retrieved results
        formatted_results = self.format_retrieved_results(retrieved_pages, "pages")

        # Generate entity URLs using the generic method
        entity_urls = await self._create_entity_urls_for_vector_search(vector_search_page_ids, "pages")

        # Include execution metadata for debugging
        execution_metadata = {
            "search_query": query,
            "total_results": len(retrieved_pages),
            "page_ids_found": len(vector_search_page_ids) - original_count,
            "workspace_id": workspace_id,
            "project_id": project_id,
            "similarity_threshold": getattr(self.page_retriever, "chunk_similarity_threshold", None),
            "max_results": getattr(self.page_retriever, "num_docs", None),
        }

        return StandardAgentResponse.create_response(formatted_results, entity_urls, execution_metadata=execution_metadata)

    async def handle_docs_query(self, query: str) -> Dict[str, Any]:
        try:
            retrieved_docs = await self.docs_retriever.ainvoke(query)
        except ValueError as e:
            log.error(f"Error retrieving docs during vector search: {e}")
            return StandardAgentResponse.create_response("Sorry, I couldn't retrieve the docs at this time. Please try again later.")

        # Format the retrieved results
        formatted_results = self.format_retrieved_results(retrieved_docs, "docs")

        # Generate entity URLs for docs
        entity_urls = await self._create_entity_urls_for_docs_search(retrieved_docs)

        # Include execution metadata for debugging
        execution_metadata = {
            "search_query": query,
            "total_results": len(retrieved_docs),
            "similarity_threshold": getattr(self.docs_retriever, "chunk_similarity_threshold", None),
            "max_results": getattr(self.docs_retriever, "num_docs", None),
        }

        return StandardAgentResponse.create_response(formatted_results, entity_urls, execution_metadata=execution_metadata)

    async def combined_response_stream(
        self, query, responses, conversation_history, user_meta, user_id, attachment_blocks: Optional[List[Dict[str, Any]]] = None
    ) -> AsyncIterator[str]:
        """Combines the response from the LLM and the rewritten query into a single stream."""
        system_prompt = combination_system_prompt
        user_prompt = combination_user_prompt

        date_time_context = await get_current_timestamp_context(user_id)
        first_name = user_meta.get("first_name") or user_meta.get("firstName", "")
        last_name = user_meta.get("last_name") or user_meta.get("lastName", "")

        time_user_context = f"{date_time_context}\n\n**User's Firstname**: {first_name} and Lastname: {last_name}"
        if conversation_history:
            # to avoid LLM addressing with 'hi' in the follow-ups
            system_prompt = f"{system_prompt}\n\n{date_time_context}\n\nSkip greetings and get straight to the point."
        else:
            system_prompt = f"{system_prompt}\n\n{time_user_context}"

        # Format responses and extract URLs using standardized methods
        formatted_responses_str = f"**Response**: {responses}"

        # Format original query with attachments if present
        formatted_query = query if not attachment_blocks else format_message_with_attachments(query, attachment_blocks)

        # Stream the response
        combination_prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt),
        ])

        # Set tracking context for combination streaming
        if self._token_tracking_context:
            self.stream_llm.set_tracking_context(
                self._token_tracking_context["message_id"], self._token_tracking_context["db"], MessageMetaStepType.COMBINATION
            )

        # Use LLM chain for streaming
        combination_llm_chain = combination_prompt | self.stream_llm

        # Use streaming error handler context manager
        async with streaming_error_handler("[COMBINED_RESPONSE_STREAM]") as error_context:
            try:
                stream_generator = combination_llm_chain.astream({
                    "original_query": formatted_query,
                    "responses": formatted_responses_str,
                    "conversation_history": conversation_history,
                })

                async for chunk in stream_generator:
                    error_context.add_chunk(chunk)
                    content = chunk.content if hasattr(chunk, "content") else str(chunk)
                    yield content

            except Exception:
                # Error was handled by context manager, yield fallback message
                fallback_message = "I'm having trouble generating a response right now. Please try again later."
                yield fallback_message

    @staticmethod
    async def retrieve_chat_history(chat_id: UUID4, db: AsyncSession) -> dict[str, Any]:
        """Retrieve chat history for a specific chat ID."""
        return await pg_store.retrieve_chat_history(chat_id=chat_id, pi_internal=True, dialogue_object=True, db=db)

    @staticmethod
    def format_retrieved_results(retrieved_docs: List[Any], doc_type: str) -> str:
        """Format retrieved documents into a readable string format."""
        if not retrieved_docs:
            return f"No {doc_type} found matching your search criteria."

        # log.info(f"Formatting {len(retrieved_docs)} {doc_type} results")
        formatted_results = []

        for doc in retrieved_docs:
            if doc_type == "issues":
                title = doc.metadata.get("title", "Untitled Issue")
                issue_id = doc.metadata.get("issue_id", "Unknown ID")
                project_name = doc.metadata.get("project__name", "Unknown Project")
                state = doc.metadata.get("state__name", "Unknown State")
                priority = doc.metadata.get("priority", "Unknown Priority")

                # Chunk metadata
                chunk_type = doc.metadata.get("chunk_type", "content")
                issue_content = doc.page_content.strip()

                formatted_results.append(
                    f"**Issue: {title}** (ID: {issue_id})\n"
                    f"Project: {project_name} | State: {state} | Priority: {priority}\n"
                    f"Content ({chunk_type}): {issue_content}\n"
                )

            elif doc_type == "pages":
                page_name = doc.metadata.get("name", "Untitled Page")
                page_id = doc.metadata.get("page_id", "Unknown ID")
                project_name = doc.metadata.get("project__name", "Unknown Project")

                page_content = doc.page_content.strip()

                formatted_results.append(f"**Page: {page_name}** (ID: {page_id})\n" f"Project: {project_name}\n" f"Content: {page_content}\n")

            elif doc_type == "docs":
                section = doc.metadata.get("section", "Unknown Section")
                subsection = doc.metadata.get("subsection", "Unknown Subsection")
                doc_id = doc.metadata.get("id", "Unknown ID")

                doc_content = doc.page_content.strip()

                formatted_results.append(f"**Doc: {section}/{subsection}** (ID: {doc_id})\n" f"Content: {doc_content}\n")

        return "\n".join(formatted_results)
