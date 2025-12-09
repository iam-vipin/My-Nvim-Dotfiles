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
    ) -> Dict[str, Any]:
        """Create a new worklog entry.

        Args:
            issue_id: Issue ID (required)
            description: Worklog description (required)
            duration: Duration in minutes (required)
            project_id: Project ID (optional, auto-filled from context)
            workspace_slug: Workspace slug (optional, auto-filled from context)
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
            return PlaneToolBase.format_success_payload("Successfully created worklog", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create worklog", result["error"])

    @tool
    async def worklogs_list(
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully retrieved worklogs", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list worklogs", result["error"])

    @tool
    async def worklogs_get_summary(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully retrieved worklog summary", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to get worklog summary", result["error"])

    @tool
    async def worklogs_update(
        worklog_id: str,
        issue_id: str,
        description: Optional[str] = None,
        duration: Optional[int] = None,
        created_by: Optional[str] = None,
        updated_by: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update time entry.

        Args:
            worklog_id: Worklog ID (required)
            issue_id: Issue ID (required)
            description: Worklog description
            duration: Duration in minutes
            created_by: User ID who created the worklog
            updated_by: User ID who updated the worklog
            project_id: Project ID (optional, auto-filled from context)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
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
        if created_by is not None:
            update_data["created_by"] = created_by
        if updated_by is not None:
            update_data["updated_by"] = updated_by

        result = await method_executor.execute(
            "worklogs",
            "update",
            worklog_id=worklog_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully updated worklog", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to update worklog", result["error"])

    @tool
    async def worklogs_delete(
        worklog_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully deleted worklog", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to delete worklog", result["error"])

    return [worklogs_create, worklogs_list, worklogs_get_summary, worklogs_update, worklogs_delete]
