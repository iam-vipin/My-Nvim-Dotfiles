from datetime import datetime
from typing import Any
from typing import Dict
from typing import List
from typing import Optional
from typing import Tuple

from pi import logger
from pi.core.db.plane import PlaneDBPool

log = logger.getChild("helpers.db_queries")


async def get_issue_details(issue_id: str) -> Optional[Dict[str, Any]]:
    query = """
    SELECT id, name, description_html
    FROM issues
    WHERE id = $1 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (issue_id,))
        return result
    except Exception as e:
        log.error(f"Error fetching issue details for {issue_id}: {e}")
        return None


async def get_user_current_time(user_id: str) -> Optional[Dict[str, str]]:
    """
    Fetch the current time in the user's timezone.

    Returns:
        Dict with 'timezone' and 'current_time' keys, or None if user not found or timezone invalid
    """
    query = """
    SELECT user_timezone
    FROM users
    WHERE id = $1
    """
    try:
        result = await PlaneDBPool.fetchrow(query, (user_id,))
        if not result or not result["user_timezone"]:
            return None

        user_timezone = result["user_timezone"]

        # Validate timezone and get current time
        try:
            # Try to use zoneinfo (Python 3.9+)
            try:
                from zoneinfo import ZoneInfo

                tz = ZoneInfo(user_timezone)
            except ImportError:
                # Fallback to pytz for older Python versions
                try:
                    import pytz  # type: ignore[import-untyped]

                    tz = pytz.timezone(user_timezone)
                except ImportError:
                    log.error("Neither zoneinfo nor pytz available for timezone handling")
                    return None

            current_time = datetime.now(tz)

            return {
                "timezone": user_timezone,
                "current_time": current_time.strftime("%Y-%m-%d %H:%M:%S %Z"),
                "current_time_iso": current_time.isoformat(),
                "current_time_readable": current_time.strftime("%A, %B %d, %Y at %I:%M %p %Z"),
            }
        except Exception as tz_error:
            log.warning(f"Invalid timezone '{user_timezone}' for user {user_id}: {tz_error}")
            return None

    except Exception as e:
        log.error(f"Error fetching user timezone for {user_id}: {e}")
        return None


async def get_user_timezone_context_for_prompt(user_id: str) -> str:
    """
    Get user timezone context formatted for LLM prompts.

    Returns a formatted string with current time information for use in prompts.
    """
    time_info = await get_user_current_time(user_id)
    if not time_info:
        return "User timezone information is not available."

    return f"""Current time for user: {time_info["current_time_readable"]}
Timezone: {time_info["timezone"]}
"""


async def get_issue_identifier_for_artifact(issue_id: str) -> Optional[Dict[str, Any]]:
    """Lightweight fetch for work-item identifier pieces.

    Returns project_identifier, sequence_id, identifier, project_id, and name for the issue.
    """
    query = """
    SELECT
        p.identifier AS project_identifier,
        i.sequence_id::text AS sequence_id,
        p.identifier || '-' || i.sequence_id::text AS identifier,
        i.project_id,
        i.name
    FROM issues i
    JOIN projects p ON p.id = i.project_id AND p.deleted_at IS NULL
    WHERE i.id = $1 AND i.deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (issue_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching lightweight issue identifier for {issue_id}: {e}")
        return None


async def get_issue_assignees(issue_id: str) -> List[Dict[str, Any]]:
    query = """
    SELECT u.id, u.username, u.email
    FROM issue_assignees ia
    JOIN users u ON ia.assignee_id = u.id
    WHERE ia.issue_id = $1 AND ia.deleted_at IS NULL
    """

    try:
        return await PlaneDBPool.fetch(query, (issue_id,))
    except Exception as e:
        log.error(f"Error fetching assignees for issue {issue_id}: {e}")
        return []


async def get_mentioned_users(user_ids: List[str]) -> List[Dict[str, Any]]:
    if not user_ids:
        return []

    placeholders = ", ".join([f"${i + 1}" for i in range(len(user_ids))])
    query = f"""
    SELECT id, username, email
    FROM users
    WHERE id IN ({placeholders})
    """

    try:
        return await PlaneDBPool.fetch(query, tuple(user_ids))
    except Exception as e:
        log.error(f"Error fetching mentioned users {user_ids}: {e}")
        return []


async def get_workspace_slug(workspace_id: str) -> Optional[str]:
    query = """
    SELECT slug
    FROM workspaces
    WHERE id = $1
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (workspace_id,))
        return result["slug"] if result else None
    except Exception as e:
        log.error(f"Error fetching workspace slug for {workspace_id}: {e}")
        return None


async def resolve_workspace_id_from_project_id(project_id: str) -> Optional[str]:
    """
    Resolve workspace_id from project_id.

    Returns:
        workspace_id
    """
    query = """
    SELECT p.workspace_id
    FROM projects p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.id = $1
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (project_id,))
        if result:
            return str(result["workspace_id"])  # Convert UUID object to string
        return None
    except Exception as e:
        log.error(f"Error resolving workspace from project_id {project_id}: {e}")
        return None


