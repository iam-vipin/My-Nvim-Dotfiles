"""
Entity Search Tools for Plane
Provides search functionality for all major entities using database queries.
"""

import uuid
from typing import Optional

from langchain_core.tools import tool

from pi.core.db.plane import PlaneDBPool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing entity search helpers


def get_entity_search_tools(method_executor, context):
    """Return LangChain tools for entity search helpers using method_executor and context."""

    async def _normalize_project_id(project_id: Optional[str], workspace_slug: Optional[str]) -> Optional[str]:
        """Return UUID string for project_id; if an identifier is provided, resolve it using workspace scope."""
        if not project_id:
            return None
        try:
            uuid.UUID(str(project_id))
            return str(project_id)
        except Exception:
            query = """
                SELECT p.id
                FROM projects p
                JOIN workspaces w ON p.workspace_id = w.id
                WHERE p.identifier = $1 AND p.deleted_at IS NULL
                """
            params = [str(project_id)]
            if workspace_slug:
                query += " AND w.slug = $2"
                params.append(workspace_slug)
            query += " LIMIT 1"
            row = await PlaneDBPool.fetchrow(query, tuple(params))
            return str(row["id"]) if row else None

    @tool
    async def search_module_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """Search for a module by name and return its ID.

        Args:
            name: Module name to search for (required)
            project_id: Project ID to search within (optional, auto-filled from context)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = str(context["project_id"]) if context["project_id"] else None

        try:
            # Normalize project_id if an identifier like 'OGX' was passed
            project_id = await _normalize_project_id(project_id, workspace_slug)
            from pi.app.api.v1.helpers.plane_sql_queries import search_module_by_name

            result = await search_module_by_name(name, project_id, workspace_slug)

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found module '{name}'", {"id": result["id"], "name": result["name"], "project_id": result["project_id"]}
                )
            else:
                return PlaneToolBase.format_error_response(f"No module found with name '{name}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for module '{name}': {str(e)}", str(e))

    @tool
    async def list_member_projects(workspace_id: Optional[str] = None, user_id: Optional[str] = None, limit: Optional[int] = 50) -> str:
        """List active projects the current user is a member of (archived/deleted excluded).

        Args:
            workspace_id: Workspace UUID (auto-filled from context)
            user_id: Current user UUID (auto-filled from context)
            limit: Max number of projects to return (default 50)
        """
        # Auto-fill from context if not provided
        if workspace_id is None and "workspace_id" in context:
            workspace_id = context["workspace_id"]
        if user_id is None and "user_id" in context:
            user_id = context["user_id"]

        try:
            if not workspace_id or not user_id:
                return PlaneToolBase.format_error_response(
                    "Failed to list projects",
                    "Missing workspace_id/user_id in context",
                )

            # Membership-filtered, active (non-archived, non-deleted) projects only
            query = """
                SELECT p.id, p.name, p.identifier
                FROM projects p
                JOIN project_members pm ON p.id = pm.project_id
                WHERE p.workspace_id = $1
                AND pm.member_id = $2
                AND p.deleted_at IS NULL
                AND p.archived_at IS NULL
                AND pm.deleted_at IS NULL
                AND pm.is_active = true
                ORDER BY p.name
                LIMIT $3
            """
            rows = await PlaneDBPool.fetch(query, (workspace_id, user_id, int(limit or 50)))
            projects = [
                {
                    "id": str(r["id"]),
                    "name": r["name"],
                    "identifier": r.get("identifier"),
                    "type": "project",
                }
                for r in rows
            ]
            return PlaneToolBase.format_success_response("Successfully retrieved member projects", {"projects": projects, "count": len(projects)})
        except Exception as e:
            return PlaneToolBase.format_error_response("Failed to list member projects", str(e))

    @tool
    async def search_project_by_name(name: str, workspace_slug: Optional[str] = None) -> str:
        """Search for a project by name and return its ID and identifier.

        Args:
            name: Project name to search for (required)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_project_by_name

            result = await search_project_by_name(name, workspace_slug)

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found project '{name}'",
                    {"id": result["id"], "name": result["name"], "workspace_id": result["workspace_id"], "identifier": result.get("identifier")},
                )
            else:
                return PlaneToolBase.format_error_response(f"No project found with name '{name}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for project '{name}': {str(e)}", str(e))

    @tool
    async def search_project_by_identifier(identifier: str, workspace_slug: Optional[str] = None) -> str:
        """Search for a project by its identifier (e.g., 'HYDR', 'PARM') and return its UUID.

        CRITICAL: Project identifiers are short uppercase codes (like 'HYDR', 'PARM'), NOT UUIDs.
        This tool resolves the identifier to the actual project UUID that must be used in all API calls.

        Args:
            identifier: Project identifier to search for (required, e.g., 'HYDR', 'PARM')
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if "workspace_slug" in context and context.get("workspace_slug"):
            workspace_slug = context["workspace_slug"]

        try:
            from pi.core.db.plane import PlaneDBPool

            # Query to get project by identifier, optionally scoped to workspace
            query = """
            SELECT p.id, p.name, p.workspace_id, p.identifier
            FROM projects p
            JOIN workspaces w ON p.workspace_id = w.id
            WHERE p.identifier = $1
            AND p.deleted_at IS NULL
            """

            params = [identifier]

            if workspace_slug:
                query += " AND w.slug = $2"
                params.append(workspace_slug)

            query += " LIMIT 1"

            result = await PlaneDBPool.fetchrow(query, tuple(params))

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found project with identifier '{identifier}'",
                    {
                        "id": str(result["id"]),
                        "name": result["name"],
                        "identifier": result["identifier"],
                        "workspace_id": str(result["workspace_id"]),
                    },
                )
            else:
                return PlaneToolBase.format_error_response(f"No project found with identifier '{identifier}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for project '{identifier}': {str(e)}", str(e))

    @tool
    async def search_cycle_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """Search for a cycle by name and return its ID.

        Args:
            name: Cycle name to search for (required)
            project_id: Project ID to search within (optional, auto-filled from context)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if "workspace_slug" in context and context.get("workspace_slug"):
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = str(context["project_id"]) if context["project_id"] else None

        try:
            # Normalize project_id if an identifier like 'OGX' was passed
            project_id = await _normalize_project_id(project_id, workspace_slug)
            from pi.app.api.v1.helpers.plane_sql_queries import search_cycle_by_name

            result = await search_cycle_by_name(name, project_id, workspace_slug)

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found cycle '{name}'", {"id": result["id"], "name": result["name"], "project_id": result["project_id"]}
                )
            else:
                return PlaneToolBase.format_error_response(f"No cycle found with name '{name}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for cycle '{name}': {str(e)}", str(e))

    @tool
    async def search_label_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """Search for a label by name and return its ID.

        Args:
            name: Label name to search for (required)
            project_id: Project ID to search within (optional, auto-filled from context)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = str(context["project_id"]) if context["project_id"] else None

        try:
            # Normalize project_id if an identifier like 'OGX' was passed
            project_id = await _normalize_project_id(project_id, workspace_slug)
            from pi.app.api.v1.helpers.plane_sql_queries import search_label_by_name

            result = await search_label_by_name(name, project_id, workspace_slug)

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found label '{name}'", {"id": result["id"], "name": result["name"], "project_id": result["project_id"]}
                )
            else:
                return PlaneToolBase.format_error_response(f"No label found with name '{name}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for label '{name}': {str(e)}", str(e))

    @tool
    async def search_state_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """Search for a state by name and return its ID.

        Args:
            name: State name to search for (required)
            project_id: Project ID to search within (optional, auto-filled from context)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = str(context["project_id"]) if context["project_id"] else None

        try:
            # Normalize project_id if an identifier like 'OGX' was passed
            project_id = await _normalize_project_id(project_id, workspace_slug)
            from pi.app.api.v1.helpers.plane_sql_queries import search_state_by_name

            result = await search_state_by_name(name, project_id, workspace_slug)

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found state '{name}'", {"id": result["id"], "name": result["name"], "project_id": result["project_id"]}
                )
            else:
                return PlaneToolBase.format_error_response(f"No state found with name '{name}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for state '{name}': {str(e)}", str(e))

    @tool
    async def search_user_by_name(display_name: str, workspace_slug: Optional[str] = None) -> str:
        """Search for a user by display name and return their ID.

        Args:
            display_name: User display name to search for (required)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_user_by_name

            result = await search_user_by_name(display_name, workspace_slug)

            if result:
                # Return all matching users with clear structure for LLM
                users_data = {
                    "total_matches": len(result),
                    "users": [
                        {
                            "id": user["id"],
                            "display_name": user["display_name"],
                            "first_name": user["first_name"],
                            "last_name": user["last_name"],
                            "email": user["email"],
                        }
                        for user in result
                    ],
                }

                # Make multiple matches explicit for LLM to trigger clarification
                if len(result) > 1:
                    message = (
                        f"MULTIPLE MATCHES: Found {len(result)} users matching '{display_name}'. Clarification needed to select the correct user."
                    )
                else:
                    message = f"Found 1 user matching '{display_name}'"

                return PlaneToolBase.format_success_response(message, users_data)
            else:
                return PlaneToolBase.format_error_response(f"No user found with display name '{display_name}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for user '{display_name}': {str(e)}", str(e))

    @tool
    async def search_workitem_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> str:
        """Search for a work item by name and return its ID.

        Args:
            name: Work item name to search for (required)
            project_id: Project ID to search within (optional, auto-filled from context)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = str(context["project_id"]) if context["project_id"] else None

        try:
            # Normalize project_id if an identifier like 'OGX' was passed
            project_id = await _normalize_project_id(project_id, workspace_slug)
            from pi.app.api.v1.helpers.plane_sql_queries import search_workitem_by_name

            result = await search_workitem_by_name(name, project_id, workspace_slug)

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found work item '{name}'", {"id": result["id"], "name": result["name"], "project_id": result["project_id"]}
                )
            else:
                return PlaneToolBase.format_error_response(f"No work item found with name '{name}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for work item '{name}': {str(e)}", str(e))

    @tool
    async def search_workitem_by_identifier(identifier: str, workspace_slug: Optional[str] = None) -> str:
        """Search for a work item by its unique identifier (e.g., 'WEB-821') and return its details.
        Don't call this tool if the 'identifier' string is not in the format 'PROJECT-SEQUENCE'.

        Args:
            identifier: Work item identifier to search for (required, e.g., 'WEB-821')
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]

        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_workitem_by_identifier

            result = await search_workitem_by_identifier(identifier, workspace_slug)

            if result:
                return PlaneToolBase.format_success_response(
                    f"Found work item '{identifier}'",
                    {
                        "id": result["id"],
                        "name": result["name"],
                        "project_id": result["project_id"],
                        "project_identifier": result["project_identifier"],
                        "sequence_id": result["sequence_id"],
                        "identifier": identifier,
                        "state_id": result.get("state_id"),
                        "priority": result.get("priority"),
                        "workspace_id": result["workspace_id"],
                    },
                )
            else:
                return PlaneToolBase.format_error_response(f"No work item found with identifier '{identifier}'", "Not found")

        except Exception as e:
            return PlaneToolBase.format_error_response(f"Error searching for work item '{identifier}': {str(e)}", str(e))

    return [
        list_member_projects,
        search_module_by_name,
        search_project_by_name,
        search_project_by_identifier,
        search_cycle_by_name,
        search_label_by_name,
        search_state_by_name,
        search_user_by_name,
        search_workitem_by_name,
        search_workitem_by_identifier,
    ]
