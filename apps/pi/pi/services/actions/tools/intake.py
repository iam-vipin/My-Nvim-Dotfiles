"""
Intake API tools for Plane work item triage operations.
"""

from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing intake actions


def get_intake_tools(method_executor, context):
    """Return LangChain tools for the intake category using method_executor and context."""

    @tool
    async def intake_create(
        name: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        description_html: Optional[str] = None,
        priority: Optional[str] = None,
        assignee: Optional[str] = None,
        reporter: Optional[str] = None,
        labels: Optional[List[str]] = None,
    ) -> str:
        """Submit work item to intake queue for triage.

        Args:
            name: Work item title (required)
            description_html: Description in HTML format
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            priority: Priority level (high, medium, low, urgent, none)
            assignee: Assignee user ID
            reporter: Reporter user ID
            labels: List of label IDs
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "intake",
            "create",
            name=name,
            description_html=description_html,
            project_id=project_id,
            workspace_slug=workspace_slug,
            priority=priority,
            assignee=assignee,
            reporter=reporter,
            labels=labels,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response(f"Successfully submitted intake item '{name}'", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to create intake item", result["error"])

    @tool
    async def intake_list(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        per_page: Optional[int] = 20,
        cursor: Optional[str] = None,
    ) -> str:
        """List intake items awaiting triage."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "intake",
            "list",
            project_id=project_id,
            workspace_slug=workspace_slug,
            per_page=per_page,
            cursor=cursor,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved intake list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list intake items", result["error"])

    @tool
    async def intake_retrieve(
        intake_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get a single intake work item by ID."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "intake",
            "retrieve",
            intake_id=intake_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved intake item", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve intake item", result["error"])

    @tool
    async def intake_update(
        intake_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        description_html: Optional[str] = None,
        priority: Optional[str] = None,
        assignee: Optional[str] = None,
        reporter: Optional[str] = None,
        labels: Optional[List[str]] = None,
    ) -> str:
        """Update intake work item details."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data: Dict[str, Any] = {}
        if name is not None:
            update_data["name"] = name
        if description_html is not None:
            update_data["description_html"] = description_html
        if priority is not None:
            update_data["priority"] = priority
        if assignee is not None:
            update_data["assignee"] = assignee
        if reporter is not None:
            update_data["reporter"] = reporter
        if labels is not None:
            update_data["labels"] = labels

        result = await method_executor.execute(
            "intake",
            "update",
            intake_id=intake_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully updated intake item", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to update intake item", result["error"])

    @tool
    async def intake_delete(
        intake_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Remove intake work item."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "intake",
            "delete",
            intake_id=intake_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully deleted intake item", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to delete intake item", result["error"])

    return [intake_create, intake_list, intake_retrieve, intake_update, intake_delete]
