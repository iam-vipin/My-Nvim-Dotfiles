"""
Assets API tools for Plane asset management operations.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing asset actions


def get_asset_tools(method_executor, context):
    """Return LangChain tools for the assets category using method_executor and context."""

    @tool
    async def assets_create(project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs) -> str:
        """Create a new generic asset.

        Args:
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "create", project_id=project_id, workspace_slug=workspace_slug, **kwargs)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created asset", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create asset", result["error"])

    @tool
    async def assets_create_user_upload(project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs) -> str:
        """Upload user-specific assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "create_user_upload", project_id=project_id, workspace_slug=workspace_slug, **kwargs)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created user asset upload", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create user asset upload", result["error"])

    @tool
    async def assets_get_generic(
        asset_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Retrieve generic assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "get_generic", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved generic asset", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to get generic asset", result["error"])

    @tool
    async def assets_update_generic(asset_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs) -> str:
        """Update generic assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "assets", "update_generic", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug, **kwargs
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated generic asset", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update generic asset", result["error"])

    @tool
    async def assets_update_user(asset_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs) -> str:
        """Update user assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "assets", "update_user", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug, **kwargs
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated user asset", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update user asset", result["error"])

    @tool
    async def assets_delete_user(
        asset_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete user assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "delete_user", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted user asset", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete user asset", result["error"])

    return [assets_create, assets_create_user_upload, assets_get_generic, assets_update_generic, assets_update_user, assets_delete_user]
