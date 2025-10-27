"""
Projects API tools for Plane workspace operations.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from pi import logger

from .base import PlaneToolBase

log = logger.getChild(__name__)


# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing project actions


def get_project_tools(method_executor, context):
    """Return LangChain tools for the projects category using method_executor and context."""

    @tool
    async def projects_create(
        name: str,
        workspace_slug: Optional[str] = None,
        description: Optional[str] = None,
        identifier: Optional[str] = None,
        project_lead: Optional[str] = None,
        default_assignee: Optional[str] = None,
        icon_prop: Optional[dict] = None,
        emoji: Optional[str] = None,
        cover_image: Optional[str] = None,
        module_view: Optional[bool] = None,
        cycle_view: Optional[bool] = None,
        issue_views_view: Optional[bool] = None,
        page_view: Optional[bool] = None,
        intake_view: Optional[bool] = None,
        guest_view_all_features: Optional[bool] = None,
        archive_in: Optional[int] = None,
        close_in: Optional[int] = None,
        timezone: Optional[str] = None,
    ) -> str:
        """Create a new project in the workspace.

        Args:
            name: Project name (required)
            description: Project description (optional)
            identifier: Project identifier (auto-generated from name if omitted)
            project_lead: User ID to set as project lead (optional)
            default_assignee: User ID to set as default assignee (optional)
            icon_prop: Icon configuration JSON (optional)
            emoji: Emoji to represent the project (optional)
            cover_image: Cover image URL (optional)
            module_view: Enable/disable module view (optional)
            cycle_view: Enable/disable cycle view (optional)
            issue_views_view: Enable/disable issue views (optional)
            page_view: Enable/disable page view (optional)
            intake_view: Enable/disable intake view (optional)
            guest_view_all_features: Allow guests to view all features (optional)
            archive_in: Auto-archive workitems after N months. Should be less than or equal to 12 (optional)
            close_in: Auto-close workitems after N months. Should be less than or equal to 12 (optional)
            timezone: Timezone for the project (optional)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Determine identifier
        base_identifier = identifier or PlaneToolBase.generate_project_identifier(name)

        # Auto-fill workspace_slug from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        # Build payload with non-None values
        payload: Dict[str, Any] = {
            "name": name,
            "identifier": base_identifier,
            "workspace_slug": workspace_slug,
        }

        # Only add description if it's not None
        if description is not None:
            payload["description"] = description
        if project_lead is not None:
            payload["project_lead"] = project_lead
        if default_assignee is not None:
            payload["default_assignee"] = default_assignee
        if icon_prop is not None:
            payload["icon_prop"] = icon_prop
        if emoji is not None:
            payload["emoji"] = emoji
        if cover_image is not None:
            payload["cover_image"] = cover_image
        if module_view is not None:
            payload["module_view"] = module_view
        if cycle_view is not None:
            payload["cycle_view"] = cycle_view
        if issue_views_view is not None:
            payload["issue_views_view"] = issue_views_view
        if page_view is not None:
            payload["page_view"] = page_view
        if intake_view is not None:
            payload["intake_view"] = intake_view
        if guest_view_all_features is not None:
            payload["guest_view_all_features"] = guest_view_all_features
        if archive_in is not None:
            payload["archive_in"] = archive_in
        if close_in is not None:
            payload["close_in"] = close_in
        if timezone is not None:
            payload["timezone"] = timezone

        # Try to create project
        result = await method_executor.execute("projects", "create", **payload)

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url(
                f"Successfully created project '{name}' with identifier '{base_identifier}'", result["data"], "project", context
            )
        else:
            # If failed due to identifier conflict, try with a different identifier
            if "already taken" in result.get("error", "") or "409" in result.get("error", ""):
                # Generate a new identifier with timestamp
                new_identifier = PlaneToolBase.generate_fallback_identifier(base_identifier)

                # Retry with new identifier (preserve other fields)
                payload["identifier"] = new_identifier
                retry_result = await method_executor.execute("projects", "create", **payload)

                if retry_result["success"]:
                    return await PlaneToolBase.format_success_response_with_url(
                        f"Successfully created project '{name}' with identifier '{new_identifier}' (original '{base_identifier}' was taken)",
                        retry_result["data"],
                        "project",
                        context,
                    )
                else:
                    log.info(f"Failed to create project. Error: {retry_result["error"]}\nPayload: {payload}")
                    return PlaneToolBase.format_error_response("Failed to create project even with alternative identifier", retry_result["error"])
            else:
                log.info(f"Failed to create project. Error: {result["error"]}\nPayload: {payload}")
                return PlaneToolBase.format_error_response("Failed to create project", result["error"])

    @tool
    async def projects_list(workspace_slug: Optional[str] = None, per_page: Optional[int] = 20, cursor: Optional[str] = None) -> str:
        """List projects in the workspace.

        Args:
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            per_page: Number of projects per page (default: 20, max: 100)
            cursor: Pagination cursor for next page
        """
        # Auto-fill workspace_slug from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute("projects", "list", workspace_slug=workspace_slug, per_page=per_page, cursor=cursor)

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved projects list", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to list projects", result["error"])

    @tool
    async def projects_retrieve(pk: str, workspace_slug: Optional[str] = None) -> str:
        """Retrieve a single project by ID.

        Args:
            pk: Project ID (required)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill workspace_slug from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute("projects", "retrieve", pk=pk, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved project", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to retrieve project", result["error"])

    @tool
    async def projects_update(
        pk: str,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        description: Optional[str] = None,
        identifier: Optional[str] = None,
        project_lead: Optional[str] = None,
        default_assignee: Optional[str] = None,
        icon_prop: Optional[dict] = None,
        emoji: Optional[str] = None,
        cover_image: Optional[str] = None,
        module_view: Optional[bool] = None,
        cycle_view: Optional[bool] = None,
        issue_views_view: Optional[bool] = None,
        page_view: Optional[bool] = None,
        intake_view: Optional[bool] = None,
        guest_view_all_features: Optional[bool] = None,
        archive_in: Optional[int] = None,
        close_in: Optional[int] = None,
        timezone: Optional[str] = None,
    ) -> str:
        """Update project details.

        Args:
            pk: Project ID (required)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            name: New project name
            description: New project description
            identifier: New project identifier
            project_lead: New project lead user ID
            default_assignee: New default assignee user ID
            icon_prop: Icon configuration JSON (optional)
            emoji: Emoji to represent the project (optional)
            cover_image: Cover image URL (optional)
            module_view: Enable/disable module view (optional)
            cycle_view: Enable/disable cycle view (optional)
            issue_views_view: Enable/disable issue views (optional)
            page_view: Enable/disable page view (optional)
            intake_view: Enable/disable intake view (optional)
            guest_view_all_features: Allow guests to view all features (optional)
            archive_in: Auto-archive issues after N days (optional)
            close_in: Auto-close issues after N days (optional)
            timezone: Timezone for the project (optional)
        """
        # Auto-fill workspace_slug from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        # Build update request object with non-None values only
        update_data: Dict[str, Any] = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if identifier is not None:
            update_data["identifier"] = identifier
        if project_lead is not None:
            update_data["project_lead"] = project_lead
        if default_assignee is not None:
            update_data["default_assignee"] = default_assignee
        if icon_prop is not None:
            update_data["icon_prop"] = icon_prop
        if emoji is not None:
            update_data["emoji"] = emoji
        if cover_image is not None:
            update_data["cover_image"] = cover_image
        if module_view is not None:
            update_data["module_view"] = module_view
        if cycle_view is not None:
            update_data["cycle_view"] = cycle_view
        if issue_views_view is not None:
            update_data["issue_views_view"] = issue_views_view
        if page_view is not None:
            update_data["page_view"] = page_view
        if intake_view is not None:
            update_data["intake_view"] = intake_view
        if guest_view_all_features is not None:
            update_data["guest_view_all_features"] = guest_view_all_features
        if archive_in is not None:
            update_data["archive_in"] = archive_in
        if close_in is not None:
            update_data["close_in"] = close_in
        if timezone is not None:
            update_data["timezone"] = timezone

        result = await method_executor.execute(
            "projects",
            "update",
            pk=pk,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_response_with_url("Successfully updated project", result["data"], "project", context)
        else:
            return PlaneToolBase.format_error_response("Failed to update project", result["error"])

    @tool
    async def projects_archive(project_id: str, workspace_slug: Optional[str] = None) -> str:
        """Archive a project.

        Args:
            project_id: Project ID (required)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill workspace_slug from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute("projects", "archive", project_id=project_id, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully archived project", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to archive project", result["error"])

    @tool
    async def projects_unarchive(project_id: str, workspace_slug: Optional[str] = None) -> str:
        """Restore an archived project.

        Args:
            project_id: Project ID (required)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill workspace_slug from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute("projects", "unarchive", project_id=project_id, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully unarchived project", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to unarchive project", result["error"])

    # Get entity search tools relevant only to projects
    from .entity_search import get_entity_search_tools

    entity_search_tools = get_entity_search_tools(method_executor, context)
    project_entity_search_tools = [
        t for t in entity_search_tools if getattr(t, "name", "").find("project") != -1 or getattr(t, "name", "").find("user") != -1
    ]

    return [projects_create, projects_list, projects_retrieve, projects_update, projects_archive, projects_unarchive] + project_entity_search_tools
