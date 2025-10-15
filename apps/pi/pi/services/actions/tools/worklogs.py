"""
Worklogs API tools for Plane time tracking operations.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing worklog actions


def get_worklog_tools(method_executor, context):
    """Return LangChain tools for the worklogs category using method_executor and context."""

    @tool
    async def worklogs_create(
        issue_id: str,
        description: str,
        duration: int,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a new worklog entry.

        Args:
            issue_id: Parameter description (required)
            description: Parameter description (required)
            duration: Parameter description (required)
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "worklogs",
            "create",
            issue_id=issue_id,
            description=description,
            duration=duration,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created worklog", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create worklog", result["error"])

    @tool
    async def worklogs_list(
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """List worklogs for an issue."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "worklogs",
            "list",
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved worklogs", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list worklogs", result["error"])

    @tool
    async def worklogs_get_summary(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get project worklog summary."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "worklogs",
            "get_summary",
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved worklog summary", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to get worklog summary", result["error"])

    @tool
    async def worklogs_update(
        worklog_id: str,
        description: Optional[str] = None,
        duration: Optional[int] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Update time entry."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data: Dict[str, Any] = {}
        if description is not None:
            update_data["description"] = description
        if duration is not None:
            update_data["duration"] = duration

        result = await method_executor.execute(
            "worklogs",
            "update",
            worklog_id=worklog_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated worklog", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update worklog", result["error"])

    @tool
    async def worklogs_delete(
        worklog_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete time entry."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "worklogs",
            "delete",
            worklog_id=worklog_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted worklog", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete worklog", result["error"])

    return [worklogs_create, worklogs_list, worklogs_get_summary, worklogs_update, worklogs_delete]
