"""
Types API tools for Plane issue type management.
"""

from typing import Any
from typing import Dict
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
        project_ids: Optional[list[str]] = None,
        is_epic: Optional[bool] = None,
        is_active: Optional[bool] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new work item type.

        Args:
            name: Name of the work item type (required)
            description: Optional description of the type
            project_ids: List of project IDs to associate with this type
            is_epic: Flag to mark this type as an epic type
            is_active: Activation status of the type
            external_source: External integration source (e.g., 'jira', 'github')
            external_id: External system identifier for this type
            project_id: UUID of the project (auto-filled from context)
            workspace_slug: Workspace slug identifier (auto-filled from context)
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
            project_ids=project_ids,
            is_epic=is_epic,
            is_active=is_active,
            external_source=external_source,
            external_id=external_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload(f"Successfully created type '{name}'", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create type", result["error"])

    @tool
    async def types_list(project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """List all work item types."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("types", "list", project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved types list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list types", result["error"])

    @tool
    async def types_retrieve(
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully retrieved type", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve type", result["error"])

    @tool
    async def types_update(
        type_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        project_ids: Optional[list[str]] = None,
        is_epic: Optional[bool] = None,
        is_active: Optional[bool] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update work item type details.

        Args:
            type_id: UUID of the work item type to update (required)
            name: Updated name of the type
            description: Updated description
            project_ids: Updated list of project IDs to associate with this type
            is_epic: Updated epic type flag
            is_active: Updated activation status
            external_source: Updated external integration source
            external_id: Updated external system identifier
            project_id: UUID of the project (auto-filled from context)
            workspace_slug: Workspace slug identifier (auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data: dict[str, Any] = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if project_ids is not None:
            update_data["project_ids"] = project_ids
        if is_epic is not None:
            update_data["is_epic"] = is_epic
        if is_active is not None:
            update_data["is_active"] = is_active
        if external_source is not None:
            update_data["external_source"] = external_source
        if external_id is not None:
            update_data["external_id"] = external_id

        result = await method_executor.execute(
            "types",
            "update",
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully updated type", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to update type", result["error"])

    @tool
    async def types_delete(
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully deleted type", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to delete type", result["error"])

    return [types_create, types_list, types_retrieve, types_update, types_delete]
