"""
Work Items API tools for Plane issue/task management operations.
"""

from typing import List
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing work-item actions


def get_workitem_tools(method_executor, context):
    """Return LangChain tools for the workitems category using method_executor and context."""

    @tool
    async def workitems_create(
        name: str,
        project_id: Optional[str] = None,
        description_html: Optional[str] = None,
        priority: Optional[str] = None,
        state: Optional[str] = None,
        assignees: Optional[List[str]] = None,
        labels: Optional[List[str]] = None,
        start_date: Optional[str] = None,
        target_date: Optional[str] = None,
        type_id: Optional[str] = None,
        parent: Optional[str] = None,
        module_id: Optional[str] = None,
        cycle_id: Optional[str] = None,
        estimate_point: Optional[str] = None,
        point: Optional[int] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
        is_draft: Optional[bool] = None,
    ) -> str:
        """Create a new work item/issue.

        Args:
            name: Work item title (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (required - provide from conversation context)
            description_html: Issue description in HTML format
            priority: Priority level (high, medium, low, urgent, none)
            state: State ID for the issue
            assignees: List of assignee user IDs
            labels: List of label IDs
            start_date: Start date (YYYY-MM-DD format)
            target_date: Target completion date (YYYY-MM-DD format)
            type_id: Issue type ID (optional)
            parent: Parent work-item ID (optional)
            module_id: Module ID to associate (optional)
            cycle_id: Cycle ID to associate (optional)
            estimate_point: Estimate point ID (optional)
            point: Story points value (optional)
            external_id: External system identifier (optional)
            external_source: External system source name (optional)
            is_draft: Create as draft (optional)

        Note: To add the created work item to a module or cycle, use modules_add_work_items
        or cycles_add_work_items after creation. These cannot be set during creation.
        """
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "workitems",
            "create",
            name=name,
            description_html=description_html,
            project_id=project_id,
            workspace_slug=workspace_slug,
            priority=priority,
            state=state,
            assignees=assignees,
            labels=labels,
            start_date=start_date,
            target_date=target_date,
            type_id=type_id,
            parent=parent,
            module_id=module_id,
            cycle_id=cycle_id,
            estimate_point=estimate_point,
            point=point,
            external_id=external_id,
            external_source=external_source,
            is_draft=is_draft,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url(
                f"Successfully created work item '{name}'", result["data"], "workitem", context
            )
        else:
            return PlaneToolBase.format_error_response("Failed to create work item", result["error"])

    @tool
    async def workitems_update(
        issue_id: str,
        project_id: Optional[str] = None,
        name: Optional[str] = None,
        description_html: Optional[str] = None,
        priority: Optional[str] = None,
        state: Optional[str] = None,
        assignees: Optional[List[str]] = None,
        labels: Optional[List[str]] = None,
        start_date: Optional[str] = None,
        target_date: Optional[str] = None,
        type_id: Optional[str] = None,
        parent: Optional[str] = None,
        module_id: Optional[str] = None,
        cycle_id: Optional[str] = None,
        estimate_point: Optional[str] = None,
        point: Optional[int] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
        is_draft: Optional[bool] = None,
    ) -> str:
        """Update an existing work item/issue.

        Args:
            issue_id: Work item ID to update (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (required - provide from conversation context)
            name: New work item title
            description_html: New description in HTML format
            priority: New priority level (high, medium, low, urgent, none)
            state: New state ID
            assignees: New list of assignee user IDs
            labels: New list of label IDs
            start_date: New start date (YYYY-MM-DD format)
            target_date: New target completion date (YYYY-MM-DD format)
            type_id: Issue type ID (optional)
            parent: Parent work-item ID (optional)
            module_id: Module ID to associate (optional)
            cycle_id: Cycle ID to associate (optional)
            estimate_point: Estimate point ID (optional)
            point: Story points value (optional)
            external_id: External system identifier (optional)
            external_source: External system source name (optional)
            is_draft: Mark as draft (optional)

        Note: To add/move the work item to a module or cycle, use modules_add_work_items
        or cycles_add_work_items. Module/cycle assignment is not supported via update.
        """
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "workitems",
            "update",
            issue_id=issue_id,
            name=name,
            description_html=description_html,
            project_id=project_id,
            workspace_slug=workspace_slug,
            priority=priority,
            state=state,
            assignees=assignees,
            labels=labels,
            start_date=start_date,
            target_date=target_date,
            type_id=type_id,
            parent=parent,
            module_id=module_id,
            cycle_id=cycle_id,
            estimate_point=estimate_point,
            point=point,
            external_id=external_id,
            external_source=external_source,
            is_draft=is_draft,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url("Successfully updated work item", result["data"], "workitem", context)
        else:
            return PlaneToolBase.format_error_response("Failed to update work item", result["error"])

    @tool
    async def workitems_list(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        cursor: Optional[str] = None,
        expand: Optional[str] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
        fields: Optional[str] = None,
        order_by: Optional[str] = None,
        per_page: Optional[int] = 20,
    ) -> str:
        """List work items with filtering.

        Args:
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            cursor: Pagination cursor for next page
            expand: Comma-separated list of related fields to expand in response
            external_id: External system identifier for filtering or lookup
            external_source: External system source name for filtering or lookup
            fields: Comma-separated list of fields to include in response
            order_by: Field to order results by. Prefix with '-' for descending order
            per_page: Number of work items per page (default: 20, max: 100)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "workitems",
            "list",
            project_id=project_id,
            workspace_slug=workspace_slug,
            cursor=cursor,
            expand=expand,
            external_id=external_id,
            external_source=external_source,
            fields=fields,
            order_by=order_by,
            per_page=per_page,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved work items list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list work items", result["error"])

    @tool
    async def workitems_retrieve(
        pk: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        expand: Optional[str] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
        fields: Optional[str] = None,
        order_by: Optional[str] = None,
    ) -> str:
        """Retrieve a single work item by ID.

        Args:
            pk: Work item ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            expand: Comma-separated list of related fields to expand in response
            external_id: External system identifier for filtering or lookup
            external_source: External system source name for filtering or lookup
            fields: Comma-separated list of fields to include in response
            order_by: Field to order results by. Prefix with '-' for descending order
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "workitems",
            "retrieve",
            pk=pk,
            project_id=project_id,
            workspace_slug=workspace_slug,
            expand=expand,
            external_id=external_id,
            external_source=external_source,
            fields=fields,
            order_by=order_by,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved work item", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve work item", result["error"])

    @tool
    async def workitems_search(
        search: str,
        workspace_slug: Optional[str] = None,
        limit: Optional[int] = None,
        project_id: Optional[str] = None,
        workspace_search: Optional[str] = None,
    ) -> str:
        """Search work items by criteria.

        Args:
            search: Search query to filter results by name, description, or identifier (required)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            limit: Maximum number of results to return
            project_id: Project ID for filtering results within a specific project
            workspace_search: Whether to search across entire workspace or within specific project
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "workitems",
            "search",
            search=search,
            workspace_slug=workspace_slug,
            limit=limit,
            project_id=project_id,
            workspace_search=workspace_search,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully searched work items", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to search work items", result["error"])

    @tool
    async def workitems_get_workspace(
        issue_identifier: int,
        project_identifier: str,
        workspace_slug: Optional[str] = None,
    ) -> str:
        """Get work item across workspace using identifiers.

        Args:
            issue_identifier: Issue sequence ID (numeric identifier within project) (required)
            project_identifier: Project identifier (unique string within workspace) (required)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute(
            "workitems",
            "get_workspace",
            issue_identifier=issue_identifier,
            project_identifier=project_identifier,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved workspace work item", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve workspace work item", result["error"])

    # Get entity search tools relevant only to workitems
    from .entity_search import get_entity_search_tools

    entity_search_tools = get_entity_search_tools(method_executor, context)
    workitem_entity_search_tools = [t for t in entity_search_tools if "workitem" in t.name or "user" in t.name]

    return [
        workitems_create,
        workitems_update,
        workitems_list,
        # workitems_retrieve,
        # workitems_search,
        # workitems_get_workspace
    ] + workitem_entity_search_tools
