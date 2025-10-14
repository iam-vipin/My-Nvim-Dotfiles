"""Action Summary Generator - Converts LLM tool calls to user-friendly descriptions."""

import re
from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from pi import logger

log = logger.getChild(__name__)


class ActionSummaryGenerator:
    """Generates user-friendly action summaries from LLM tool calls."""

    # Mapping of tool names to user-friendly action names
    TOOL_ACTION_MAPPING = {
        # Work Items
        "workitems_create": "Create work-item",
        "workitems_update": "Update work-item",
        "workitems_list": "List work-items",
        "workitems_retrieve": "Get work-item details",
        "workitems_search": "Search work-items",
        "workitems_get_workspace": "Get workspace work-item",
        # Projects
        "projects_create": "Create project",
        "projects_update": "Update project",
        "projects_archive": "Archive project",
        "projects_unarchive": "Unarchive project",
        "projects_list": "List projects",
        "projects_retrieve": "Get project details",
        # Cycles
        "cycles_create": "Create cycle",
        "cycles_update": "Update cycle",
        "cycles_archive": "Archive cycle",
        "cycles_add_work_items": "Add work-items to cycle",
        "cycles_remove_work_item": "Remove work-item from cycle",
        "cycles_list": "List cycles",
        "cycles_retrieve": "Get cycle details",
        # Labels
        "labels_create": "Create label",
        "labels_list": "List labels",
        # States
        "states_create": "Create state",
        "states_list": "List states",
        # Modules
        "modules_create": "Create module",
        "modules_update": "Update module",
        "modules_archive": "Archive module",
        "modules_unarchive": "Unarchive module",
        "modules_list_archived": "List archived modules",
        "modules_add_work_items": "Add work-items to module",
        "modules_list_work_items": "List work-items in module",
        "modules_remove_work_item": "Remove work-item from module",
        "modules_list": "List modules",
        "modules_retrieve": "Get module details",
        # Users
        "users_get_current": "Get current user details",
        # Comments
        "comments_create": "Add comment",
        "comments_list": "List comments",
        # Attachments
        "attachments_list": "List attachments",
        # Links
        "links_create": "Create link",
        # Worklogs
        "worklogs_create": "Create worklog",
        "worklogs_list": "List worklogs",
        # Intake
        "intake_create": "Submit intake work-item",
        "intake_list": "List intake work-items",
        "intake_delete": "Delete intake work-item",
        # Members
        "members_get_workspace_members": "List workspace members",
        # Activity
        "activity_list": "List activities",
        # Assets
        "assets_list": "List assets",
        # Properties
        "properties_create": "Create property",
        # Types
        "types_create": "Create work-item type",
    }

    # Parameter display names for better readability
    PARAM_DISPLAY_NAMES = {
        "name": "Name",
        "title": "Title",
        "description": "Description",
        "assignees": "Assignees",
        "start_date": "Start date",
        "target_date": "End date",
        "priority": "Priority",
        "state": "State",
        "labels": "Labels",
        "project": "Project",
        "project_id": "Project Name",
        "cycle": "Cycle",
        "cycle_id": "Cycle Name",
        "module": "Module",
        "module_id": "Module Name",
        "state_id": "State Name",
        "label_id": "Label Name",
        "user_id": "User Name",
        "assignee_id": "Assignee Name",
        "estimate_point": "Estimate",
        "point": "Story points",
        "external_id": "External ID",
        "external_source": "External source",
        "is_draft": "Draft status",
        "archived_at": "Archive date",
        "completed_at": "Completion date",
        "sort_order": "Sort order",
        "sequence_id": "Sequence ID",
        "color": "Color",
        "slug": "Slug",
        "logo_props": "Logo properties",
        "view_props": "View properties",
        "backlog_issues": "Backlog issues count",
        "total_issues": "Total issues count",
        "completed_issues": "Completed issues count",
        "started_issues": "Started issues count",
        "unstarted_issues": "Unstarted issues count",
        "cancelled_issues": "Cancelled issues count",
        "total_estimates": "Total estimates",
        "completed_estimates": "Completed estimates",
        "started_estimates": "Started estimates",
        "unstarted_estimates": "Unstarted estimates",
        "version": "Version",
        "timezone": "Timezone",
        "progress_snapshot": "Progress snapshot",
        "members": "Members",
        "lead": "Lead",
        "identifier": "Identifier",
        "workspace": "Workspace",
        "parent": "Parent",
        "is_active": "Active status",
        "is_default": "Default status",
        "is_triage": "Triage status",
        "level": "Level",
        "group": "Group",
        "sequence": "Sequence",
        "default": "Default",
        "is_archived": "Archived status",
        "is_public": "Public status",
        "is_favorite": "Favorite status",
        "is_subscribed": "Subscribed status",
        "is_watching": "Watching status",
        "is_mentions": "Mentions enabled",
        "is_reactions": "Reactions enabled",
        "is_comments": "Comments enabled",
        "is_attachments": "Attachments enabled",
        "is_links": "Links enabled",
        "is_worklogs": "Worklogs enabled",
        "is_estimates": "Estimates enabled",
        "is_cycles": "Cycles enabled",
        "is_modules": "Modules enabled",
        "is_views": "Views enabled",
        "is_analytics": "Analytics enabled",
        "is_integrations": "Integrations enabled",
        "is_webhooks": "Webhooks enabled",
        "is_automation": "Automation enabled",
        "is_workflows": "Workflows enabled",
        "is_templates": "Templates enabled",
        "is_imports": "Imports enabled",
        "is_exports": "Exports enabled",
        "is_backups": "Backups enabled",
        "is_restores": "Restores enabled",
        "is_migrations": "Migrations enabled",
        "is_upgrades": "Upgrades enabled",
        "is_downgrades": "Downgrades enabled",
        "is_rollbacks": "Rollbacks enabled",
        "is_deployments": "Deployments enabled",
        "is_releases": "Releases enabled",
        "is_builds": "Builds enabled",
        "is_tests": "Tests enabled",
        "is_linting": "Linting enabled",
        "is_formatting": "Formatting enabled",
        "is_documentation": "Documentation enabled",
        "is_translations": "Translations enabled",
        "is_localization": "Localization enabled",
        "is_internationalization": "Internationalization enabled",
        "is_accessibility": "Accessibility enabled",
        "is_security": "Security enabled",
        "is_privacy": "Privacy enabled",
        "is_compliance": "Compliance enabled",
        "is_audit": "Audit enabled",
        "is_monitoring": "Monitoring enabled",
        "is_logging": "Logging enabled",
        "is_metrics": "Metrics enabled",
        "is_alerting": "Alerting enabled",
        "is_reporting": "Reporting enabled",
        "is_dashboard": "Dashboard enabled",
        "is_widgets": "Widgets enabled",
        "is_charts": "Charts enabled",
        "is_graphs": "Graphs enabled",
        "is_tables": "Tables enabled",
        "is_forms": "Forms enabled",
        "is_buttons": "Buttons enabled",
        "is_inputs": "Inputs enabled",
        "is_selects": "Selects enabled",
        "is_checkboxes": "Checkboxes enabled",
        "is_radios": "Radio buttons enabled",
        "is_textareas": "Text areas enabled",
        "is_files": "File inputs enabled",
        "is_images": "Image inputs enabled",
        "is_videos": "Video inputs enabled",
        "is_audios": "Audio inputs enabled",
        "is_documents": "Document inputs enabled",
        "is_presentations": "Presentation inputs enabled",
        "is_spreadsheets": "Spreadsheet inputs enabled",
        "is_databases": "Database inputs enabled",
        "is_apis": "API inputs enabled",
        "is_sockets": "Socket inputs enabled",
        "is_streams": "Stream inputs enabled",
        "is_batches": "Batch inputs enabled",
        "is_schedules": "Schedule inputs enabled",
        "is_triggers": "Trigger inputs enabled",
        "is_events": "Event inputs enabled",
        "is_notifications": "Notification inputs enabled",
        "is_emails": "Email inputs enabled",
        "is_sms": "SMS inputs enabled",
        "is_push": "Push notification inputs enabled",
        "is_in_app": "In-app notification inputs enabled",
        "is_slack": "Slack notification inputs enabled",
        "is_teams": "Teams notification inputs enabled",
        "is_discord": "Discord notification inputs enabled",
        "is_telegram": "Telegram notification inputs enabled",
        "is_whatsapp": "WhatsApp notification inputs enabled",
        "is_signal": "Signal notification inputs enabled",
        "is_wechat": "WeChat notification inputs enabled",
        "is_line": "Line notification inputs enabled",
        "is_viber": "Viber notification inputs enabled",
        "is_skype": "Skype notification inputs enabled",
        "is_zoom": "Zoom notification inputs enabled",
        "is_meet": "Google Meet notification inputs enabled",
        "is_teams_meeting": "Teams meeting inputs enabled",
        "is_webex": "Webex meeting inputs enabled",
        "is_gotomeeting": "GoToMeeting inputs enabled",
        "is_joinme": "Join.me inputs enabled",
        "is_bluejeans": "BlueJeans inputs enabled",
        "is_ringcentral": "RingCentral inputs enabled",
        "is_8x8": "8x8 inputs enabled",
        "is_mitel": "Mitel inputs enabled",
        "is_avaya": "Avaya inputs enabled",
        "is_cisco": "Cisco inputs enabled",
        "is_polycom": "Polycom inputs enabled",
        "is_yealink": "Yealink inputs enabled",
        "is_grandstream": "Grandstream inputs enabled",
        "is_snom": "Snom inputs enabled",
        "is_fanvil": "Fanvil inputs enabled",
        "is_htek": "HTek inputs enabled",
        "is_yeastar": "Yeastar inputs enabled",
        "is_3cx": "3CX inputs enabled",
        "is_freepbx": "FreePBX inputs enabled",
        "is_asterisk": "Asterisk inputs enabled",
        "is_freeswitch": "FreeSWITCH inputs enabled",
        "is_kamailio": "Kamailio inputs enabled",
        "is_opensips": "OpenSIPS inputs enabled",
        "is_openser": "OpenSER inputs enabled",
        "is_ser": "SER inputs enabled",
        "is_mediaproxy": "MediaProxy inputs enabled",
        "is_rtpproxy": "RTPproxy inputs enabled",
        "is_rtpengine": "RTPengine inputs enabled",
    }

    @classmethod
    async def generate_action_summary(cls, tool_calls: List[Dict[str, Any]], db=None, context=None) -> Dict[str, Any]:
        """
        Generate a user-friendly action summary from LLM tool calls.

        Args:
            tool_calls: List of tool call dictionaries from LLM
            db: Optional database session for resolving IDs to names
            context: Optional context with workspace info for entity resolution

        Returns:
            Dictionary containing action summary for user display
        """
        if not tool_calls:
            return {}

        # For now, handle single tool call (can be extended for multiple)
        tool_call = tool_calls[0]
        tool_name = tool_call.get("name", "")
        tool_args = tool_call.get("args", {})

        # Get user-friendly action name
        action_name = cls.TOOL_ACTION_MAPPING.get(tool_name, tool_name.replace("_", " ").title())

        # Format parameters for display with entity resolution
        formatted_params = await cls._format_parameters(tool_args, db, context, tool_name)

        return {
            "action": action_name,
            "tool_name": tool_name,
            "parameters": formatted_params,
            "raw_args": tool_args,  # Keep raw args for execution
        }

    @classmethod
    async def _format_parameters(
        cls, params: Dict[str, Any], db: Optional[Any] = None, context: Optional[Dict[str, Any]] = None, tool_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Format parameters with entity-based keys and enhanced entity information.

        Args:
            params: Raw parameter dictionary
            db: Optional database session for resolving IDs to names
            context: Optional context with workspace_slug, project_id etc.
            tool_name: Optional tool name for context-aware parameter grouping

        Returns:
            Formatted parameter dictionary with entity-based keys
        """
        formatted: Dict[str, Any] = {}

        # Extract context info for entity resolution
        workspace_slug = context.get("workspace_slug") if isinstance(context, dict) else None
        project_id = context.get("project_id") if isinstance(context, dict) else None

        # Group parameters by their parent entity
        grouped_params = cls._group_parameters_by_entity(params, tool_name)

        # Determine the primary entity type from the tool name (e.g., modules_create -> module)
        primary_entity_type: Optional[str] = None
        if tool_name:
            primary_entity_type = cls._extract_entity_type_from_tool_name(tool_name)

        for entity_key, entity_params in grouped_params.items():
            if entity_key == "workitem":
                # Handle workitem with its properties
                formatted[entity_key] = await cls._format_workitem_with_properties(entity_params, workspace_slug, project_id, db)
            elif primary_entity_type and entity_key == primary_entity_type:
                # Handle primary entity (e.g., module/state/label) with a properties sub-dict similar to workitem
                primary_entity = await cls._format_primary_entity_with_properties(entity_params, workspace_slug, project_id, db, tool_name)

                # Special case: For project creation/update, the frontend expects properties as a direct child of parameters
                if (
                    tool_name
                    and tool_name.startswith("projects_")
                    and (tool_name.endswith("_create") or tool_name.endswith("_update"))
                    and entity_key == "project"
                ):
                    # Promote properties to top-level and keep only minimal identity under project
                    properties_block = primary_entity.get("properties") if isinstance(primary_entity, dict) else None
                    project_block = {}
                    # Preserve name/title if present
                    for k in ("name", "title"):
                        if isinstance(primary_entity, dict) and k in primary_entity:
                            project_block[k] = primary_entity[k]
                    # Preserve identifier if present
                    if isinstance(primary_entity, dict) and "identifier" in primary_entity:
                        project_block["identifier"] = primary_entity["identifier"]
                    if project_block:
                        formatted[entity_key] = project_block
                    if properties_block and isinstance(properties_block, dict):
                        # Merge into top-level properties; if it already exists, update it
                        if "properties" not in formatted or not isinstance(formatted["properties"], dict):
                            formatted["properties"] = {}
                        formatted["properties"].update(properties_block)
                else:
                    formatted[entity_key] = primary_entity
            else:
                # Handle other entities normally
                for param_key, value in entity_params.items():
                    formatted_value = await cls._format_single_parameter(param_key, value, workspace_slug, project_id, db, tool_name)
                    if formatted_value is None:
                        continue
                    # Special unwrapping for project entity: avoid nested project_id key
                    if entity_key == "project" and param_key in ("project_id", "project") and isinstance(formatted_value, dict):
                        formatted[entity_key] = formatted_value
                        continue

                    if entity_key not in formatted or not isinstance(formatted[entity_key], dict):
                        formatted[entity_key] = {}
                    # Assign per-parameter to avoid overwriting other keys (e.g., name)
                    formatted[entity_key][param_key] = formatted_value

        return formatted

    @classmethod
    async def _format_primary_entity_with_properties(
        cls,
        entity_params: Dict[str, Any],
        workspace_slug: Optional[str],
        project_id: Optional[str],
        db: Optional[Any],
        tool_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Format a primary entity (non-workitem) with a properties sub-dict.

        Mirrors workitem formatting, but is generic for entities like module, state, label, etc.
        """
        entity_data: Dict[str, Any] = {}
        properties: Dict[str, Any] = {}

        for key, value in entity_params.items():
            if key in ["name", "title"]:
                # Entity display name
                formatted_name = await cls._format_single_parameter(key, value, workspace_slug, project_id, db, tool_name)
                # Unwrap {"name": "..."} to plain string for parity with work-items
                if isinstance(formatted_name, dict) and "name" in formatted_name and len(formatted_name) == 1:
                    entity_data["name"] = formatted_name["name"]
                else:
                    entity_data["name"] = formatted_name
            elif key == "identifier" and tool_name and tool_name.startswith("projects_"):
                # Keep identifier as plain string for project
                try:
                    if isinstance(value, str):
                        entity_data["identifier"] = value
                    elif isinstance(value, dict) and "name" in value:
                        entity_data["identifier"] = value["name"]
                    else:
                        entity_data["identifier"] = str(value)
                except Exception:
                    entity_data["identifier"] = value
            elif key in ["pk", "id"] or (
                tool_name
                and (
                    (tool_name.startswith("projects_") and key in ["project_id"])
                    or (tool_name.startswith("labels_") and key in ["label_id"])
                    or (tool_name.startswith("states_") and key in ["state_id"])
                    or (tool_name.startswith("modules_") and key in ["module_id"])
                    or (tool_name.startswith("cycles_") and key in ["cycle_id"])
                )
            ):
                # Normalize primary key/id into top-level id and avoid nesting for all entities
                try:
                    normalized_id_str: Optional[str] = None
                    if isinstance(value, str):
                        normalized_id_str = value
                    elif isinstance(value, dict):
                        # Common nested shapes
                        nid = value.get("id") or value.get("pk") or value.get("name")
                        if isinstance(nid, dict):
                            nid = nid.get("id") or nid.get("pk") or nid.get("name")
                        if nid is not None:
                            normalized_id_str = str(nid)
                    else:
                        normalized_id_str = str(value)

                    if normalized_id_str is not None:
                        entity_data["id"] = normalized_id_str
                        # If caller provided a name dict for the *_id param, preserve it
                        if not entity_data.get("name") and isinstance(value, dict) and value.get("name"):
                            entity_data["name"] = value.get("name")
                        # Best-effort: resolve entity display name by ID for primary entities
                        if db and not entity_data.get("name"):
                            try:
                                # Prefer specialized resolvers when available
                                if tool_name and tool_name.startswith("labels_"):
                                    resolved_label = await cls._resolve_label_by_id(normalized_id_str)
                                    if resolved_label and resolved_label.get("name"):
                                        entity_data["name"] = resolved_label.get("name")
                                elif tool_name and tool_name.startswith("states_"):
                                    # Resolve state by id for display name if helper exists
                                    try:
                                        from pi.app.api.v1.helpers.plane_sql_queries import get_state_details_by_id

                                        st = await get_state_details_by_id(normalized_id_str)
                                        if st and st.get("name"):
                                            entity_data["name"] = st.get("name")
                                    except Exception:
                                        pass

                                # Generic fallback using resolve_id_to_name for all entity types
                                if not entity_data.get("name"):
                                    id_key = None
                                    if isinstance(key, str) and key.endswith("_id"):
                                        id_key = key
                                    elif tool_name:
                                        if tool_name.startswith("projects_"):
                                            id_key = "project_id"
                                        elif tool_name.startswith("labels_"):
                                            id_key = "label_id"
                                        elif tool_name.startswith("states_"):
                                            id_key = "state_id"
                                        elif tool_name.startswith("modules_"):
                                            id_key = "module_id"
                                        elif tool_name.startswith("cycles_"):
                                            id_key = "cycle_id"

                                    if id_key:
                                        resolved_name = await cls._resolve_id_to_name(id_key, normalized_id_str, db)
                                        if resolved_name:
                                            entity_data["name"] = resolved_name
                            except Exception:
                                pass
                except Exception:
                    pass
            else:
                formatted_value = await cls._format_single_parameter(key, value, workspace_slug, project_id, db, tool_name)
                properties[key] = formatted_value

        if properties:
            entity_data["properties"] = properties

        return entity_data

    @classmethod
    def _extract_entity_type_from_tool_name(cls, tool_name: str) -> str:
        """Extract entity type from tool name (e.g., 'workitems_create' -> 'workitem')."""
        # Handle special cases first
        if tool_name.startswith("workitems_"):
            return "workitem"
        elif tool_name.startswith("projects_"):
            return "project"
        elif tool_name.startswith("cycles_"):
            return "cycle"
        elif tool_name.startswith("modules_"):
            return "module"
        elif tool_name.startswith("comments_"):
            return "comment"
        elif tool_name.startswith("pages_"):
            return "page"
        elif tool_name.startswith("labels_"):
            return "label"
        elif tool_name.startswith("states_"):
            return "state"
        elif tool_name.startswith("users_"):
            return "user"
        else:
            # Generic extraction - take first part before underscore
            parts = tool_name.split("_")
            if len(parts) > 1:
                entity = parts[0]
                # Convert plural to singular for common cases
                if entity.endswith("s") and entity not in ["issues", "users"]:
                    entity = entity[:-1]
                return entity
            return "unknown"

    @classmethod
    def _group_parameters_by_entity(cls, params: Dict[str, Any], tool_name: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """Group parameters by their parent entity."""
        grouped: Dict[str, Dict[str, Any]] = {}

        # Extract entity type from tool name if available
        entity_type_from_tool = None
        if tool_name:
            entity_type_from_tool = cls._extract_entity_type_from_tool_name(tool_name)

        for key, value in params.items():
            if key == "workspace_slug":
                continue

            # Determine which entity this parameter belongs to
            if key in [
                "name",
                "title",
                "identifier",
                "description",
                "description_html",
                "priority",
                "state",
                "state_id",
                "point",
                "estimate_point",
                "start_date",
                "target_date",
                "assignees",
                "assignee_id",
                "labels",
                "label_id",
                "issue_id",
                "issues",
                "workitems",
                "status",
                "lead",
                "members",
                "color",
                "group",
            ]:
                # For creation tools, use the entity type from the tool for ALL parameters
                if entity_type_from_tool:
                    entity = entity_type_from_tool
                else:
                    # Fallback to workitem for backward compatibility
                    entity = "workitem"
            elif key in ["project_id", "project"]:
                entity = "project"
            elif key == "pk":
                # Route pk to the primary entity inferred from tool name (works across update ops)
                # Also capture it under a special top-level slot later via flattening
                entity = entity_type_from_tool or "unknown"
            elif key in ["module_id", "module"]:
                entity = "module"
            elif key in ["cycle_id", "cycle"]:
                entity = "cycle"
            else:
                # Default entity mapping
                entity = cls._get_entity_key_for_parameter(key)

            if entity not in grouped:
                grouped[entity] = {}
            grouped[entity][key] = value

        return grouped

    @classmethod
    async def _format_workitem_with_properties(
        cls, workitem_params: Dict[str, Any], workspace_slug: Optional[str], project_id: Optional[str], db: Optional[Any]
    ) -> Dict[str, Any]:
        """Format workitem with its properties grouped together."""
        workitem_data = {}
        properties: Dict[str, Any] = {}
        for key, value in workitem_params.items():
            if key in ["name", "title"]:
                # Main workitem name
                workitem_data["name"] = value
            elif key == "issue_id":
                # Resolve issue_id to workitem name and other details
                if cls._is_uuid_like(str(value)):
                    if db:
                        from pi.app.api.v1.helpers.plane_sql_queries import get_workitem_details_for_artifact

                        try:
                            resolved_workitem = await get_workitem_details_for_artifact(str(value))
                            if resolved_workitem:
                                workitem_data["name"] = resolved_workitem.get("name", "Unknown Work Item")
                                workitem_data["id"] = str(value)
                                # Add other workitem details if available
                                if "project_name" in resolved_workitem:
                                    workitem_data["project"] = resolved_workitem["project_name"]
                            else:
                                workitem_data["name"] = "Unknown Work Item"
                                workitem_data["id"] = str(value)
                        except Exception as e:
                            log.error(f"Error resolving issue_id {value}: {e}")
                            workitem_data["name"] = "Unknown Work Item"
                            workitem_data["id"] = str(value)
                    else:
                        workitem_data["name"] = "Unknown Work Item"
                        workitem_data["id"] = str(value)
                else:
                    # If not a UUID, treat as name
                    workitem_data["name"] = str(value)
            elif key in ["description", "description_html"]:
                workitem_data["description"] = value
            elif key in ["priority", "state", "state_id", "point", "estimate_point", "start_date", "target_date", "assignees", "labels", "label_id"]:
                # These go into properties
                if key == "priority":
                    properties["priority"] = {"name": value}
                elif key in ["state", "state_id"]:
                    # Try to resolve state
                    if cls._is_uuid_like(str(value)):
                        if db:
                            from pi.app.api.v1.helpers.plane_sql_queries import get_state_details_by_id

                            resolved_state = await get_state_details_by_id(str(value))
                            if resolved_state:
                                properties["state"] = {"id": resolved_state["id"], "name": resolved_state["name"], "group": resolved_state["group"]}
                            else:
                                properties["state"] = {"id": value, "name": "Unknown State"}
                        else:
                            properties["state"] = {"id": value, "name": "Unknown State"}
                    else:
                        resolved_entity = await cls._resolve_state(str(value), workspace_slug, project_id)
                        if resolved_entity:
                            properties["state"] = resolved_entity
                        else:
                            properties["state"] = {"name": str(value)}
                elif key in ["point", "estimate_point"]:
                    properties["story_points"] = {"name": str(value)}
                elif key == "start_date":
                    properties["start_date"] = {"name": str(value)}
                elif key == "target_date":
                    properties["target_date"] = {"name": str(value)}
                elif key == "assignees":
                    # Handle assignees list, resolve name/ID -> {id,name}
                    resolved_assignees: List[Dict[str, Any]] = []
                    try:
                        if isinstance(value, list):
                            for assignee_val in value:
                                if isinstance(assignee_val, str) and cls._is_uuid_like(assignee_val):
                                    resolved = await cls._resolve_user_by_id(assignee_val)
                                    if resolved:
                                        resolved_assignees.append({"id": resolved.get("id"), "name": resolved.get("name")})
                                    else:
                                        resolved_assignees.append({"id": assignee_val})
                                else:
                                    resolved = await cls._resolve_user(str(assignee_val), workspace_slug, project_id)
                                    if resolved:
                                        resolved_assignees.append({"id": resolved.get("id"), "name": resolved.get("name")})
                                    else:
                                        resolved_assignees.append({"name": str(assignee_val)})
                        else:
                            assignee_val = value
                            if isinstance(assignee_val, str) and cls._is_uuid_like(assignee_val):
                                resolved = await cls._resolve_user_by_id(assignee_val)
                                if resolved:
                                    resolved_assignees.append({"id": resolved.get("id"), "name": resolved.get("name")})
                                else:
                                    resolved_assignees.append({"id": assignee_val})
                            else:
                                resolved = await cls._resolve_user(str(assignee_val), workspace_slug, project_id)
                                if resolved:
                                    resolved_assignees.append({"id": resolved.get("id"), "name": resolved.get("name")})
                                else:
                                    resolved_assignees.append({"name": str(assignee_val)})
                    except Exception as e:
                        log.error(f"Error resolving assignees in planning: {e}")
                        if isinstance(value, list):
                            resolved_assignees = [{"name": str(assignee)} for assignee in value]
                        else:
                            resolved_assignees = [{"name": str(value)}]

                    properties["assignees"] = resolved_assignees
                elif key == "labels":
                    # Handle labels list, resolve name -> {id,name,color}
                    resolved_labels: List[Dict[str, Any]] = []
                    try:
                        if isinstance(value, list):
                            for label_val in value:
                                if isinstance(label_val, str) and cls._is_uuid_like(label_val):
                                    resolved = await cls._resolve_label_by_id(label_val)
                                    if resolved:
                                        resolved_labels.append({
                                            "id": resolved.get("id"),
                                            "name": resolved.get("name"),
                                            "color": resolved.get("color"),
                                        })
                                    else:
                                        resolved_labels.append({"id": label_val})
                                else:
                                    # Try resolving by name
                                    resolved = await cls._resolve_label(str(label_val), workspace_slug, project_id)
                                    if resolved:
                                        resolved_labels.append({
                                            "id": resolved.get("id"),
                                            "name": resolved.get("name"),
                                            "color": resolved.get("color"),
                                        })
                                    else:
                                        resolved_labels.append({"name": str(label_val)})
                        else:
                            label_val = value
                            if isinstance(label_val, str) and cls._is_uuid_like(label_val):
                                resolved = await cls._resolve_label_by_id(label_val)
                                if resolved:
                                    resolved_labels.append({"id": resolved.get("id"), "name": resolved.get("name"), "color": resolved.get("color")})
                                else:
                                    resolved_labels.append({"id": str(label_val)})
                            else:
                                resolved = await cls._resolve_label(str(label_val), workspace_slug, project_id)
                                if resolved:
                                    resolved_labels.append({"id": resolved.get("id"), "name": resolved.get("name"), "color": resolved.get("color")})
                                else:
                                    resolved_labels.append({"name": str(label_val)})
                    except Exception as e:
                        log.error(f"Error resolving labels in planning: {e}")
                        if isinstance(value, list):
                            resolved_labels = [{"name": str(label)} for label in value]
                        else:
                            resolved_labels = [{"name": str(value)}]

                    properties["labels"] = resolved_labels
                elif key == "label_id":
                    # Normalize single label to labels array with full details
                    try:
                        resolved_label: Optional[Dict[str, Any]] = None
                        if isinstance(value, str) and cls._is_uuid_like(value):
                            resolved_label = await cls._resolve_label_by_id(value)
                            if not resolved_label:
                                resolved_label = {"id": value}
                        else:
                            resolved_label = await cls._resolve_label(str(value), workspace_slug, project_id)
                            if not resolved_label:
                                resolved_label = {"name": str(value)}

                        if "labels" not in properties:
                            properties["labels"] = []
                        properties["labels"].append({
                            "id": resolved_label.get("id"),
                            "name": resolved_label.get("name"),
                            "color": resolved_label.get("color"),
                        })
                    except Exception as e:
                        log.error(f"Error resolving label_id in planning: {e}")
                        if "labels" not in properties:
                            properties["labels"] = []
                        properties["labels"].append({"name": str(value)})
                elif key == "assignee_id":
                    # Normalize single assignee to assignees array with full details
                    try:
                        resolved_user: Optional[Dict[str, Any]] = None
                        if isinstance(value, str) and cls._is_uuid_like(value):
                            resolved_user = await cls._resolve_user_by_id(value)
                            if not resolved_user:
                                resolved_user = {"id": value}
                        else:
                            resolved_user = await cls._resolve_user(str(value), workspace_slug, project_id)
                            if not resolved_user:
                                resolved_user = {"name": str(value)}

                        if "assignees" not in properties:
                            properties["assignees"] = []
                        properties["assignees"].append({
                            "id": resolved_user.get("id"),
                            "name": resolved_user.get("name"),
                        })
                    except Exception as e:
                        log.error(f"Error resolving assignee_id in planning: {e}")
                        if "assignees" not in properties:
                            properties["assignees"] = []
                        properties["assignees"].append({"name": str(value)})

        # Set default name if not provided
        if "name" not in workitem_data:
            workitem_data["name"] = "Untitled"

        # Add properties if any exist
        if properties:
            workitem_data["properties"] = properties

        return workitem_data

    @classmethod
    async def _format_single_parameter(
        cls, key: str, value: Any, workspace_slug: Optional[str], project_id: Optional[str], db: Optional[Any], tool_name: Optional[str] = None
    ) -> Any:
        """Format a single parameter value."""
        # Format the value based on type and resolve entities
        if isinstance(value, list):
            # Handle lists (e.g., assignees, workitems, labels)
            formatted_list = []
            for item in value:
                if isinstance(item, str):
                    # UUID-like list items: enrich with name/identifier when possible
                    if cls._is_uuid_like(item):
                        if key in ("issues", "workitems"):
                            # Resolve work-item unique key and name for display
                            if db:
                                try:
                                    from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                                    details = await get_issue_identifier_for_artifact(item)
                                    if details:
                                        # Include id, name, and unique identifier (e.g., WEB-821)
                                        formatted_list.append({
                                            "id": item,
                                            "name": details.get("name"),
                                            "identifier": details.get("identifier"),
                                        })
                                        continue
                                except Exception:
                                    pass
                            # Fallback: keep id only
                            formatted_list.append({"id": item})
                            continue

                        # Other UUID lists (assignees, labels, etc.): try resolving to a name
                        if db:
                            try:
                                resolved_name = await cls._resolve_id_to_name(key, item, db)
                                if resolved_name:
                                    formatted_list.append({"id": item, "name": resolved_name})
                                    continue
                            except Exception:
                                pass
                        # Fallback to id-only when name not resolvable
                        formatted_list.append({"id": item})
                        continue

                    # Non-UUID strings: try entity resolution (by name)
                    resolved_entity = await cls._resolve_entity_for_parameter(key, item, workspace_slug, project_id)
                    if resolved_entity:
                        formatted_list.append(resolved_entity)
                    else:
                        formatted_list.append({"name": item})
                elif isinstance(item, dict) and "name" in item:
                    formatted_list.append(item)
                elif isinstance(item, dict) and "id" in item:
                    # Preserve already structured id dicts
                    formatted_list.append(item)
                else:
                    formatted_list.append({"name": str(item)})
            return formatted_list

        elif isinstance(value, dict):
            # Handle dict values (already structured). Normalize pk/id dicts broadly, but avoid duplicating under properties.
            try:
                if key in ("pk", "id", "project_id", "module_id", "cycle_id", "state_id", "label_id", "issue_id"):
                    inner = value.get("id") or value.get("pk") or value.get("name") or value
                    if isinstance(inner, dict):
                        inner = inner.get("id") or inner.get("pk") or inner.get("name") or inner
                    if isinstance(inner, str) and cls._is_uuid_like(inner):
                        return {"id": inner}
            except Exception:
                pass
            return value

        elif value is not None and value != "":
            # Handle single values
            if isinstance(value, str):
                # For creation tools, don't resolve name parameters as existing entities
                should_resolve_as_entity = True
                if tool_name and tool_name.endswith("_create") and key in ["name", "title"]:
                    should_resolve_as_entity = False

                # Try to resolve as entity first (if appropriate)
                if should_resolve_as_entity:
                    resolved_entity = await cls._resolve_entity_for_parameter(key, value, workspace_slug, project_id)
                    if resolved_entity:
                        return resolved_entity

                # If not an entity, check if it's a UUID that needs name/identifier resolution
                if db and cls._is_uuid_like(value):
                    # Special handling for single work-item IDs
                    if key in ("issue_id", "workitem_id"):
                        try:
                            from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                            details = await get_issue_identifier_for_artifact(value)
                            if details:
                                return {
                                    "id": value,
                                    "name": details.get("name"),
                                    "identifier": details.get("identifier"),
                                }
                        except Exception:
                            pass
                    resolved_name = await cls._resolve_id_to_name(key, value, db)
                    if resolved_name:
                        return {"id": value, "name": resolved_name}
                    else:
                        return {"name": value}
                else:
                    return {"name": value}
            else:
                return {"name": str(value)}

        return None

    @classmethod
    def _get_entity_key_for_parameter(cls, param_key: str) -> str:
        """
        Map parameter keys to entity type names for consistent API responses.

        Args:
            param_key: The parameter key from the tool call

        Returns:
            Entity type name for the parameter
        """
        # Direct entity type mappings
        entity_mappings = {
            # ID parameters
            "project_id": "project",
            "module_id": "module",
            "cycle_id": "cycle",
            "state_id": "state",
            "label_id": "label",
            "user_id": "user",
            "assignee_id": "assignee",
            "issue_id": "workitem",  # Map issue_id to workitem
            # List parameters
            "assignees": "assignees",
            "labels": "labels",
            "workitems": "workitems",
            "issues": "workitems",  # Alias
            # Workitem-specific parameters
            "name": "workitem",  # For workitem name
            "title": "workitem",  # Alternative for workitem title
            "description": "description",
            "description_html": "description",
            # Common parameters
            "priority": "priority",
            "start_date": "start_date",
            "target_date": "target_date",
            "point": "story_points",
            "estimate_point": "estimate",
            # Status/state
            "state": "state",
            "status": "status",
        }

        # Check direct mappings first
        if param_key in entity_mappings:
            return entity_mappings[param_key]

        # For _id parameters, extract the entity type
        if param_key.endswith("_id"):
            entity_type = param_key.replace("_id", "")
            return entity_type

        # Fallback to the parameter key itself (cleaned up)
        return param_key.replace("_", " ").lower()

    @classmethod
    def _is_uuid_like(cls, value: Any) -> bool:
        """Check if a value looks like a UUID."""
        if not isinstance(value, str):
            return False

        # Simple UUID pattern check (8-4-4-4-12 format)
        uuid_pattern = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)
        return bool(uuid_pattern.match(value))

    @classmethod
    async def _resolve_id_to_name(cls, param_key: str, param_value: str, db: Optional[Any]) -> Optional[str]:
        """
        Resolve an ID to a name using database queries.

        Args:
            param_key: The parameter key (e.g., 'project_id')
            param_value: The parameter value (the ID)
            db: Database session

        Returns:
            Resolved name or None if not resolvable
        """
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import resolve_id_to_name

            # Extract entity type from parameter key
            entity_type = param_key.replace("_id", "").lower()

            # Resolve the ID to a name
            resolved_name = await resolve_id_to_name(entity_type, param_value)

            if resolved_name:
                return resolved_name
            else:
                return None

        except Exception as e:
            log.error(f"Error resolving ID to name for {param_key}={param_value}: {e}")
            return None

    @classmethod
    async def _resolve_entity_for_parameter(
        cls, param_key: str, param_value: str, workspace_slug: Optional[str], project_id: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        """
        Resolve a parameter value to entity information if it's an entity reference.

        Args:
            param_key: Parameter key (e.g., 'module_id', 'assignees', 'labels')
            param_value: Parameter value (name or ID)
            workspace_slug: Workspace slug for context
            project_id: Project ID for context

        Returns:
            Dict with entity information or None if not resolvable
        """
        try:
            # Skip if already a UUID - these are handled separately
            if cls._is_uuid_like(param_value):
                return None

            # Map parameter keys to search functions
            entity_resolvers = {
                "project_id": cls._resolve_project,
                "module_id": cls._resolve_module,
                "cycle_id": cls._resolve_cycle,
                "state_id": cls._resolve_state,
                "label_id": cls._resolve_label,
                "assignee_id": cls._resolve_user,
                "user_id": cls._resolve_user,
                "issue_id": cls._resolve_workitem,  # Add issue_id resolver
                # Handle list parameters
                "assignees": cls._resolve_user,
                "labels": cls._resolve_label,
                "workitems": cls._resolve_workitem,
                "issues": cls._resolve_workitem,  # Alias for workitems
            }

            # Determine which resolver to use
            resolver = None
            if param_key in entity_resolvers:
                resolver = entity_resolvers[param_key]
            elif param_key.endswith("_id"):
                # Try to infer from the parameter name
                entity_type = param_key.replace("_id", "")
                if entity_type in ["module", "cycle", "state", "label", "user", "project", "workitem", "issue"]:
                    resolver = entity_resolvers.get(f"{entity_type}_id")

            if resolver:
                return await resolver(param_value, workspace_slug, project_id)

            return None

        except Exception as e:
            log.error(f"Error resolving entity for {param_key}={param_value}: {e}")
            return None

    @classmethod
    async def _resolve_project(cls, name: str, workspace_slug: Optional[str], project_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Resolve project by name."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_project_by_name

            result = await search_project_by_name(name, workspace_slug)
            if result:
                return {"id": result["id"], "name": result["name"], "workspace_id": result.get("workspace_id"), "type": "project"}
            return None
        except Exception as e:
            log.error(f"Error resolving project '{name}': {e}")
            return None

    @classmethod
    async def _resolve_module(cls, name: str, workspace_slug: Optional[str], project_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Resolve module by name."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_module_by_name

            result = await search_module_by_name(name, project_id, workspace_slug)
            if result:
                return {"id": result["id"], "name": result["name"], "project_id": result.get("project_id"), "type": "module"}
            return None
        except Exception as e:
            log.error(f"Error resolving module '{name}': {e}")
            return None

    @classmethod
    async def _resolve_cycle(cls, name: str, workspace_slug: Optional[str], project_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Resolve cycle by name."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_cycle_by_name

            result = await search_cycle_by_name(name, project_id, workspace_slug)
            if result:
                return {"id": result["id"], "name": result["name"], "project_id": result.get("project_id"), "type": "cycle"}
            return None
        except Exception as e:
            log.error(f"Error resolving cycle '{name}': {e}")
            return None

    @classmethod
    async def _resolve_state(cls, name: str, workspace_slug: Optional[str], project_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Resolve state by name with improved reliability."""
        try:
            # First try the search method with better error handling
            from pi.app.api.v1.helpers.plane_sql_queries import search_state_by_name

            result = await search_state_by_name(name, project_id, workspace_slug)
            if result:
                return {
                    "id": result["id"],
                    "name": result["name"],
                    "group": result.get("group"),
                    "project_id": result.get("project_id"),
                    "type": "state",
                }

            # If search fails, log the attempt for debugging
            log.warning(f"State search failed for name='{name}', project_id='{project_id}', workspace_slug='{workspace_slug}'")
            return None

        except Exception as e:
            log.error(f"Error resolving state '{name}': {e}")
            return None

    @classmethod
    async def _resolve_label(cls, name: str, workspace_slug: Optional[str], project_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Resolve label by name."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_label_by_name

            result = await search_label_by_name(name, project_id, workspace_slug)
            if result:
                return {
                    "id": result["id"],
                    "name": result["name"],
                    "color": result.get("color"),
                    "project_id": result.get("project_id"),
                    "type": "label",
                }
            return None
        except Exception as e:
            log.error(f"Error resolving label '{name}': {e}")
            return None

    @classmethod
    async def _resolve_label_by_id(cls, label_id: str) -> Optional[Dict[str, Any]]:
        """Resolve label by ID to include name and color."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import get_label_details_for_artifact

            details = await get_label_details_for_artifact(label_id)
            if details:
                return {"id": str(details.get("id", label_id)), "name": details.get("name"), "color": details.get("color"), "type": "label"}
            return None
        except Exception as e:
            log.error(f"Error resolving label by id '{label_id}': {e}")
            return None

    @classmethod
    async def _resolve_user(cls, name: str, workspace_slug: Optional[str], project_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Resolve user by display name."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_user_by_name

            result = await search_user_by_name(name, workspace_slug)
            if result:
                if len(result) > 1:
                    log.warning(f"Multiple users found for name '{name}': {len(result)} matches. Using first match: {result[0]["display_name"]}")

                # Use the first result
                user = result[0]
                return {"id": user["id"], "name": user["display_name"], "email": user.get("email"), "type": "user"}
            return None
        except Exception as e:
            log.error(f"Error resolving user '{name}': {e}")
            return None

    @classmethod
    async def _resolve_user_by_id(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """Resolve user by ID to include at least display name."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import get_user_name

            display_name = await get_user_name(user_id)
            if display_name:
                return {"id": user_id, "name": display_name, "type": "user"}
            return None
        except Exception as e:
            log.error(f"Error resolving user by id '{user_id}': {e}")
            return None

    @classmethod
    async def _resolve_workitem(cls, name: str, workspace_slug: Optional[str], project_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Resolve workitem by name."""
        try:
            from pi.app.api.v1.helpers.plane_sql_queries import search_workitem_by_name

            result = await search_workitem_by_name(name, project_id, workspace_slug)
            if result:
                return {"id": result["id"], "name": result["name"], "project_id": result.get("project_id"), "type": "workitem"}
            return None
        except Exception as e:
            log.error(f"Error resolving workitem '{name}': {e}")
            return None

    @classmethod
    def format_for_streaming(cls, action_summary: Dict[str, Any], message_id: str) -> str:
        """
        Format action summary for streaming response with unique prefix.

        Args:
            action_summary: Action summary dictionary
            message_id: ID of the message containing this action

        Returns:
            Formatted string for streaming
        """
        log.info(f"Action summary: {action_summary}")
        if not action_summary:
            return ""

        # Extract action verb, artifact type, and sub-type from tool_name
        tool_name = action_summary.get("tool_name", "")
        action_verb, artifact_type, artifact_sub_type = cls._extract_action_and_artifact_type(tool_name)

        # Use artifact_id from action_summary if available, otherwise extract from parameters
        artifact_id = action_summary.get("artifact_id")
        if not artifact_id:
            parameters = action_summary.get("parameters", {})
            artifact_id = cls._extract_artifact_id(parameters, artifact_type)

        # Flatten parameters structure
        parameters = action_summary.get("parameters", {})
        flattened_params = cls._flatten_parameters(parameters, artifact_type, artifact_sub_type)

        # Include pk only if it was present in the original tool args
        try:
            raw_args = action_summary.get("raw_args", {}) or {}
            if isinstance(raw_args, dict) and "pk" in raw_args:
                pk_val = raw_args.get("pk")
                # Unwrap to a UUID-like string if possible
                candidate = None
                if isinstance(pk_val, str):
                    candidate = pk_val
                elif isinstance(pk_val, dict):
                    # Safely unwrap nested id-like values while keeping types explicit for mypy
                    inner_candidate = pk_val.get("id") or pk_val.get("pk") or pk_val.get("name")
                    if isinstance(inner_candidate, dict):
                        nested = inner_candidate.get("id") or inner_candidate.get("pk") or inner_candidate.get("name")
                        candidate = nested if isinstance(nested, str) else None
                    elif isinstance(inner_candidate, str):
                        candidate = inner_candidate
                    else:
                        candidate = None
                # Fallback to entity id from parameters
                if not candidate and isinstance(parameters, dict):
                    ent = parameters.get(artifact_type)
                    if isinstance(ent, dict):
                        candidate = ent.get("id")
                # If candidate looks like UUID, add pk
                if isinstance(candidate, str) and cls._is_uuid_like(candidate):
                    flattened_params["pk"] = {"id": candidate}
        except Exception:
            pass

        # Create frontend-friendly version matching requested format
        frontend_action_summary = {
            "action": action_verb,
            "artifact_type": artifact_type,
            "artifact_id": artifact_id,
            "tool_name": tool_name,
            "parameters": flattened_params,
            "message_id": message_id,
        }

        # Add artifact_sub_type for add/remove operations
        if artifact_sub_type:
            frontend_action_summary["artifact_sub_type"] = artifact_sub_type

        # Optionally include sequence if present in the action_summary (planning stage)
        try:
            if isinstance(action_summary, dict) and "sequence" in action_summary:
                frontend_action_summary["sequence"] = action_summary["sequence"]
        except Exception:
            pass

        # Convert to JSON string with unique prefix
        import json

        return f"πspecial actions blockπ: {json.dumps(frontend_action_summary, default=str)}"

    @classmethod
    def _extract_action_and_artifact_type(cls, tool_name: str) -> tuple[str, str, Optional[str]]:
        """Extract action verb, artifact type, and sub-type from tool name."""
        if not tool_name or "_" not in tool_name:
            return "unknown", "unknown", None

        parts = tool_name.split("_")
        if len(parts) >= 2:
            artifact_type = parts[0]  # e.g., "workitems_create" -> "workitems"
            action_verb = parts[1] if len(parts) > 1 else "unknown"  # e.g., "create"

            # Extract sub-type for add/remove operations
            sub_type = None
            if action_verb in ["add", "remove"] and len(parts) > 2:
                # e.g., "modules_add_work_items" -> sub_type = "work_items"
                sub_type = "_".join(parts[2:])
                # Normalize sub_type to singular form
                if sub_type == "work_items":
                    sub_type = "workitem"
                elif sub_type == "work_item":
                    sub_type = "workitem"

            # Convert artifact type to singular form
            if artifact_type.endswith("s") and len(artifact_type) > 1:
                artifact_type = artifact_type[:-1]  # "workitems" -> "workitem"

            return action_verb, artifact_type, sub_type
        else:
            return "unknown", "unknown", None

    @classmethod
    def _extract_artifact_id(cls, parameters: Dict[str, Any], artifact_type: str) -> str:
        """Generate a dummy artifact ID for the artifacts table (to be implemented)."""
        # TODO: This will be replaced with actual artifact ID generation when artifacts table is implemented
        import uuid

        return str(uuid.uuid4())

    @classmethod
    def _flatten_parameters(cls, parameters: Dict[str, Any], artifact_type: str, artifact_sub_type: Optional[str] = None) -> Dict[str, Any]:
        """Flatten parameters structure for frontend format."""
        flattened = {}

        # Extract main entity fields to top level
        if artifact_type in parameters:
            entity_data = parameters[artifact_type]
            if isinstance(entity_data, dict):
                # Move main entity fields to top level
                for key, value in entity_data.items():
                    if key != "id":  # Skip ID as it's handled separately
                        flattened[key] = value
                # Preserve entity identity explicitly
                if "id" in entity_data:
                    flattened[artifact_type] = {"id": entity_data["id"]}

        # Handle sub-type for add/remove operations
        if artifact_sub_type:
            # Add artifact_sub_type to parameters
            flattened["artifact_sub_type"] = artifact_sub_type

            # Check if we need to rename "issues" key in the already flattened properties
            if "properties" in flattened:
                properties = flattened["properties"]
                if isinstance(properties, dict) and "issues" in properties:
                    # Move issues to the artifact_sub_type key
                    properties[artifact_sub_type] = properties.pop("issues")

        # Add other parameters
        for key, value in parameters.items():
            if key != artifact_type:  # Skip main entity as it's already processed
                flattened[key] = value

        return flattened
