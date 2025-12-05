"""
Work Items API tools for Plane issue/task management operations.
"""

import logging
import uuid
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

log = logging.getLogger(__name__)

# Issue relation types as per Plane SDK documentation
RELATION_TYPES = {
    "blocking": "blocking",
    "blocked_by": "blocked_by",
    "duplicate": "duplicate",
    "relates_to": "relates_to",
    "start_before": "start_before",
    "start_after": "start_after",
    "finish_before": "finish_before",
    "finish_after": "finish_after",
}

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing work-item actions


async def resolve_state_to_uuid(state: Optional[str], project_id: Optional[str], workspace_slug: Optional[str] = None) -> Optional[str]:
    """
    Resolve state name to UUID with enhanced matching strategy.

    Args:
        state: State name or UUID
        project_id: Project ID for state resolution and default fallback
        workspace_slug: Optional workspace slug for filtering

    Returns:
        State UUID if resolved, None if state should use project default
    """
    if not state:
        return None

    # Check if state is already a valid UUID
    try:
        uuid.UUID(state)
        return state
    except (ValueError, TypeError):
        log.debug(f"State '{state}' is not a UUID, will resolve as name")

    # Only attempt resolution if we have a project_id
    if not project_id:
        log.warning(f"Cannot resolve state '{state}' without project_id")
        return None

    try:
        from pi.app.api.v1.helpers.plane_sql_queries import search_state_by_name

        state_result = await search_state_by_name(state, project_id, workspace_slug)

        if state_result and "id" in state_result:
            resolved_uuid = state_result["id"]
            return resolved_uuid
        else:
            return None

    except Exception:
        return None


async def resolve_type_to_uuid(type_id: Optional[str], project_id: Optional[str], workspace_slug: Optional[str] = None) -> Optional[str]:
    """
    Resolve issue type name to UUID with enhanced matching strategy.

    Args:
        type_id: Type name or UUID
        project_id: Project ID for type resolution
        workspace_slug: Optional workspace slug for filtering

    Returns:
        Type UUID if resolved, None if type should use project default or if resolution fails
    """
    if not type_id:
        return None

    # Check if type_id is already a valid UUID
    try:
        uuid.UUID(type_id)
        return type_id
    except (ValueError, TypeError):
        log.debug(f"Type '{type_id}' is not a UUID, will resolve as name")

    # Only attempt resolution if we have a project_id
    if not project_id:
        log.warning(f"Cannot resolve type '{type_id}' without project_id")
        return None

    try:
        from pi.app.api.v1.helpers.plane_sql_queries import search_type_by_name

        type_result = await search_type_by_name(type_id, project_id, workspace_slug)

        if type_result and "id" in type_result:
            resolved_uuid = type_result["id"]
            log.info(f"Resolved type '{type_id}' to UUID {resolved_uuid}")
            return resolved_uuid
        else:
            log.warning(f"Could not resolve type '{type_id}' to a valid UUID")
            return None

    except Exception as e:
        log.error(f"Error resolving type '{type_id}': {e}")
        return None