async def get_issue_comments(issue_id: str) -> List[Dict[str, Any]]:
    query = """
    SELECT ic.id, ic.comment_html, ic.created_at, u.display_name, u.id as user_id
    FROM issue_comments ic
    JOIN users u ON ic.actor_id = u.id
    WHERE ic.issue_id = $1 AND ic.deleted_at IS NULL
    ORDER BY ic.created_at ASC
    """

    try:
        return await PlaneDBPool.fetch(query, (issue_id,))
    except Exception as e:
        log.error(f"Error fetching comments for issue {issue_id}: {e}")
        return []


async def get_agent_ids(workspace_id: str, source: str) -> Optional[Tuple[str, str]]:
    query = """
    SELECT connection_id, target_identifier
    FROM workspace_connections
    WHERE workspace_id = $1 AND connection_type = $2 AND deleted_at IS NULL
    LIMIT 1
    """

    try:
        result = await PlaneDBPool.fetchrow(
            query,
            (
                workspace_id,
                source,
            ),
        )
        if result:
            return result["connection_id"], result["target_identifier"]
        else:
            return None
    except Exception as e:
        log.error(f"Error fetching application id for {source} in workspace {workspace_id}: {e}")
        return None


# New functions for resolving IDs to names
async def get_project_name(project_id: str) -> Optional[str]:
    """Get project name from project ID."""
    query = """
    SELECT name
    FROM projects
    WHERE id = $1 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (project_id,))
        return result["name"] if result else None
    except Exception as e:
        log.error(f"Error fetching project name for {project_id}: {e}")
        return None


async def get_module_name(module_id: str) -> Optional[str]:
    """Get module name from module ID."""
    query = """
    SELECT name
    FROM modules
    WHERE id = $1 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (module_id,))
        return result["name"] if result else None
    except Exception as e:
        log.error(f"Error fetching module name for {module_id}: {e}")
        return None


async def get_cycle_name(cycle_id: str) -> Optional[str]:
    """Get cycle name from cycle ID."""
    query = """
    SELECT name
    FROM cycles
    WHERE id = $1 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (cycle_id,))
        return result["name"] if result else None
    except Exception as e:
        log.error(f"Error fetching cycle name for {cycle_id}: {e}")
        return None


async def get_state_name(state_id: str) -> Optional[str]:
    """Get state name from state ID."""
    query = """
    SELECT name
    FROM states
    WHERE id = $1 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (state_id,))
        return result["name"] if result else None
    except Exception as e:
        log.error(f"Error fetching state name for {state_id}: {e}")
        return None


async def get_state_details_by_id(state_id: str) -> Optional[Dict[str, Any]]:
    """Get full state details including group from state ID."""
    query = """
    SELECT id, name, "group", project_id
    FROM states
    WHERE id = $1 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (state_id,))
        if result:
            return {"id": str(result["id"]), "name": result["name"], "group": result["group"], "project_id": str(result["project_id"])}
        return None
    except Exception as e:
        log.error(f"Error fetching state details for {state_id}: {e}")
        return None


async def get_label_name(label_id: str) -> Optional[str]:
    """Get label name from label ID."""
    query = """
    SELECT name
    FROM labels
    WHERE id = $1 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (label_id,))
        return result["name"] if result else None
    except Exception as e:
        log.error(f"Error fetching label name for {label_id}: {e}")
        return None


async def get_user_name(user_id: str) -> Optional[str]:
    """Get user display name from user ID."""
    query = """
    SELECT display_name
    FROM users
    WHERE id = $1
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (user_id,))
        return result["display_name"] if result else None
    except Exception as e:
        log.error(f"Error fetching user name for {user_id}: {e}")
        return None


async def get_workspace_name(workspace_id: str) -> Optional[str]:
    """Get workspace name from workspace ID."""
    query = """
    SELECT name
    FROM workspaces
    WHERE id = $1
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (workspace_id,))
        return result["name"] if result else None
    except Exception as e:
        log.error(f"Error fetching workspace name for {workspace_id}: {e}")
        return None


