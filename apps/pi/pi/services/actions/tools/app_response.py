"""Tool for providing structured responses to external app integrations."""

import json
from typing import Any
from typing import Dict
from typing import List

from langchain.tools import tool
from pydantic import BaseModel
from pydantic import Field
from pydantic import field_validator


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

    text_response: str = Field(
        description="Natural language answer in PLAIN TEXT ONLY (no markdown, no bold/italic, no numbered lists, no bullet points - just plain text with newlines)"  # noqa: E501
    )
    entities: List[EntityInfo] = Field(
        default_factory=list,
        description="List of relevant entities from retrieval results (empty list if no entities are relevant)",
    )

    @field_validator("entities", mode="before")
    @classmethod
    def _coerce_entities(cls, v: Any) -> Any:
        """
        Coerce model-provided entities into a list.

        LLM tool calling can sometimes provide `entities` as a JSON string (double-serialized).
        This validator accepts both:
        - list[dict] / list[EntityInfo]
        - str containing JSON array
        """
        if v is None:
            return []

        # If the LLM stringifies the JSON array, parse it.
        if isinstance(v, str):
            s = v.strip()
            if not s:
                return []
            try:
                parsed = json.loads(s)
                return parsed
            except Exception:
                # Let downstream validation raise a clear error; callers can fall back to []
                return v

        return v


@tool(args_schema=AppResponseSchema)
def provide_final_answer_for_app(text_response: str, entities: List[EntityInfo]) -> str:
    """
     Provide final answer for external app integration (Slack, etc.) with structured entity data.

     Use this tool ONLY when:
     - Source is 'app' (Slack or other external integration)
     - You have gathered all necessary information via retrieval tools
     - No modifying actions are needed

     Args:
         text_response: Your comprehensive natural language answer in PLAIN TEXT ONLY.
             DO NOT use markdown formatting (no **bold**, *italic*, headers).
             DO NOT use numbered lists (1. 2. 3.) or bullet points (- * •).
             DO NOT use markdown links [text](url).
             Use simple line breaks to separate items.
             External apps like Slack will render markdown as literal characters.
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
