"""
Comments API tools for Plane issue comment management.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing comment actions


def get_comment_tools(method_executor, context):
    """Return LangChain tools for the comments category using method_executor and context."""

    @tool
    async def comments_create(
        issue_id: str,
        comment_html: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a comment on an issue.

        Args:
            issue_id: Parameter description (required)
            comment_html: Parameter description (required)
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "comments",
            "create",
            issue_id=issue_id,
            comment_html=comment_html,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created comment", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create comment", result["error"])

    @tool
    async def comments_list(issue_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """List comments for an issue."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("comments", "list", issue_id=issue_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved comments list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list comments", result["error"])

    @tool
    async def comments_retrieve(
        comment_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get a single comment by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "comments",
            "retrieve",
            comment_id=comment_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved comment", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve comment", result["error"])

    @tool
    async def comments_update(
        comment_id: str,
        comment_html: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Update comment details."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "comments",
            "update",
            comment_id=comment_id,
            comment_html=comment_html,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated comment", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update comment", result["error"])

    @tool
    async def comments_delete(
        comment_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete a comment."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "comments",
            "delete",
            comment_id=comment_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted comment", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete comment", result["error"])

    return [comments_create, comments_list, comments_retrieve, comments_update, comments_delete]
