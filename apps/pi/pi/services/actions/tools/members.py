"""
Members API tools for Plane workspace and project member management.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing member actions


def get_member_tools(method_executor, context):
    """Return LangChain tools for the members category using method_executor and context."""
    """Get all Members API tools."""

    @tool
    async def members_get_workspace_members(workspace_slug: Optional[str] = None) -> str:
        """Get all workspace members.

        Args:
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute("members", "get_workspace_members", workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved workspace members", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to get workspace members", result["error"])

    @tool
    async def members_get_project_members(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get all project members."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "members",
            "get_project_members",
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved project members", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to get project members", result["error"])

    return [members_get_workspace_members, members_get_project_members]
