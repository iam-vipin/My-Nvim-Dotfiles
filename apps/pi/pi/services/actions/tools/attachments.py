"""
Attachments API tools for Plane file attachment operations.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing attachment actions


def get_attachment_tools(method_executor, context):
    """Return LangChain tools for the attachments category using method_executor and context."""

    @tool
    async def attachments_create(
        issue_id: str,
        asset: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Create a new attachment on work item.

        Args:
            issue_id: Parameter description (required)
            asset: Parameter description (required)
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "attachments",
            "create",
            issue_id=issue_id,
            asset=asset,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully created attachment", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create attachment", result["error"])

    @tool
    async def attachments_list(issue_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """List attachments for an issue."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("attachments", "list", issue_id=issue_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved attachments list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list attachments", result["error"])

    @tool
    async def attachments_retrieve(
        attachment_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get a single attachment by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "attachments",
            "retrieve",
            attachment_id=attachment_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved attachment", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve attachment", result["error"])

    @tool
    async def attachments_delete(
        attachment_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Delete an attachment."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "attachments",
            "delete",
            attachment_id=attachment_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted attachment", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete attachment", result["error"])

    return [attachments_create, attachments_list, attachments_retrieve, attachments_delete]
