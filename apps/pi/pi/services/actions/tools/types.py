"""
Types API tools for Plane issue type management.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing type actions


def get_type_tools(method_executor, context):
    """Return LangChain tools for the types category using method_executor and context."""
    """Get all Types API tools."""

    @tool
    async def types_create(
        name: str,
        description: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a new issue type.

        Args:
            name: Parameter description (required)
            description: Parameter description (optional)
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "types",
            "create",
            name=name,
            description=description,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response(f"Successfully created type '{name}'", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create type", result["error"])

    @tool
    async def types_list(project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """List all work item types."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("types", "list", project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved types list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list types", result["error"])

    @tool
    async def types_retrieve(
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get a single type by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "types",
            "retrieve",
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved type", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve type", result["error"])

    @tool
    async def types_update(
        type_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Update type details."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description

        result = await method_executor.execute(
            "types",
            "update",
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated type", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update type", result["error"])

    @tool
    async def types_delete(
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete a type."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "types",
            "delete",
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted type", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete type", result["error"])

    return [types_create, types_list, types_retrieve, types_update, types_delete]
