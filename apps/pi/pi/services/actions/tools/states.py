"""
States API tools for Plane workflow state management.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing state actions


def get_state_tools(method_executor, context):
    """Return LangChain tools for the states category using method_executor and context."""

    @tool
    async def states_create(
        name: str,
        color: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        description: Optional[str] = None,
        group: Optional[str] = None,
    ) -> str:
        """Create a new workflow state.

        Args:
            name: State name (required)
            color: State color in hex format (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            description: State description
            group: State group (backlog, unstarted, started, completed, cancelled)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "states",
            "create",
            name=name,
            color=color,
            project_id=project_id,
            workspace_slug=workspace_slug,
            description=description,
            group=group,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url(f"Successfully created state '{name}'", result["data"], "state", context)
        else:
            return PlaneToolBase.format_error_response("Failed to create state", result["error"])

    @tool
    async def states_list(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """List all workflow states in a project."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "states",
            "list",
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved states list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list states", result["error"])

    @tool
    async def states_retrieve(
        state_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Retrieve details of a specific workflow state.

        Args:
            state_id: State ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "states",
            "retrieve",
            state_id=state_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved state details", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve state", result["error"])

    @tool
    async def states_update(
        state_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        color: Optional[str] = None,
        description: Optional[str] = None,
    ) -> str:
        """Update an existing workflow state.

        Args:
            state_id: State ID (required)
            name: New state name
            color: New state color
            description: New state description
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data with only non-None values
        update_data = {k: v for k, v in {"name": name, "color": color, "description": description}.items() if v is not None}

        result = await method_executor.execute(
            "states",
            "update",
            state_id=state_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url(f"Successfully updated state '{state_id}'", result["data"], "state", context)
        else:
            return PlaneToolBase.format_error_response("Failed to update state", result["error"])

    # Get entity search tools relevant only to states
    from .entity_search import get_entity_search_tools

    entity_search_tools = get_entity_search_tools(method_executor, context)
    state_entity_search_tools = [
        t for t in entity_search_tools if getattr(t, "name", "").find("state") != -1 or getattr(t, "name", "").find("user") != -1
    ]

    return [states_create, states_list, states_retrieve, states_update] + state_entity_search_tools
