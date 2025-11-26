"""
Links API tools for Plane issue link management.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing link actions


def get_link_tools(method_executor, context):
    """Return LangChain tools for the links category using method_executor and context."""

    @tool
    async def links_create(
        issue_id: str,
        url: str,
        title: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a link for an issue.

        Args:
            issue_id: Parameter description (required)
            url: Parameter description (required)
            title: Parameter description (optional)
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "links",
            "create",
            issue_id=issue_id,
            url=url,
            title=title,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created link", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create link", result["error"])

    @tool
    async def links_list(issue_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """List links for an issue."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("links", "list", issue_id=issue_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved links list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list links", result["error"])

    @tool
    async def links_retrieve(
        link_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get a single link by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "links",
            "retrieve",
            link_id=link_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved link", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve link", result["error"])

    @tool
    async def links_update(
        link_id: str,
        url: Optional[str] = None,
        title: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Update link details."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data = {}
        if url is not None:
            update_data["url"] = url
        if title is not None:
            update_data["title"] = title

        result = await method_executor.execute(
            "links",
            "update",
            link_id=link_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated link", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update link", result["error"])

    @tool
    async def links_delete(
        link_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete a link."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "links",
            "delete",
            link_id=link_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted link", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete link", result["error"])

    return [links_create, links_list, links_retrieve, links_update, links_delete]