async def get_project_id_from_identifier(identifier: str, workspace_id: str) -> Optional[str]:
    """
    Get project ID from project identifier and workspace ID.

    Args:
        identifier: Project identifier (e.g., 'HYDR', 'PARM')
        workspace_id: Workspace ID

    Returns:
        Project ID (UUID string) or None if not found
    """
    query = """
    SELECT id
    FROM projects
    WHERE identifier = $1 AND workspace_id = $2 AND deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (identifier, workspace_id))
        if result:
            return str(result["id"])  # Convert UUID object to string
        return None
    except Exception as e:
        log.error(f"Error fetching project ID for identifier {identifier} in workspace {workspace_id}: {e}")
        return None


async def resolve_id_to_name(entity_type: str, entity_id: str) -> Optional[str]:
    """
    Generic function to resolve any entity ID to its name.

    Args:
        entity_type: Type of entity (project, module, cycle, state, label, user, workspace)
        entity_id: The entity ID to resolve

    Returns:
        The entity name or None if not found
    """
    if not entity_id:
        return None

    # Map entity types to their resolver functions
    resolvers = {
        "project": get_project_name,
        "project_id": get_project_name,
        "module": get_module_name,
        "module_id": get_module_name,
        "cycle": get_cycle_name,
        "cycle_id": get_cycle_name,
        "state": get_state_name,
        "state_id": get_state_name,
        "label": get_label_name,
        "label_id": get_label_name,
        "user": get_user_name,
        "user_id": get_user_name,
        "assignee": get_user_name,
        "assignee_id": get_user_name,
        "workspace": get_workspace_name,
        "workspace_id": get_workspace_name,
    }

    resolver = resolvers.get(entity_type.lower())
    if resolver:
        return await resolver(entity_id)

    return None


# Entity search functions for finding IDs by name
async def search_module_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Search for a module by name and return its details."""
    query = """
    SELECT m.id, m.name, m.project_id
    FROM modules m
    JOIN projects p ON m.project_id = p.id
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE m.name ILIKE $1
    AND m.deleted_at IS NULL
    """

    params = [f"%{name}%"]

    if project_id:
        query += " AND m.project_id = $2"
        params.append(project_id)

    if workspace_slug:
        query += " AND w.slug = $3"
        params.append(workspace_slug)

    query += " LIMIT 20"

    try:
        result = await PlaneDBPool.fetchrow(query, tuple(params))
        if result:
            return {"id": str(result["id"]), "name": result["name"], "project_id": str(result["project_id"])}
        return None
    except Exception as e:
        log.error(f"Error searching for module '{name}': {e}, query: {query}, project_id: {project_id}, workspace_slug: {workspace_slug}")
        return None


