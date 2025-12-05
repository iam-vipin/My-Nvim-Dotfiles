"""
Activity API tools for Plane activity tracking operations.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing activity actions


def get_activity_tools(method_executor, context):
    """Return LangChain tools for the activity category using method_executor and context."""

    @tool
    async def activity_list(project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """List activity for a project.

        Args:
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("activity", "list", project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved activity list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list activity", result["error"])

    @tool
    async def activity_retrieve(
        activity_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get a single activity by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "activity",
            "retrieve",
            activity_id=activity_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved activity", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve activity", result["error"])

    return [activity_list, activity_retrieve]