async def get_epic_type_id(method_executor, project_id: str, workspace_slug: str) -> Optional[str]:
    """Get the epic issue type ID for a project using direct SQL query.

    Args:
        method_executor: The method executor instance (unused, kept for compatibility)
        project_id: Project UUID
        workspace_slug: Workspace slug (unused, kept for compatibility)

    Returns:
        Epic type ID if found, None otherwise
    """
    try:
        # Import the SQL query function
        from pi.app.api.v1.helpers.plane_sql_queries import get_epic_type_id_for_project

        # Use direct SQL query instead of SDK method for better reliability
        epic_type_id = await get_epic_type_id_for_project(project_id)

        if epic_type_id:
            log.info(f"Found epic type ID {epic_type_id} for project {project_id}")
            return epic_type_id
        else:
            log.warning(f"No epic issue type found for project {project_id}")
            return None

    except Exception as e:
        log.error(f"Failed to get epic type ID for project {project_id}: {str(e)}")
        return None


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
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
        is_draft: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """Create a new work item/issue.

        Args:
            name: Work item title (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (required - provide from conversation context)
            description_html: Workitem description in HTML format
            priority: Priority level (high, medium, low, urgent, none)
            state: State name or UUID for the workitem (e.g., "todo", "in progress", "done")
            assignees: List of assignee user IDs
            labels: List of label IDs
            start_date: Start date (YYYY-MM-DD format)
            target_date: Target completion date (YYYY-MM-DD format)
            type_id: Workitem type ID (optional). MUST be the 'issue_types_id' (UUID of the issue type definition), NOT the 'project_issue_types_id'.
            parent: Parent work-item ID (optional)
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

        # Resolve state name to UUID if needed
        resolved_state = await resolve_state_to_uuid(state, project_id, workspace_slug)

        # Resolve type name to UUID if needed
        resolved_type_id = await resolve_type_to_uuid(type_id, project_id, workspace_slug)

        result = await method_executor.execute(
            "workitems",
            "create",
            name=name,
            description_html=description_html,
            project_id=project_id,
            workspace_slug=workspace_slug,
            priority=priority,
            state=resolved_state,
            assignees=assignees,
            labels=labels,
            start_date=start_date,
            target_date=target_date,
            type_id=resolved_type_id,
            parent=parent,
            external_id=external_id,
            external_source=external_source,
            is_draft=is_draft,
        )

        if result["success"]:
            # Enrich response data with missing fields for URL construction
            data = result["data"]
            if data and isinstance(data, dict) and data.get("id"):
                try:
                    from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                    # Get the missing project_identifier and sequence_id
                    identifier_info = await get_issue_identifier_for_artifact(str(data["id"]))
                    if identifier_info:
                        data["project_identifier"] = identifier_info.get("project_identifier")
                        data["sequence_id"] = identifier_info.get("sequence_id")
                        log.info(f"Enriched workitem data with identifier info: {identifier_info.get("identifier")}")
                except Exception as e:
                    log.warning(f"Could not enrich workitem data with identifier info: {e}")

            return await PlaneToolBase.format_success_payload_with_url(
                f"Successfully created work item '{name}'",
                data,
                "workitem",
                context,
            )
        else:
            return PlaneToolBase.format_error_payload("Failed to create work item", result.get("error"))

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
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
        is_draft: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """Update an existing work item/issue.

        Args:
            issue_id: Work item ID to update (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (required - provide from conversation context)
            name: New work item title
            description_html: New description in HTML format
            priority: New priority level (high, medium, low, urgent, none)
            state: New state name or UUID (e.g., "todo", "in progress", "done")
            assignees: New list of assignee user IDs
            labels: New list of label IDs
            start_date: New start date (YYYY-MM-DD format)
            target_date: New target completion date (YYYY-MM-DD format)
            type_id: Workitem type ID (optional). MUST be the 'issue_types_id' (UUID of the issue type definition), NOT the 'project_issue_types_id'.
            parent: Parent work-item ID (optional)
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

        # Resolve state name to UUID if needed
        resolved_state = await resolve_state_to_uuid(state, project_id, workspace_slug)

        # Resolve type name to UUID if needed
        resolved_type_id = await resolve_type_to_uuid(type_id, project_id, workspace_slug)

        # Build update data with only non-None values to avoid overwriting existing fields
        update_data = {
            k: v
            for k, v in {
                "name": name,
                "description_html": description_html,
                "priority": priority,
                "state": resolved_state,
                "assignees": assignees,
                "labels": labels,
                "start_date": start_date,
                "target_date": target_date,
                "type_id": resolved_type_id,
                "parent": parent,
                "external_id": external_id,
                "external_source": external_source,
                "is_draft": is_draft,
            }.items()
            if v is not None
        }

        result = await method_executor.execute(
            "workitems",
            "update",
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            # Enrich response data with missing fields for URL construction
            data = result["data"]
            if data and isinstance(data, dict) and data.get("id"):
                try:
                    from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                    # Get the missing project_identifier and sequence_id
                    identifier_info = await get_issue_identifier_for_artifact(str(data["id"]))
                    if identifier_info:
                        data["project_identifier"] = identifier_info.get("project_identifier")
                        data["sequence_id"] = identifier_info.get("sequence_id")
                        log.info(f"Enriched workitem update data with identifier info: {identifier_info.get("identifier")}")
                except Exception as e:
                    log.warning(f"Could not enrich workitem update data with identifier info: {e}")

            return await PlaneToolBase.format_success_payload_with_url("Successfully updated work item", data, "workitem", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to update work item", result["error"])

    @tool
    async def create_epic(
        name: str,
        project_id: Optional[str] = None,
        description_html: Optional[str] = None,
        priority: Optional[str] = None,
        state: Optional[str] = None,
        assignees: Optional[List[str]] = None,
        labels: Optional[List[str]] = None,
        start_date: Optional[str] = None,
        target_date: Optional[str] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new epic work item.

        Args:
            name: Epic title (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            description_html: Epic description in HTML format
            priority: Priority level (high, medium, low, urgent, none)
            state: State name or ID for the epic (e.g., "done", "in progress", or UUID)
            assignees: List of assignee user IDs
            labels: List of label IDs
            start_date: Start date (YYYY-MM-DD format)
            target_date: Target completion date (YYYY-MM-DD format)
            external_id: External system identifier (optional)
            external_source: External system source name (optional)

        Note: This tool automatically sets the work item type to 'epic' for the specified project.
        To add the created epic to a module or cycle, use modules_add_work_items or cycles_add_work_items after creation.
        """
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Get the epic type ID for this project
        if project_id is None:
            return PlaneToolBase.format_error_payload("Failed to create epic", "Project ID is required for epic creation. Please specify a project.")

        epic_type_id = await get_epic_type_id(method_executor, project_id, workspace_slug)
        if not epic_type_id:
            return PlaneToolBase.format_error_payload(
                "Failed to create epic", "Could not find epic issue type for this project. Please ensure an epic issue type exists."
            )

        # Resolve state name to UUID if provided as name
        resolved_state = await resolve_state_to_uuid(state, project_id, workspace_slug)

        result = await method_executor.execute(
            "workitems",
            "create",
            name=name,
            description_html=description_html,
            project_id=project_id,
            workspace_slug=workspace_slug,
            priority=priority,
            state=resolved_state,
            assignees=assignees,
            labels=labels,
            start_date=start_date,
            target_date=target_date,
            type_id=epic_type_id,  # Automatically set to epic type
            external_id=external_id,
            external_source=external_source,
        )

        if result["success"]:
            # Enrich response data with missing fields for URL construction
            data = result["data"]
            if data and isinstance(data, dict) and data.get("id"):
                try:
                    from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                    # Get the missing project_identifier and sequence_id
                    identifier_info = await get_issue_identifier_for_artifact(str(data["id"]))
                    if identifier_info:
                        data["project_identifier"] = identifier_info.get("project_identifier")
                        data["sequence_id"] = identifier_info.get("sequence_id")
                        log.info(f"Enriched epic data with identifier info: {identifier_info.get("identifier")}")
                except Exception as e:
                    log.warning(f"Could not enrich epic data with identifier info: {e}")

            return await PlaneToolBase.format_success_payload_with_url(f"Successfully created epic '{name}'", data, "epic", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to create epic", result["error"])

    @tool
    async def update_epic(
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
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update an existing epic work item.

        Args:
            issue_id: Epic ID to update (required)
            project_id: Project ID (optional - provide from conversation context)
            name: Epic title
            description_html: Epic description in HTML format
            priority: Priority level (high, medium, low, urgent, none)
            state: State ID for the epic
            assignees: List of assignee user IDs
            labels: List of label IDs
            start_date: Start date (YYYY-MM-DD format)
            target_date: Target completion date (YYYY-MM-DD format)
            external_id: External system identifier (optional)
            external_source: External system source name (optional)

        Note: This tool updates an existing epic. It does not change the work item type.
        To add/move the epic to a module or cycle, use modules_add_work_items or cycles_add_work_items.
        """
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Resolve state name to UUID if needed
        resolved_state = await resolve_state_to_uuid(state, project_id, workspace_slug)

        # Build update data with only non-None values to avoid overwriting existing fields
        # Note: type_id is intentionally omitted to preserve epic type
        update_data = {
            k: v
            for k, v in {
                "name": name,
                "description_html": description_html,
                "priority": priority,
                "state": resolved_state,
                "assignees": assignees,
                "labels": labels,
                "start_date": start_date,
                "target_date": target_date,
                "external_id": external_id,
                "external_source": external_source,
            }.items()
            if v is not None
        }

        result = await method_executor.execute(
            "workitems",
            "update",
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url("Successfully updated epic", result["data"], "epic", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to update epic", result["error"])

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
        priority: Optional[str] = None,
        state: Optional[str] = None,
        assignees: Optional[List[str]] = None,
        labels: Optional[List[str]] = None,
        start_date: Optional[str] = None,
        target_date: Optional[str] = None,
        created_by: Optional[str] = None,
        updated_by: Optional[str] = None,
        type_id: Optional[str] = None,
        parent: Optional[str] = None,
        is_draft: Optional[bool] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
        completed_at: Optional[str] = None,
        archived_at: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            priority: Filter by priority (high, medium, low, urgent, none)
            state: Filter by state name or UUID
            assignees: Filter by assignee user IDs
            labels: Filter by label IDs
            start_date: Filter by start date
            target_date: Filter by target date
            created_by: Filter by creator ID
            updated_by: Filter by updater ID
            type_id: Filter by issue type ID
            parent: Filter by parent issue ID
            is_draft: Filter by draft status
            created_at: Filter by creation time
            updated_at: Filter by update time
            completed_at: Filter by completion time
            archived_at: Filter by archive time
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Resolve state name to UUID if needed
        resolved_state = await resolve_state_to_uuid(state, project_id, workspace_slug)

        # Build filter arguments
        filter_args = {
            "priority": priority,
            "state": resolved_state,
            "assignees": assignees,
            "labels": labels,
            "start_date": start_date,
            "target_date": target_date,
            "created_by": created_by,
            "updated_by": updated_by,
            "type_id": type_id,
            "parent": parent,
            "is_draft": is_draft,
            "created_at": created_at,
            "updated_at": updated_at,
            "completed_at": completed_at,
            "archived_at": archived_at,
        }

        # Remove None values
        filter_args = {k: v for k, v in filter_args.items() if v is not None}

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
            return PlaneToolBase.format_success_payload("Successfully retrieved work items list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list work items", result["error"])

    @tool
    async def workitems_retrieve(
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        expand: Optional[str] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
        fields: Optional[str] = None,
        order_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve a single work item by ID.

        Args:
            issue_id: Work item ID (required)
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
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            expand=expand,
            external_id=external_id,
            external_source=external_source,
            fields=fields,
            order_by=order_by,
        )

        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved work item", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve work item", result["error"])

    @tool
    async def workitems_search(
        search: str,
        workspace_slug: Optional[str] = None,
        limit: Optional[int] = None,
        project_id: Optional[str] = None,
        workspace_search: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully searched work items", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to search work items", result["error"])

    @tool
    async def workitems_get_workspace(
        issue_identifier: int,
        project_identifier: str,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully retrieved workspace work item", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve workspace work item", result["error"])

    @tool
    async def workitems_create_relation(
        issue_id: str,
        relation_type: str,
        related_issues: List[str],
        project_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create relationships between work items.

        Args:
            issue_id: Source work item ID to create relations from (required)
            relation_type: Type of relationship - one of: blocking, blocked_by, duplicate, relates_to, start_before, start_after, finish_before, finish_after (required)
            related_issues: List of work item IDs to create relations with (required)
            project_id: Project ID (required - provide from conversation context or previous actions)

        Supported relation types:
        - blocking: This work item blocks the related work items
        - blocked_by: This work item is blocked by the related work items
        - duplicate: This work item is a duplicate of the related work items
        - relates_to: This work item relates to the related work items
        - start_before: This work item should start before the related work items
        - start_after: This work item should start after the related work items
        - finish_before: This work item should finish before the related work items
        - finish_after: This work item should finish after the related work items

        Examples:
        - "Make issue A block issue B" = workitems_create_relation(issue_id=A, relation_type="blocking", related_issues=[B])
        - "Mark issue X as duplicate of issue Y" = workitems_create_relation(issue_id=X, relation_type="duplicate", related_issues=[Y])
        - "Issue C relates to issues D and E" = workitems_create_relation(issue_id=C, relation_type="relates_to", related_issues=[D, E])
        """  # noqa: E501
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Validate relation type
        if relation_type not in RELATION_TYPES:
            valid_types = ", ".join(RELATION_TYPES.keys())
            return PlaneToolBase.format_error_payload(
                "Invalid relation type", f"Relation type '{relation_type}' is not valid. Valid types are: {valid_types}"
            )

        # Validate required parameters
        if not related_issues:
            return PlaneToolBase.format_error_payload("Missing related issues", "At least one related issue ID must be provided")

        result = await method_executor.execute(
            "workitems",
            "create_relation",
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            relation_type=relation_type,
            issues=related_issues,
        )

        if result["success"]:
            relation_count = len(related_issues)

            # For relations, we need to return entity info for the source work item (issue_id)
            # Create a mock work item response with the source issue_id for entity URL generation
            source_workitem_data = {"id": issue_id}

            return await PlaneToolBase.format_success_payload_with_url(
                f"Successfully created {relation_count} '{relation_type}' relation(s) for work item", source_workitem_data, "workitem", context
            )
        else:
            return PlaneToolBase.format_error_payload("Failed to create work item relation", result["error"])

    @tool
    async def workitems_delete(
        issue_id: str,
        project_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Delete a work item/issue.

        Args:
            issue_id: Work item ID to delete (required)
            project_id: Project ID (required - provide from conversation context or previous actions)

        Warning: This action is permanent and cannot be undone. The work item will be permanently deleted.
        """
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "workitems",
            "delete",
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_payload(f"Successfully deleted work item {issue_id}", {"id": issue_id})
        else:
            return PlaneToolBase.format_error_payload("Failed to delete work item", result.get("error"))

    return [
        workitems_create,
        workitems_update,
        create_epic,
        update_epic,
        workitems_create_relation,
        workitems_delete,
        workitems_list,
        # workitems_retrieve,
        # workitems_search,
        # workitems_get_workspace
    ]