async def search_project_by_name(name: str, workspace_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Search for a project by name and return its details."""
    query = """
    SELECT p.id, p.name, p.workspace_id, p.identifier
    FROM projects p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.name ILIKE $1
    AND p.deleted_at IS NULL
    """

    params = [f"%{name}%"]

    if workspace_slug:
        query += " AND w.slug = $2"
        params.append(workspace_slug)

    query += " LIMIT 20"

    try:
        result = await PlaneDBPool.fetchrow(query, tuple(params))
        if result:
            return {
                "id": str(result["id"]),
                "name": result["name"],
                "workspace_id": str(result["workspace_id"]),
                "identifier": result["identifier"],
            }
        return None
    except Exception as e:
        log.error(f"Error searching for project '{name}': {e}, query: {query}, workspace_slug: {workspace_slug}")
        return None


async def search_cycle_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Search for a cycle by name and return its details."""
    query = """
    SELECT c.id, c.name, c.project_id
    FROM cycles c
    JOIN projects p ON c.project_id = p.id
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE c.name ILIKE $1
    AND c.deleted_at IS NULL
    """

    params = [f"%{name}%"]
    param_index = 2

    if project_id:
        query += f" AND c.project_id = ${param_index}"
        params.append(project_id)
        param_index += 1

    if workspace_slug:
        query += f" AND w.slug = ${param_index}"
        params.append(workspace_slug)
        param_index += 1

    query += " LIMIT 20"

    try:
        result = await PlaneDBPool.fetchrow(query, tuple(params))
        if result:
            return {"id": str(result["id"]), "name": result["name"], "project_id": str(result["project_id"])}
        return None
    except Exception as e:
        log.error(f"Error searching for cycle '{name}': {e}, query: {query}, project_id: {project_id}, workspace_slug: {workspace_slug}")
        return None


async def search_label_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Search for a label by name and return its details."""
    query = """
    SELECT l.id, l.name, l.project_id, l.color
    FROM labels l
    JOIN projects p ON l.project_id = p.id
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE l.name ILIKE $1
    AND l.deleted_at IS NULL
    """

    params = [f"%{name}%"]

    if project_id:
        query += " AND l.project_id = $2"
        params.append(project_id)

    if workspace_slug:
        query += " AND w.slug = $3"
        params.append(workspace_slug)

    query += " LIMIT 20"

    try:
        result = await PlaneDBPool.fetchrow(query, tuple(params))
        if result:
            return {"id": str(result["id"]), "name": result["name"], "color": result.get("color"), "project_id": str(result["project_id"])}
        return None
    except Exception as e:
        log.error(f"Error searching for label '{name}': {e}, query: {query}, project_id: {project_id}, workspace_slug: {workspace_slug}")
        return None


async def search_state_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Search for a state by name and return its details."""
    query = """
    SELECT s.id, s.name, s.project_id, s."group"
    FROM states s
    JOIN projects p ON s.project_id = p.id
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE s.name ILIKE $1
    AND s.deleted_at IS NULL
    """

    params = [f"%{name}%"]

    if project_id:
        query += " AND s.project_id = $2"
        params.append(project_id)

    if workspace_slug:
        query += " AND w.slug = $3"
        params.append(workspace_slug)

    query += " LIMIT 20"

    try:
        result = await PlaneDBPool.fetchrow(query, tuple(params))
        if result:
            return {"id": str(result["id"]), "name": result["name"], "group": result["group"], "project_id": str(result["project_id"])}
        return None
    except Exception as e:
        log.error(f"Error searching for state '{name}': {e}, query: {query}, project_id: {project_id}, workspace_slug: {workspace_slug}")
        return None


async def search_user_by_name(display_name: str, workspace_slug: Optional[str] = None) -> List[Dict[str, Any]]:
    """Search for users by display name and return their details (up to 20)."""
    query = """
    SELECT u.id, u.display_name, u.first_name, u.last_name, u.email
    FROM users u
    JOIN workspace_members wm ON u.id = wm.member_id
    JOIN workspaces w ON wm.workspace_id = w.id
    WHERE (u.display_name ILIKE $1 OR u.first_name ILIKE $1)
      AND wm.deleted_at IS NULL
    """

    params = [f"%{display_name}%"]

    if workspace_slug:
        query += " AND w.slug = $2"
        params.append(workspace_slug)

    query += " LIMIT 20"

    try:
        rows = await PlaneDBPool.fetch(query, tuple(params))  # returns List[Dict[str,Any]]
        # Convert UUIDs to strings and leave other values as-is
        return [
            {
                "id": str(r["id"]),
                "display_name": r["display_name"],
                "first_name": r["first_name"],
                "last_name": r["last_name"],
                "email": r["email"],
            }
            for r in rows
        ]
    except Exception as e:
        log.error(f"Error searching for user '{display_name}': {e}, query: {query}, workspace_slug: {workspace_slug}")
        return []


async def search_workitem_by_name(name: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Search for a work item by name and return its details."""
    query = """
    SELECT i.id, i.name, i.project_id
    FROM issues i
    JOIN projects p ON i.project_id = p.id
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE i.name ILIKE $1
    AND i.deleted_at IS NULL
    """

    params = [f"%{name}%"]

    # Dynamically assign parameter positions based on which optional filters are present
    next_param_index = 2
    if project_id:
        query += f" AND i.project_id = ${next_param_index}"
        params.append(project_id)
        next_param_index += 1

    if workspace_slug:
        query += f" AND w.slug = ${next_param_index}"
        params.append(workspace_slug)

    query += " LIMIT 20"

    try:
        result = await PlaneDBPool.fetchrow(query, tuple(params))
        if result:
            return {"id": str(result["id"]), "name": result["name"], "project_id": str(result["project_id"])}
        return None
    except Exception as e:
        log.error(f"Error searching for work item '{name}': {e}, query: {query}, project_id: {project_id}, workspace_slug: {workspace_slug}")
        return None


async def get_pro_business_workspaces() -> List[str]:
    """
    Get all Pro/Business workspace IDs from the Plane database.

    Simple logic: Just check if plan = PRO/BUSINESS (ignore is_cancelled since
    plan changes happen at the end of subscription period).

    Returns:
        List of workspace IDs (as strings) that have Pro/Business plans
    """
    query = """
    SELECT DISTINCT workspace_id::text as workspace_id
    FROM workspace_licenses
    WHERE UPPER(plan) IN ('PRO', 'BUSINESS')
    ORDER BY workspace_id
    """

    try:
        results = await PlaneDBPool.fetch(query)
        workspace_ids = [row["workspace_id"] for row in results]
        return workspace_ids
    except Exception as e:
        log.error(f"Error fetching Pro/Business workspaces: {e}")
        return []


async def check_workspace_plan(workspace_id: str) -> Optional[str]:
    """
    Check the current plan for a specific workspace.

    Args:
        workspace_id: Workspace ID to check

    Returns:
        Plan name (PRO, BUSINESS, FREE, etc.) or None if not found
    """
    query = """
    SELECT UPPER(plan) as plan
    FROM workspace_licenses
    WHERE workspace_id = $1
    LIMIT 1
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (workspace_id,))
        return result["plan"] if result else None
    except Exception as e:
        log.error(f"Error checking plan for workspace {workspace_id}: {e}")
        return None


async def get_workspace_plans_batch(workspace_ids: List[str]) -> Dict[str, str]:
    """
    Get current plans for multiple workspaces in a single query.

    Args:
        workspace_ids: List of workspace IDs to check

    Returns:
        Dictionary mapping workspace_id -> plan name
    """
    if not workspace_ids:
        return {}

    placeholders = ", ".join([f"${i + 1}" for i in range(len(workspace_ids))])
    query = f"""
    SELECT workspace_id::text as workspace_id, UPPER(plan) as plan
    FROM workspace_licenses
    WHERE workspace_id IN ({placeholders})
    """

    try:
        results = await PlaneDBPool.fetch(query, tuple(workspace_ids))
        return {row["workspace_id"]: row["plan"] for row in results}
    except Exception as e:
        log.error(f"Error fetching workspace plans for {len(workspace_ids)} workspaces: {e}")
        return {}


async def search_workitem_by_identifier(identifier: str, workspace_slug: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Search for a work item by its unique identifier (e.g., 'WEB-821').

    Args:
        identifier: The unique identifier in format 'PROJECT-SEQUENCE' (e.g., 'WEB-821')
        workspace_slug: Optional workspace slug for filtering

    Returns:
        Dictionary with work item details or None if not found
    """
    try:
        # Parse the identifier (e.g., 'WEB-821' -> project_identifier='WEB', sequence_id=821)
        if "-" not in identifier:
            log.error(f"Invalid identifier format '{identifier}'. Expected format: 'PROJECT-SEQUENCE'")
            return None

        project_identifier, sequence_str = identifier.split("-", 1)

        try:
            sequence_id = int(sequence_str)
        except ValueError:
            log.error(f"Invalid sequence number '{sequence_str}' in identifier '{identifier}'")
            return None

        # Build the query with workspace filtering if provided
        workspace_filter = ""
        params = [project_identifier, sequence_id]

        if workspace_slug:
            workspace_filter = "AND w.slug = $3"
            params.append(workspace_slug)

        query = f"""
        SELECT
            i.id,
            i.name,
            i.project_id,
            p.identifier as project_identifier,
            i.sequence_id,
            i.state_id,
            i.priority,
            i.workspace_id,
            i.created_at,
            i.updated_at,
            i.description_stripped,
            i.start_date,
            i.target_date,
            i.completed_at,
            i.point,
            i.is_draft,
            i.archived_at
        FROM issues i
        JOIN projects p ON i.project_id = p.id
        JOIN workspaces w ON i.workspace_id = w.id
        WHERE p.identifier = $1
        AND i.sequence_id = $2
        AND i.deleted_at IS NULL
        AND p.deleted_at IS NULL
        {workspace_filter}
        LIMIT 1
        """

        result = await PlaneDBPool.fetchrow(query, tuple(params))

        if result:
            log.info(f"Found work item with identifier '{identifier}': {result["name"]}")
            return dict(result)
        else:
            log.info(f"No work item found with identifier '{identifier}'")
            return None

    except Exception as e:
        log.error(f"Error searching for work item '{identifier}': {e}")
        return None


async def get_workitem_details_for_artifact(workitem_id: str) -> Optional[Dict[str, Any]]:
    """
    Get work item details for artifact generation.

    Args:
        workitem_id: The ID of the work item to fetch details for

    Returns:
        Dictionary with work item details or None if not found
    """
    query = """
    SELECT
        i.id,
        i.name,
        i.description_stripped AS description,
        i.priority,
        i.start_date,
        i.target_date,
        i.project_id,
        p.name AS project_name,
        p.identifier || '-' || i.sequence_id::text AS identifier,
        ist.name AS state,
        i.state_id,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT c.id ORDER BY c.id), NULL::uuid)
            FROM cycle_issues ci
            JOIN cycles c ON ci.cycle_id = c.id AND c.deleted_at IS NULL
            WHERE ci.issue_id = i.id AND ci.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS cycle_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT c.name ORDER BY c.name), NULL::text)
            FROM cycle_issues ci
            JOIN cycles c ON ci.cycle_id = c.id AND c.deleted_at IS NULL
            WHERE ci.issue_id = i.id AND ci.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS cycles,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT m.id ORDER BY m.id), NULL::uuid)
            FROM module_issues mi
            JOIN modules m ON mi.module_id = m.id AND m.deleted_at IS NULL
            WHERE mi.issue_id = i.id AND mi.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS module_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT m.name ORDER BY m.name), NULL::text)
            FROM module_issues mi
            JOIN modules m ON mi.module_id = m.id AND m.deleted_at IS NULL
            WHERE mi.issue_id = i.id AND mi.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS modules,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT u.id ORDER BY u.id), NULL::uuid)
            FROM issue_assignees ia
            JOIN users u ON ia.assignee_id = u.id AND u.is_active = true AND u.is_bot = false
            WHERE ia.issue_id = i.id AND ia.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS assignee_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT u.display_name ORDER BY u.display_name), NULL::text)
            FROM issue_assignees ia
            JOIN users u ON ia.assignee_id = u.id AND u.is_active = true AND u.is_bot = false
            WHERE ia.issue_id = i.id AND ia.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS assignees,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT l.id ORDER BY l.id), NULL::uuid)
            FROM issue_labels il
            JOIN labels l ON il.label_id = l.id AND l.deleted_at IS NULL
            WHERE il.issue_id = i.id AND il.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS label_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT l.name ORDER BY l.name), NULL::text)
            FROM issue_labels il
            JOIN labels l ON il.label_id = l.id AND l.deleted_at IS NULL
            WHERE il.issue_id = i.id AND il.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS labels,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT l.color ORDER BY l.color), NULL::text)
            FROM issue_labels il
            JOIN labels l ON il.label_id = l.id AND l.deleted_at IS NULL
            WHERE il.issue_id = i.id AND il.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS label_colors,
        parent_i.name AS parent,
        i.parent_id
    FROM issues i
    LEFT JOIN projects p ON i.project_id = p.id AND p.deleted_at IS NULL
    LEFT JOIN states ist ON i.state_id = ist.id AND ist.deleted_at IS NULL
    LEFT JOIN issues parent_i ON i.parent_id = parent_i.id AND parent_i.deleted_at IS NULL
    WHERE i.id = $1
    AND i.deleted_at IS NULL;
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (workitem_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching workitem details for {workitem_id}: {e}")
        return None


async def get_project_details_for_artifact(project_id: str) -> Optional[Dict[str, Any]]:
    """
    Get project details for artifact generation.

    Args:
        project_id: The ID of the project to fetch details for

    Returns:
        Dictionary with project details or None if not found
    """
    query = """
    SELECT
        p.id,
        p.name,
        p.description,
        p.identifier,
        pa.priority,
        pa.start_date,
        pa.target_date,
        ps.name AS state,
        u.display_name AS lead,
        p.project_lead_id,
        array_remove(array_agg(DISTINCT u2.id) FILTER (WHERE u2.id IS NOT NULL), NULL) AS member_ids,
        array_remove(array_agg(DISTINCT u2.display_name) FILTER (WHERE u2.display_name IS NOT NULL), NULL) AS members
    FROM projects p
    LEFT JOIN project_attributes pa ON p.id = pa.project_id
    LEFT JOIN project_states ps ON pa.state_id = ps.id AND ps.deleted_at IS NULL
    LEFT JOIN users u ON p.project_lead_id = u.id
                    AND u.is_active = true
                    AND u.is_bot = false
    LEFT JOIN project_members pm ON p.id = pm.project_id
                                AND pm.deleted_at IS NULL
                                AND pm.is_active = true
    LEFT JOIN users u2 ON pm.member_id = u2.id
                    AND u2.is_active = true
                    AND u2.is_bot = false
    WHERE
        p.id = $1
        AND p.deleted_at IS NULL
    GROUP BY
        p.id, pa.priority, pa.start_date, pa.target_date, ps.name, u.display_name;
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (project_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching project details for {project_id}: {e}")
        return None


async def get_cycle_details_for_artifact(cycle_id: str) -> Optional[Dict[str, Any]]:
    """
    Get cycle details for artifact generation.

    Args:
        cycle_id: The ID of the cycle to fetch details for

    Returns:
        Dictionary with cycle details or None if not found
    """
    query = """
    SELECT
        c.id,
        c.name,
        c.description,
        c.start_date,
        c.end_date,
        c.project_id,
        p.name AS project
    FROM cycles c
    LEFT JOIN projects p ON c.project_id = p.id AND p.deleted_at IS NULL
    WHERE
        c.id = $1
        AND c.deleted_at IS NULL;
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (cycle_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching cycle details for {cycle_id}: {e}")
        return None


async def get_module_details_for_artifact(module_id: str) -> Optional[Dict[str, Any]]:
    """
    Get module details for artifact generation.

    Args:
        module_id: The ID of the module to fetch details for

    Returns:
        Dictionary with module details or None if not found
    """
    query = """
    SELECT
        m.id,
        m.name,
        m.description,
        m.start_date,
        m.target_date,
        m.status,
        m.project_id,
        p.name AS project,
        u.display_name AS lead,
        array_remove(array_agg(DISTINCT u2.id) FILTER (WHERE u2.id IS NOT NULL), NULL) AS member_ids,
        array_remove(array_agg(DISTINCT u2.display_name) FILTER (WHERE u2.display_name IS NOT NULL), NULL) AS members
    FROM modules m
    LEFT JOIN projects p ON m.project_id = p.id AND p.deleted_at IS NULL
    LEFT JOIN users u ON m.lead_id = u.id AND u.is_active = true AND u.is_bot = false
    LEFT JOIN module_members mm ON m.id = mm.module_id AND mm.deleted_at IS NULL
    LEFT JOIN users u2 ON mm.member_id = u2.id AND u2.is_active = true AND u2.is_bot = false
    WHERE
        m.id = $1
        AND m.deleted_at IS NULL
    GROUP BY
        m.id, m.name, m.description, m.start_date, m.target_date, m.status, m.project_id, p.name, u.display_name;
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (module_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching module details for {module_id}: {e}")
        return None


async def get_comment_details_for_artifact(comment_id: str) -> Optional[Dict[str, Any]]:
    """
    Get comment details for artifact generation.

    Args:
        comment_id: The ID of the comment to fetch details for

    Returns:
        Dictionary with comment details or None if not found
    """
    query = """
    SELECT
        i.id,
        i.name,
        i.description_stripped AS description,
        i.priority,
        i.start_date,
        i.target_date,
        i.project_id,
        p.name AS project_name,
        p.identifier || '-' || i.sequence_id::text AS identifier,
        ist.name AS state,
        i.state_id,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT c.id ORDER BY c.id), NULL::uuid)
            FROM cycle_issues ci
            JOIN cycles c ON ci.cycle_id = c.id AND c.deleted_at IS NULL
            WHERE ci.issue_id = i.id AND ci.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS cycle_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT c.name ORDER BY c.name), NULL::text)
            FROM cycle_issues ci
            JOIN cycles c ON ci.cycle_id = c.id AND c.deleted_at IS NULL
            WHERE ci.issue_id = i.id AND ci.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS cycles,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT m.id ORDER BY m.id), NULL::uuid)
            FROM module_issues mi
            JOIN modules m ON mi.module_id = m.id AND m.deleted_at IS NULL
            WHERE mi.issue_id = i.id AND mi.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS module_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT m.name ORDER BY m.name), NULL::text)
            FROM module_issues mi
            JOIN modules m ON mi.module_id = m.id AND m.deleted_at IS NULL
            WHERE mi.issue_id = i.id AND mi.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS modules,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT u.id ORDER BY u.id), NULL::uuid)
            FROM issue_assignees ia
            JOIN users u ON ia.assignee_id = u.id AND u.is_active = true AND u.is_bot = false
            WHERE ia.issue_id = i.id AND ia.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS assignee_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT u.display_name ORDER BY u.display_name), NULL::text)
            FROM issue_assignees ia
            JOIN users u ON ia.assignee_id = u.id AND u.is_active = true AND u.is_bot = false
            WHERE ia.issue_id = i.id AND ia.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS assignees,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT l.id ORDER BY l.id), NULL::uuid)
            FROM issue_labels il
            JOIN labels l ON il.label_id = l.id AND l.deleted_at IS NULL
            WHERE il.issue_id = i.id AND il.deleted_at IS NULL
        ), ARRAY[]::uuid[]
        ) AS label_ids,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT l.name ORDER BY l.name), NULL::text)
            FROM issue_labels il
            JOIN labels l ON il.label_id = l.id AND l.deleted_at IS NULL
            WHERE il.issue_id = i.id AND il.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS labels,
        COALESCE(
        (
            SELECT array_remove(array_agg(DISTINCT l.color ORDER BY l.color), NULL::text)
            FROM issue_labels il
            JOIN labels l ON il.label_id = l.id AND l.deleted_at IS NULL
            WHERE il.issue_id = i.id AND il.deleted_at IS NULL
        ), ARRAY[]::text[]
        ) AS label_colors,
        parent_i.name AS parent,
        i.parent_id,
        (
        SELECT json_agg(
                json_build_object(
                    'id', ic.id,
                    'comment', ic.comment_stripped,
                    'actor_id', ic.actor_id,
                    'actor', u.display_name,
                    'created_at', ic.created_at,
                    'updated_at', ic.updated_at
                )
                ORDER BY ic.created_at
                )
        FROM issue_comments ic
        LEFT JOIN users u ON ic.actor_id = u.id AND u.is_active = true
        WHERE ic.issue_id = i.id AND ic.deleted_at IS NULL
        ) AS comments
    FROM issues i
    LEFT JOIN projects p ON i.project_id = p.id AND p.deleted_at IS NULL
    LEFT JOIN states ist ON i.state_id = ist.id AND ist.deleted_at IS NULL
    LEFT JOIN issues parent_i ON i.parent_id = parent_i.id AND parent_i.deleted_at IS NULL
    WHERE i.id = $1
    AND i.deleted_at IS NULL;
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (comment_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching comment details for {comment_id}: {e}")
        return None


async def get_page_details_for_artifact(label_id: str) -> Optional[Dict[str, Any]]:
    """
    Get page details for artifact generation.

    Args:
        label_id: The ID of the page to fetch details for

    Returns:
        Dictionary with page details or None if not found
    """
    query = """
    SELECT
        p.id,
        p.name,
        p.description_stripped
    FROM
        pages p
    WHERE
        p.id = $1
        AND p.deleted_at IS NULL
    """

    try:
        result = await PlaneDBPool.fetchrow(query, (label_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching page details for {label_id}: {e}")
        return None


async def get_state_details_for_artifact(state_id: str) -> Optional[Dict[str, Any]]:
    """
    Get state details for artifact generation.

    Args:
        state_id: The ID of the state to fetch details for

    Returns:
        Dictionary with state details or None if not found
    """
    query = """
    SELECT
        s.id,
        s.name,
        s.color,
        s.project_id,
        s.group
    FROM states s
    WHERE s.id = $1 AND s.deleted_at IS NULL
    """
    try:
        result = await PlaneDBPool.fetchrow(query, (state_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching state details for {state_id}: {e}")
        return None


async def get_label_details_for_artifact(label_id: str) -> Optional[Dict[str, Any]]:
    """
    Get label details for artifact generation.

    Args:
        label_id: The ID of the label to fetch details for

    Returns:
        Dictionary with label details or None if not found
    """
    query = """
    SELECT
        l.id,
        l.name,
        l.color,
        l.project_id,
        l.description,
        l.workspace_id
    FROM labels l
    WHERE l.id = $1 AND l.deleted_at IS NULL
    """
    try:
        result = await PlaneDBPool.fetchrow(query, (label_id,))
        return dict(result) if result else None
    except Exception as e:
        log.error(f"Error fetching label details for {label_id}: {e}")
        return None
