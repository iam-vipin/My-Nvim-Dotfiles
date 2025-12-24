"""Tool for providing structured responses to external app integrations."""

from typing import Any
from typing import Dict
from typing import List

from langchain.tools import tool
from pydantic import BaseModel
from pydantic import Field


class EntityInfo(BaseModel):
    """Entity information for app response."""

    type: str = Field(description="Entity type: workitem, project, cycle, module, page, user, label, state, etc.")
    name: str = Field(description="Entity name/title")
    properties: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional entity properties like id, identifier, state, priority, assignee, etc.",
    )


class AppResponseSchema(BaseModel):
    """Structured response schema for external app integrations."""

    text_response: str = Field(description="Natural language answer to the user's question")
    entities: List[EntityInfo] = Field(
        default_factory=list,
        description="List of relevant entities from retrieval results (empty list if no entities are relevant)",
    )


@tool(args_schema=AppResponseSchema)
def provide_final_answer_for_app(text_response: str, entities: List[Dict[str, Any]]) -> str:
    """
     Provide final answer for external app integration (Slack, etc.) with structured entity data.

     Use this tool ONLY when:
     - Source is 'app' (Slack or other external integration)
     - You have gathered all necessary information via retrieval tools
     - No modifying actions are needed

     Args:
         text_response: Your comprehensive natural language answer to the user's question
         entities: List of relevant entities from retrieval results with type, name, and properties

     Entity format:
     - type: Entity type (workitem, project, cycle, module, page, user, etc.)
    - name: Entity name/title
     - properties: Dict containing relevant fields like:
         - id: Entity UUID (if available)
         - identifier: Human-readable identifier like PROJECT-123 (for workitems)
         - state: Current state (for workitems)
         - priority: Priority level (for workitems)
         - assignee: Assigned user (for workitems)
         - ... other relevant fields based on entity type

     IMPORTANT: Only include entities if they are the ACTUAL SUBJECT of the user's query.
     Do NOT include entities that are merely context or filters.
     Only include entities that are the direct answer to what the user asked for.

     Returns:
         Confirmation message (not shown to user)
    """
    return "Response formatted for external app"


def get_app_response_tool():
    """Get the app response tool for external integrations."""
    return provide_final_answer_for_app
