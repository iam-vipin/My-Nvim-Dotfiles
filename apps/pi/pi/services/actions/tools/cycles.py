"""
Cycles API tools for Plane project cycle management operations.
"""

from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing cycle actions


def get_cycle_tools(method_executor, context):
    """Return LangChain tools for the cycles category using method_executor and context."""

    @tool
    async def cycles_create(
        name: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        description: Optional[str] = None,
        owned_by: Optional[str] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
    ) -> str:
        """Create a new cycle.

        Args:
            name: Cycle name (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (required - provide from conversation context)
            start_date: Start date in YYYY-MM-DD format (optional)
            end_date: End date in YYYY-MM-DD format (optional)
            description: Cycle description (optional)
            owned_by: User ID who owns the cycle (provide when user specifies ownership or assignment)
            external_id: External system identifier (optional)
            external_source: External system source name (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]
        if project_id is None:
            if "project_id" in context:
                project_id = context["project_id"]
        # project_id and workspace_slug are now required parameters

        result = await method_executor.execute(
            "cycles",
            "create",
            name=name,
            project_id=project_id,
            workspace_slug=workspace_slug,
            start_date=start_date,
            end_date=end_date,
            description=description,
            owned_by=owned_by,
            user_id=context.get("user_id"),
            external_id=external_id,
            external_source=external_source,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url(f"Successfully created cycle '{name}'", result["data"], "cycle", context)
        else:
            return PlaneToolBase.format_error_response("Failed to create cycle", result["error"])

    @tool
    async def cycles_list(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        per_page: Optional[int] = 20,
        cursor: Optional[str] = None,
        cycle_view: Optional[str] = None,
    ) -> str:
        """List cycles in a project.

        Args:
            project_id: Project ID (REQUIRED - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (auto-filled from context; LLM-supplied value will be overridden)
            per_page: Number of cycles per page (default: 20, max: 100)
            cursor: Pagination cursor for next page
            cycle_view: Filter cycles by status (optional)

        Important: This tool REQUIRES a project_id. If you don't have one, you MUST first:
        1. Call search_project_by_name to find the project, OR
        2. Call projects_list to see available projects, OR
        3. Call ask_for_clarification to ask the user which project to use
        """
        # Auto-fill and harden workspace/project context
        # Always prefer the execution context over LLM-provided values to avoid permission errors
        if "workspace_slug" in context and context.get("workspace_slug"):
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Validate required parameters after auto-fill
        if not project_id or not workspace_slug:
            return PlaneToolBase.format_error_response(
                "Failed to list cycles",
                "Missing required context: project_id/workspace_slug",
            )

        result = await method_executor.execute(
            "cycles",
            "list",
            project_id=project_id,
            workspace_slug=workspace_slug,
            per_page=per_page,
            cursor=cursor,
            cycle_view=cycle_view,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved cycles list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list cycles", result["error"])

    @tool
    async def cycles_retrieve(pk: str, project_id: str, workspace_slug: str) -> str:
        """Retrieve a single cycle by ID.

        Args:
            pk: Cycle ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # project_id and workspace_slug are now required parameters

        result = await method_executor.execute("cycles", "retrieve", pk=pk, project_id=project_id, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved cycle", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve cycle", result["error"])

    @tool
    async def cycles_update(
        pk: str,
        project_id: str,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        description: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        owned_by: Optional[str] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
    ) -> str:
        """Update cycle details.

        Args:
            pk: Cycle ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            name: New cycle name
            description: New description
            start_date: New start date (YYYY-MM-DD)
            end_date: New end date (YYYY-MM-DD)
            owned_by: New owner user ID (optional)
            external_id: External system identifier (optional)
            external_source: External system source name (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        # Build update request object with non-None values only
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if start_date is not None:
            update_data["start_date"] = start_date
        if end_date is not None:
            update_data["end_date"] = end_date
        if owned_by is not None:
            update_data["owned_by"] = owned_by
        if external_id is not None:
            update_data["external_id"] = external_id
        if external_source is not None:
            update_data["external_source"] = external_source

        result = await method_executor.execute("cycles", "update", pk=pk, project_id=project_id, workspace_slug=workspace_slug, **update_data)

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url("Successfully updated cycle", result["data"], "cycle", context)
        else:
            return PlaneToolBase.format_error_response("Failed to update cycle", result["error"])

    @tool
    async def cycles_archive(cycle_id: str, project_id: str, workspace_slug: str) -> str:
        """Archive a cycle.

        Args:
            cycle_id: Cycle ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # project_id and workspace_slug are now required parameters

        result = await method_executor.execute("cycles", "archive", pk=cycle_id, project_id=project_id, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully archived cycle", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to archive cycle", result["error"])

    @tool
    async def cycles_add_work_items(cycle_id: str, issues: list, project_id: str, workspace_slug: Optional[str] = None) -> str:
        """Add work items to a cycle.

        Args:
            cycle_id: Cycle ID (required)
            issues: List of issue IDs to add to the cycle (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]
        # Check if issues list is empty
        if not issues or len(issues) == 0:
            return PlaneToolBase.format_success_response(
                "No work items to add to cycle", {"message": "There are no work items satisfying the criteria to add to the cycle", "issues_count": 0}
            )

        # project_id and workspace_slug are now required parameters
        result = await method_executor.execute(
            "cycles", "add_work_items", cycle_id=cycle_id, issues=issues, project_id=project_id, workspace_slug=workspace_slug
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully added work items to cycle", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to add work items to cycle", result["error"])

    @tool
    async def cycles_remove_work_item(cycle_id: str, issue_id: str, project_id: str, workspace_slug: Optional[str] = None) -> str:
        """Remove a work item from a cycle.

        Args:
            cycle_id: Cycle ID (required)
            issue_id: Issue ID to remove from the cycle (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]

        # project_id and workspace_slug are now required parameters
        result = await method_executor.execute(
            "cycles", "remove_work_item", cycle_id=cycle_id, issue_id=issue_id, project_id=project_id, workspace_slug=workspace_slug
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully removed work item from cycle", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to remove work item from cycle", result["error"])

    @tool
    async def cycles_unarchive(cycle_id: str, project_id: str, workspace_slug: Optional[str] = None) -> str:
        """Unarchive a cycle."""
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]

        # project_id and workspace_slug are now required parameters
        result = await method_executor.execute("cycles", "unarchive", pk=cycle_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response(f"Successfully unarchived cycle '{cycle_id}'", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to unarchive cycle", result["error"])

    @tool
    async def cycles_list_archived(project_id: str, workspace_slug: Optional[str] = None) -> str:
        """List archived cycles."""
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]

        # project_id and workspace_slug are now required parameters
        result = await method_executor.execute("cycles", "list_archived", project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved archived cycles list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list archived cycles", result["error"])

    @tool
    async def cycles_list_work_items(cycle_id: str, project_id: str, workspace_slug: Optional[str] = None) -> str:
        """List work items in a cycle."""
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]

        # project_id and workspace_slug are now required parameters
        result = await method_executor.execute("cycles", "list_work_items", cycle_id=cycle_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved cycle work items list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list cycle work items", result["error"])

    @tool
    async def cycles_retrieve_work_item(cycle_id: str, issue_id: str, project_id: str, workspace_slug: Optional[str] = None) -> str:
        """Get a specific work item in a cycle."""
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]

        # project_id and workspace_slug are now required parameters
        result = await method_executor.execute(
            "cycles", "retrieve_work_item", cycle_id=cycle_id, issue_id=issue_id, project_id=project_id, workspace_slug=workspace_slug
        )
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved cycle work item", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve cycle work item", result["error"])

    @tool
    async def cycles_transfer_work_items(cycle_id: str, new_cycle_id: str, project_id: str, workspace_slug: Optional[str] = None) -> str:
        """Transfer work items between cycles."""
        # Auto-fill from context if not provided
        if workspace_slug is None:
            if "workspace_slug" in context:
                workspace_slug = context["workspace_slug"]

        # project_id and workspace_slug are now required parameters
        result = await method_executor.execute(
            "cycles", "transfer_work_items", cycle_id=cycle_id, new_cycle_id=new_cycle_id, project_id=project_id, workspace_slug=workspace_slug
        )
        if result["success"]:
            return PlaneToolBase.format_success_response(
                f"Successfully transferred work items from cycle '{cycle_id}' to '{new_cycle_id}'", result["data"]
            )
        else:
            return PlaneToolBase.format_error_response("Failed to transfer cycle work items", result["error"])

    # Get entity search tools relevant only to cycles
    from .entity_search import get_entity_search_tools

    entity_search_tools = get_entity_search_tools(method_executor, context)
    cycle_entity_search_tools = [
        t for t in entity_search_tools if getattr(t, "name", "").find("cycle") != -1 or getattr(t, "name", "").find("user") != -1
    ]

    return cycle_entity_search_tools + [
        cycles_create,
        cycles_update,
        cycles_archive,
        cycles_unarchive,
        cycles_add_work_items,
        cycles_remove_work_item,
        cycles_transfer_work_items,
        cycles_retrieve,
        cycles_list,
        cycles_list_archived,
        cycles_list_work_items,
        cycles_retrieve_work_item,
    ]
