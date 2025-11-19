from enum import Enum
from typing import List
from typing import Literal
from typing import Optional
from typing import TypeAlias
from typing import TypedDict

from langchain_core.messages import BaseMessage
from pydantic import BaseModel
from pydantic import Field


class Agents(str, Enum):
    GENERIC_AGENT = "generic_agent"
    PLANE_STRUCTURED_DATABASE_AGENT = "plane_structured_database_agent"
    PLANE_VECTOR_SEARCH_AGENT = "plane_vector_search_agent"
    PLANE_PAGES_AGENT = "plane_pages_agent"
    PLANE_DOCS_AGENT = "plane_docs_agent"
    PLANE_ACTION_EXECUTOR_AGENT = "plane_action_executor_agent"


class AgentQuery(BaseModel):
    agent: Agents
    query: str = Field(..., description="The decomposed query for this specific agent")


class RouteQuery(BaseModel):
    """Route a user query to the most relevant customer service agent(s) with decomposed queries."""

    decomposed_queries: list[AgentQuery] = Field(..., description="List of agents with their corresponding decomposed queries")


class RoutingResult(TypedDict):
    raw: BaseMessage
    parsed: RouteQuery | None
    parsing_error: Exception | None


AgentQueryList: TypeAlias = list[AgentQuery]


class AgentOrder(BaseModel):
    """Provide the order in which the selected data retrieval agents should be executed."""

    ordered_agents: List[str] = Field(..., description="List of ordered agent names")


class QueryFlowStore(TypedDict):
    is_new: bool
    query: str
    llm: str
    chat_id: str
    user_id: str
    is_temp: bool
    is_reasoning: bool
    router_result: str
    tool_response: str
    parsed_query: str
    rewritten_query: str  # Kept for backward compatibility - now always equal to parsed_query
    answer: str
    workspace_in_context: bool
    project_id: str
    workspace_id: str


# --- Action Category Routing (for hierarchical actions) ---


class ActionCategorySelection(BaseModel):
    """One selected action category with optional rationale and priority."""

    category: Literal[
        "workitems",
        "projects",
        "cycles",
        "labels",
        "states",
        "modules",
        "pages",
        "assets",
        "users",
        "intake",
        "members",
        "activity",
        "attachments",
        "comments",
        "links",
        "properties",
        "types",
        "worklogs",
    ]
    rationale: Optional[str] = None


class ActionCategoryRouting(BaseModel):
    """Structured output for action category router allowing multiple selections."""

    selections: List[ActionCategorySelection]
