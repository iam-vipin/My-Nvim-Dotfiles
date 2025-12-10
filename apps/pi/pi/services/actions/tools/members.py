"""
Members API tools for Plane workspace and project member management.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing member actions


def get_member_tools(method_executor, context):
    """Return LangChain tools for the members category using method_executor and context."""
    """Get all Members API tools."""

    @tool
    async def members_get_workspace_members(workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """Get all workspace members (excludes bot users).

        Args:
            workspace_slug: Workspace slug (auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute("members", "get_workspace_members", workspace_slug=workspace_slug)

        if result["success"]:
            # Filter out bot users from the results
            members_data = result["data"]
            if isinstance(members_data, list):
                # Filter out users with is_bot=True and bot email patterns
                filtered_members = [
                    member
                    for member in members_data
                    if not (
                        # Check is_bot field if present
                        member.get("is_bot", False)
                        # Check for bot email pattern (workspace_botname_bot@plane.so)
                        or (isinstance(member.get("email"), str) and "_bot@plane.so" in member.get("email", "").lower())
                    )
                ]
                return PlaneToolBase.format_success_payload("Successfully retrieved workspace members", filtered_members)
            else:
                # If data is not a list, return as-is (edge case)
                return PlaneToolBase.format_success_payload("Successfully retrieved workspace members", members_data)
        else:
            return PlaneToolBase.format_error_payload("Failed to get workspace members", result["error"])

    @tool
    async def members_get_project_members(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get all project members (excludes bot users).

        Args:
            project_id: Project UUID (auto-filled from context if in project chat)
            workspace_slug: Workspace slug (auto-filled from context)
        """
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
            # Filter out bot users from the results
            members_data = result["data"]
            if isinstance(members_data, list):
                # Filter out users with is_bot=True and bot email patterns
                filtered_members = [
                    member
                    for member in members_data
                    if not (
                        # Check is_bot field if present
                        member.get("is_bot", False)
                        # Check for bot email pattern (workspace_botname_bot@plane.so)
                        or (isinstance(member.get("email"), str) and "_bot@plane.so" in member.get("email", "").lower())
                    )
                ]
                return PlaneToolBase.format_success_payload("Successfully retrieved project members", filtered_members)
            else:
                # If data is not a list, return as-is (edge case)
                return PlaneToolBase.format_success_payload("Successfully retrieved project members", members_data)
        else:
            return PlaneToolBase.format_error_payload("Failed to get project members", result["error"])

    return [members_get_workspace_members, members_get_project_members]
