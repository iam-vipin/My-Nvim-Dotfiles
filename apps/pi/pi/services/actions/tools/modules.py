"""
Modules API tools for Plane module management operations.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from pi import logger

from .base import PlaneToolBase

log = logger.getChild(__name__)


# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing module actions


def get_module_tools(method_executor, context):
    """Return LangChain tools for the modules category using method_executor and context."""

    @tool
    async def modules_create(
        name: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        description: Optional[str] = None,
        start_date: Optional[str] = None,
        target_date: Optional[str] = None,
        status: Optional[str] = None,
        lead: Optional[str] = None,
        members: Optional[list] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new module.

        Args:
            name: Module name (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            description: Module description
            start_date: Start date (YYYY-MM-DD format)
            target_date: Target completion date (YYYY-MM-DD format)
            status: Module status (backlog, unstarted, started, completed, cancelled, paused)
            lead: Module lead user ID
            members: List of member user IDs
            external_id: External system identifier (optional)
            external_source: External system source name (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "modules",
            "create",
            name=name,
            project_id=project_id,
            workspace_slug=workspace_slug,
            description=description,
            start_date=start_date,
            target_date=target_date,
            status=status,
            lead=lead,
            members=members,
            external_id=external_id,
            external_source=external_source,
        )
        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url(f"Successfully created module '{name}'", result["data"], "module", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to create module", result["error"])

    @tool
    async def modules_list(project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """List all modules in a project.

        Args:
            project_id: Project ID (REQUIRED - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)

        Important: This tool REQUIRES a project_id. If you don't have one, you MUST first:
        1. Call search_project_by_name to find the project, OR
        2. Call projects_list to see available projects, OR
        3. Call ask_for_clarification to ask the user which project to use
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Validate project_id is present
        if not project_id:
            return PlaneToolBase.format_error_payload(
                "Missing required parameter",
                "project_id is required to list modules. You MUST first call projects_list to see available projects, OR call ask_for_clarification with disambiguation_options populated by calling projects_list to ask which project the user wants.",  # noqa: E501
            )

        result = await method_executor.execute("modules", "list", project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved modules list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list modules", result["error"])

    @tool
    async def modules_add_work_items(module_id: str, issues: list, project_id: Optional[str] = None) -> Dict[str, Any]:
        """Add work items to a module.

        Args:
            module_id: Module ID (required)
            issues: List of issue IDs to add to the module (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
        """
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "modules", "add_work_items", module_id=module_id, issues=issues, project_id=project_id, workspace_slug=workspace_slug
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload(f"Successfully added {len(issues)} work items to module", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to add work items to module", result["error"])

    @tool
    async def modules_retrieve(module_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """Retrieve details of a specific module.

        Args:
            module_id: Module ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("modules", "retrieve", module_id=module_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url("Successfully retrieved module details", result["data"], "module", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve module", result["error"])

    @tool
    async def modules_update(
        module_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        description: Optional[str] = None,
        start_date: Optional[str] = None,
        target_date: Optional[str] = None,
        status: Optional[str] = None,
        lead: Optional[str] = None,
        members: Optional[list] = None,
        external_id: Optional[str] = None,
        external_source: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update module details.

        Args:
            module_id: Module ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            name: New module name
            description: New module description
            start_date: New start date (YYYY-MM-DD format)
            target_date: New target date (YYYY-MM-DD format)
            status: New module status
            lead: New module lead user ID
            members: New members list (optional)
            external_id: External system identifier (optional)
            external_source: External system source name (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update request object with non-None values only
        update_data: Dict[str, Any] = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if start_date is not None:
            update_data["start_date"] = start_date
        if target_date is not None:
            update_data["target_date"] = target_date
        if status is not None:
            update_data["status"] = status
        if lead is not None:
            update_data["lead"] = lead
        if members is not None:
            update_data["members"] = members
        if external_id is not None:
            update_data["external_id"] = external_id
        if external_source is not None:
            update_data["external_source"] = external_source

        result = await method_executor.execute(
            "modules", "update", module_id=module_id, project_id=project_id, workspace_slug=workspace_slug, **update_data
        )

        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url("Successfully updated module", result["data"], "module", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to update module", result["error"])

    @tool
    async def modules_archive(module_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """Archive a module.

        Args:
            module_id: Module ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("modules", "archive", module_id=module_id, project_id=project_id, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully archived module", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to archive module", result["error"])

    @tool
    async def modules_unarchive(module_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """Unarchive a module.

        Args:
            module_id: Module ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("modules", "unarchive", module_id=module_id, project_id=project_id, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully unarchived module", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to unarchive module", result["error"])

    @tool
    async def modules_list_archived(project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """List archived modules in a project.

        Args:
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("modules", "list_archived", project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved archived modules list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list archived modules", result["error"])

    @tool
    async def modules_list_work_items(module_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """List work items in a module.

        Args:
            module_id: Module ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "modules", "list_work_items", module_id=module_id, project_id=project_id, workspace_slug=workspace_slug
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved module work items", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list module work items", result["error"])

    @tool
    async def modules_remove_work_item(
        module_id: str, issue_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None
    ) -> Dict[str, Any]:
        """Remove a work item from a module.

        Args:
            module_id: Module ID (required)
            issue_id: Issue ID to remove from the module (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "modules", "remove_work_item", issue_id=issue_id, module_id=module_id, project_id=project_id, workspace_slug=workspace_slug
        )

        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully removed work item from module", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to remove work item from module", result["error"])

    return [
        modules_create,
        modules_list,
        modules_add_work_items,
        modules_retrieve,
        modules_update,
        modules_archive,
        modules_unarchive,
        modules_list_archived,
        modules_list_work_items,
        modules_remove_work_item,
    ]
