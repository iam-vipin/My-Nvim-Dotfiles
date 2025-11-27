"""
Labels API tools for Plane labeling operations.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing label actions


def get_label_tools(method_executor, context):
    """Return LangChain tools for the labels category using method_executor and context."""

    @tool
    async def labels_create(
        name: str,
        color: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        description: Optional[str] = None,
    ) -> str:
        """Create a new label."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "labels",
            "create",
            name=name,
            color=color,
            project_id=project_id,
            workspace_slug=workspace_slug,
            description=description,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url(f"Successfully created label '{name}'", result["data"], "label", context)
        else:
            return PlaneToolBase.format_error_response("Failed to create label", result["error"])

    @tool
    async def labels_list(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """List all labels in a project."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "labels",
            "list",
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved labels list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list labels", result["error"])

    @tool
    async def labels_retrieve(
        label_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Retrieve details of a specific label.

        Args:
            label_id: Label ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "labels",
            "retrieve",
            label_id=label_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved label details", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve label", result["error"])

    @tool
    async def labels_update(
        label_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        color: Optional[str] = None,
        description: Optional[str] = None,
    ) -> str:
        """Update an existing label.

        Args:
            label_id: Label ID (required)
            name: New label name
            color: New label color
            description: New label description
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
            "labels",
            "update",
            label_id=label_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url(f"Successfully updated label '{label_id}'", result["data"], "label", context)
        else:
            return PlaneToolBase.format_error_response("Failed to update label", result["error"])

    # Get entity search tools relevant only to labels
    from .entity_search import get_entity_search_tools

    entity_search_tools = get_entity_search_tools(method_executor, context)
    label_entity_search_tools = [
        t for t in entity_search_tools if getattr(t, "name", "").find("label") != -1 or getattr(t, "name", "").find("user") != -1
    ]

    return [labels_create, labels_list, labels_retrieve, labels_update] + label_entity_search_tools
