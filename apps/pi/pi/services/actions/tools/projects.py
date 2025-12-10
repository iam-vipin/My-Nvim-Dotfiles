"""
Projects API tools for Plane workspace operations.
"""

import re
from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from pi import logger
from pi.core.db import PlaneDBPool

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
        time_tracking_enabled: Optional[bool] = None,
        is_issue_type_enabled: Optional[bool] = None,
    ) -> Dict[str, Any]:
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
            time_tracking_enabled: Enable/disable time tracking, also called worklogs (optional)
            is_issue_type_enabled: Enable/disable issue type, also called workitem types (optional)
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
        if time_tracking_enabled is not None:
            payload["time_tracking_enabled"] = time_tracking_enabled
        if is_issue_type_enabled is not None:
            payload["is_issue_type_enabled"] = is_issue_type_enabled

        # Try to create project
        result = await method_executor.execute("projects", "create", **payload)

        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url(
                f"Successfully created project '{name}' with identifier '{base_identifier}'", result["data"], "project", context
            )
        else:
            # If failed due to identifier conflict, try with a different identifier
            if "already taken" in result.get("error", "") or "409" in result.get("error", ""):
                # Generate a new identifier with timestamp
                new_name, new_identifier = PlaneToolBase.generate_fallback_name_identifier(name, base_identifier)

                # Retry with new identifier (preserve other fields)
                payload["name"] = new_name
                payload["identifier"] = new_identifier
                retry_result = await method_executor.execute("projects", "create", **payload)

                if retry_result["success"]:
                    return await PlaneToolBase.format_success_payload_with_url(
                        f"Successfully created project '{new_name}' with identifier '{new_identifier}' (original '{name}' was taken)",
                        retry_result["data"],
                        "project",
                        context,
                    )
                else:
                    log.info(f"Failed to create project. Error: {retry_result["error"]}\nPayload: {payload}")
                    return PlaneToolBase.format_error_payload("Failed to create project even with alternative identifier", retry_result["error"])
            else:
                # Check if project was actually created despite the error (e.g. timeout)
                try:
                    # We need to check if the project exists in the DB with the same identifier and workspace_slug
                    query = """
                        SELECT p.id, p.name, p.identifier, p.workspace_id
                        FROM projects p
                        JOIN workspaces w ON p.workspace_id = w.id
                        WHERE p.identifier = $1 AND w.slug = $2 AND p.deleted_at IS NULL
                    """
                    row = await PlaneDBPool.fetchrow(query, (base_identifier, workspace_slug))
                    if row:
                        project_data = {
                            "id": str(row["id"]),
                            "name": row["name"],
                            "identifier": row["identifier"],
                            "workspace_id": str(row["workspace_id"]),
                            # Add workspace_slug for context
                            "workspace_slug": workspace_slug,
                        }
                        return await PlaneToolBase.format_success_payload_with_url(
                            f"Successfully created project '{name}' with identifier '{base_identifier}'",
                            project_data,
                            "project",
                            context,
                        )
                except Exception as e:
                    log.error(f"Failed to recover project creation from DB: {e}")

                log.info(f"Failed to create project. Error: {result["error"]}\nPayload: {payload}")
                return PlaneToolBase.format_error_payload("Failed to create project", result["error"])

    @tool
    async def projects_list(workspace_slug: Optional[str] = None, per_page: Optional[int] = 20, cursor: Optional[str] = None) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully retrieved projects list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list projects", result["error"])

    @tool
    async def projects_retrieve(project_id: str, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """Retrieve a single project by ID.

        Args:
            project_id: Project ID (required)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Lightweight validation to prevent bad calls and noisy 404s
        # - Reject placeholders like "<id of project: X>"
        # - Require a UUID-shaped project_id
        try:
            if "<id of" in project_id:
                return PlaneToolBase.format_error_payload(
                    "Invalid project_id: received a placeholder. Resolve a real UUID using search_project_by_name or search_project_by_identifier before calling projects_retrieve.",  # noqa E501
                    f"project_id={project_id}",
                )

            uuid_regex = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
            if not uuid_regex.match(project_id):
                return PlaneToolBase.format_error_payload(
                    "Invalid project_id format: expected UUID. Use search_project_by_name or search_project_by_identifier to resolve the UUID, then retry.",  # noqa E501
                    f"project_id={project_id}",
                )
        except Exception:
            # Best-effort validation; proceed if validation fails unexpectedly
            pass

        # Auto-fill workspace_slug from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        result = await method_executor.execute("projects", "retrieve", project_id=project_id, workspace_slug=workspace_slug)

        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved project", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve project", result["error"])

    @tool
    async def projects_update(
        project_id: str,
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
        is_time_tracking_enabled: Optional[bool] = None,
        is_issue_type_enabled: Optional[bool] = None,
        guest_view_all_features: Optional[bool] = None,
        archive_in: Optional[int] = None,
        close_in: Optional[int] = None,
        timezone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update project details.

        Args:
            project_id: Project ID (required)
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
            is_time_tracking_enabled: Enable/disable time tracking, also called worklogs (optional)
            is_issue_type_enabled: Enable/disable issue type, also called workitem types (optional)
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
        if is_time_tracking_enabled is not None:
            update_data["is_time_tracking_enabled"] = is_time_tracking_enabled
        if is_issue_type_enabled is not None:
            update_data["is_issue_type_enabled"] = is_issue_type_enabled
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
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url("Successfully updated project", result["data"], "project", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to update project", result["error"])

    @tool
    async def projects_archive(project_id: str, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully archived project", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to archive project", result["error"])

    @tool
    async def projects_unarchive(project_id: str, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
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
            return PlaneToolBase.format_success_payload("Successfully unarchived project", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to unarchive project", result["error"])

    return [
        projects_create,
        projects_list,
        projects_retrieve,
        projects_update,
        projects_archive,
        projects_unarchive,
    ]
