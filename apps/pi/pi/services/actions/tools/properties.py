"""
Properties API tools for Plane custom property management.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing property actions


def get_property_tools(method_executor, context):
    """Return LangChain tools for the properties category using method_executor and context."""
    """Get all Properties API tools."""

    @tool
    async def properties_create(
        name: str,
        type_id: str,
        description: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a new property.

        Args:
            name: Parameter description (required)
            type_id: Parameter description (required)
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
            "properties",
            "create",
            name=name,
            type_id=type_id,
            description=description,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response(f"Successfully created property '{name}'", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create property", result["error"])

    @tool
    async def properties_list(project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """List all custom properties."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("properties", "list", project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved properties list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list properties", result["error"])

    @tool
    async def properties_retrieve(
        property_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get a single property by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "retrieve",
            property_id=property_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved property", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve property", result["error"])

    @tool
    async def properties_update(
        property_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Update property details."""
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
            "properties",
            "update",
            property_id=property_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated property", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update property", result["error"])

    @tool
    async def properties_delete(
        property_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete a property."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "delete",
            property_id=property_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted property", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete property", result["error"])

    @tool
    async def properties_create_option(
        property_id: str,
        type_id: str,
        name: str,
        value: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a property option."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "create_option",
            property_id=property_id,
            type_id=type_id,
            name=name,
            value=value,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created property option", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create property option", result["error"])

    @tool
    async def properties_create_value(
        property_id: str,
        type_id: str,
        issue_id: str,
        value: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a property value."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "create_value",
            property_id=property_id,
            type_id=type_id,
            issue_id=issue_id,
            value=value,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created property value", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create property value", result["error"])

    @tool
    async def properties_list_options(
        property_id: str,
        type_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """List property options."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "list_options",
            property_id=property_id,
            type_id=type_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved property options", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list property options", result["error"])

    @tool
    async def properties_list_values(
        type_id: str,
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """List property values."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "list_values",
            type_id=type_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved property values", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list property values", result["error"])

    @tool
    async def properties_retrieve_option(
        property_id: str,
        type_id: str,
        option_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get property option by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "retrieve_option",
            property_id=property_id,
            type_id=type_id,
            option_id=option_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved property option", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve property option", result["error"])

    @tool
    async def properties_update_option(
        property_id: str,
        type_id: str,
        option_id: str,
        name: Optional[str] = None,
        value: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Update property option."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if value is not None:
            update_data["value"] = value

        result = await method_executor.execute(
            "properties",
            "update_option",
            property_id=property_id,
            type_id=type_id,
            option_id=option_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated property option", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update property option", result["error"])

    @tool
    async def properties_delete_option(
        property_id: str,
        type_id: str,
        option_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete property option."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "properties",
            "delete_option",
            property_id=property_id,
            type_id=type_id,
            option_id=option_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted property option", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete property option", result["error"])

    return [
        properties_create,
        properties_list,
        properties_retrieve,
        properties_update,
        properties_delete,
        properties_create_option,
        properties_create_value,
        properties_list_options,
        properties_list_values,
        properties_retrieve_option,
        properties_update_option,
        properties_delete_option,
    ]
