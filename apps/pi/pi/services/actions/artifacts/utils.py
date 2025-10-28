import asyncio
import uuid
from typing import Any
from typing import Dict
from typing import Optional

from pi import logger
from pi.app.api.v1.helpers.plane_sql_queries import get_comment_details_for_artifact
from pi.app.api.v1.helpers.plane_sql_queries import get_cycle_details_for_artifact
from pi.app.api.v1.helpers.plane_sql_queries import get_cycle_name
from pi.app.api.v1.helpers.plane_sql_queries import get_label_details_for_artifact
from pi.app.api.v1.helpers.plane_sql_queries import get_label_name
from pi.app.api.v1.helpers.plane_sql_queries import get_module_details_for_artifact
from pi.app.api.v1.helpers.plane_sql_queries import get_module_name
from pi.app.api.v1.helpers.plane_sql_queries import get_project_details_for_artifact
from pi.app.api.v1.helpers.plane_sql_queries import get_state_details_by_id
from pi.app.api.v1.helpers.plane_sql_queries import get_state_details_for_artifact
from pi.app.api.v1.helpers.plane_sql_queries import get_user_name
from pi.app.api.v1.helpers.plane_sql_queries import get_workitem_details_for_artifact
from pi.services.retrievers.pg_store.action_artifact import get_latest_artifact_data_for_display

log = logger.getChild(__name__)


async def merge_llm_updates_with_existing_data(entity_type: str, entity_id: str, llm_updates: dict) -> dict:
    """
    Merge LLM updates with existing entity data to provide complete artifact response.

    This ensures that for update operations, the UI gets both:
    1. The fields updated by the LLM
    2. All other existing fields needed for proper display/editing

    Args:
        entity_type: Type of entity (workitem, epic, project, etc.)
        entity_id: ID of the entity to fetch existing data for
        llm_updates: The updates provided by the LLM (partial data)

    Returns:
        Complete merged data with both updates and existing fields
    """
    try:
        # Import schemas for field definitions
        from pi.services.actions.artifacts.schemas import get_base_fields_for_entity

        # Get existing entity data from database
        existing_data = None
        if entity_type in ["workitem", "epic"]:
            existing_data = await get_workitem_details_for_artifact(entity_id)
        elif entity_type == "project":
            existing_data = await get_project_details_for_artifact(entity_id)
        elif entity_type == "cycle":
            existing_data = await get_cycle_details_for_artifact(entity_id)
        elif entity_type == "module":
            existing_data = await get_module_details_for_artifact(entity_id)

        if not existing_data:
            log.warning(f"Could not fetch existing data for {entity_type} {entity_id}")
            return llm_updates

        # Get the fields that should be included for this entity type
        required_fields = get_base_fields_for_entity(entity_type)

        # Start with LLM updates as the base
        merged_data = llm_updates.copy() if isinstance(llm_updates, dict) else {}

        # Ensure we have the basic structure
        if "properties" not in merged_data:
            merged_data["properties"] = {}

        # Merge top-level fields
        for field in ["name", "description"]:
            if field not in merged_data and field in existing_data:
                merged_data[field] = existing_data[field]

        # Merge properties - preserve LLM updates but add missing required fields
        properties = merged_data.get("properties", {})

        # Handle special field mappings and formatting
        if "state_id" in existing_data and "state" not in properties:
            properties["state"] = {
                "id": str(existing_data["state_id"]),  # Convert UUID to string
                "name": existing_data.get("state", "Unknown"),
                "group": existing_data.get("state_group", "unknown"),
            }

        if "priority" in existing_data and "priority" not in properties:
            properties["priority"] = {"name": existing_data["priority"]}

        # Handle assignees, labels, and parent FIRST to ensure they get structured format
        for field in ["assignees", "labels"]:
            if field not in properties and field in existing_data and existing_data[field]:
                id_field = f"{field[:-1]}_ids"  # assignees -> assignee_ids, labels -> label_ids
                if id_field in existing_data and existing_data[id_field]:
                    ids = existing_data[id_field]
                    names = existing_data[field]
                    structured_items = []
                    for i, item_id in enumerate(ids):
                        item_name = names[i] if i < len(names) else "Unknown"
                        structured_items.append({"id": str(item_id), "name": item_name})
                    properties[field] = structured_items
                    # Don't include separate ID arrays - they're redundant

        # Handle parent separately (single item, not a list)
        # Check if LLM provided parent (either as new assignment or update)
        if "parent" in properties:
            existing_parent = properties["parent"]
            # If it's in wrong format (e.g., {"name": "uuid"}), fix it
            if isinstance(existing_parent, dict) and "id" not in existing_parent:
                # Extract the UUID from the wrong format
                parent_id = existing_parent.get("name")
                if parent_id:
                    # Fetch parent name from database
                    parent_details = await get_workitem_details_for_artifact(parent_id)
                    parent_name = parent_details.get("name", "Unknown") if parent_details else "Unknown"
                    properties["parent"] = {"id": str(parent_id), "name": parent_name}
        elif "parent_id" in existing_data and existing_data["parent_id"]:
            # No parent in LLM updates, but exists in database - add it
            parent_name = existing_data.get("parent", "Unknown")
            properties["parent"] = {"id": str(existing_data["parent_id"]), "name": parent_name}

        # Add missing required fields from existing data (but don't override LLM updates)
        for field in required_fields:
            if field in ["name", "description", "project", "project_id"]:
                continue  # These are handled at top level

            # Skip assignees/labels/parent (already handled above) and their ID fields
            if field in ["assignees", "labels", "assignee_ids", "label_ids", "parent_id"]:
                continue

            # Skip parent too, but with special handling if it's in wrong format
            if field == "parent":
                continue

            # Skip if LLM already provided this field (preserve LLM updates)
            if field in properties:
                continue

            # Add from existing data if available
            if field in existing_data and existing_data[field] is not None:
                value = existing_data[field]

                # Transform certain fields to structured format
                if field == "priority" and isinstance(value, str):
                    properties[field] = {"name": value}
                elif field in ["start_date", "target_date"] and value:
                    properties[field] = {"name": str(value)}
                elif field == "state" and isinstance(value, str):
                    # For state, we need both name and id
                    properties[field] = {"name": value}
                    if "state_id" in existing_data and existing_data["state_id"]:
                        properties["state"]["id"] = str(existing_data["state_id"])
                    if "state_group" in existing_data and existing_data["state_group"]:
                        properties["state"]["group"] = existing_data["state_group"]
                elif field in ["cycles", "modules"] and isinstance(value, list):
                    # For cycles and modules, only keep IDs (no name arrays)
                    id_field = field.replace("s", "_ids")
                    if id_field in existing_data and existing_data[id_field]:
                        properties[id_field] = [str(item_id) for item_id in existing_data[id_field]]
                elif field in ["cycle_ids", "module_ids"] and isinstance(value, list):
                    # Add ID arrays if the named versions don't exist
                    named_field = field.replace("_ids", "s")
                    if named_field not in existing_data:
                        properties[field] = [str(item_id) for item_id in value]
                else:
                    # Convert UUID objects to strings for JSON serialization
                    if hasattr(value, "hex"):  # UUID objects have a 'hex' attribute
                        properties[field] = str(value)
                    else:
                        properties[field] = value

        merged_data["properties"] = properties

        # Ensure project information is included
        if "project" not in merged_data:
            if "project_id" in existing_data:
                project_details = await get_project_details_for_artifact(str(existing_data["project_id"]))
                if project_details:
                    merged_data["project"] = {
                        "id": str(existing_data["project_id"]),
                        "identifier": project_details.get("identifier", ""),
                        "name": project_details.get("name", ""),
                    }

        log.info(f"Successfully merged LLM updates with existing data for {entity_type} {entity_id}")
        return merged_data

    except Exception as e:
        log.error(f"Error merging LLM updates with existing data for {entity_type} {entity_id}: {e}")
        return llm_updates


def construct_entity_url(entity_type: str, entity_id: str, entity_details: dict) -> Optional[str]:
    """
    Unified function to construct entity URLs based on entity type and details.

    Args:
        entity_type: Type of entity (workitem, project, cycle, module, label, state, comment)
        entity_id: ID of the entity
        entity_details: Dictionary containing entity details including project_identifier

    Returns:
        Constructed URL string or None if unable to construct
    """
    try:
        if entity_type == "workitem":
            issue_identifier = entity_details.get("identifier")
            project_identifier = entity_details.get("project_identifier")
            if project_identifier and issue_identifier:
                return f"/projects/{project_identifier}/issues/{issue_identifier}"

        elif entity_type == "project":
            entity_identifier = entity_details.get("identifier")
            if entity_identifier:
                return f"/projects/{entity_identifier}"

        elif entity_type == "cycle":
            project_identifier = entity_details.get("project_identifier")
            if project_identifier:
                return f"/projects/{project_identifier}/cycles/{entity_id}"

        elif entity_type == "module":
            project_identifier = entity_details.get("project_identifier")
            if project_identifier:
                return f"/projects/{project_identifier}/modules/{entity_id}"

        elif entity_type == "label":
            project_identifier = entity_details.get("project_identifier")
            if project_identifier:
                return f"/projects/{project_identifier}/settings/labels"

        elif entity_type == "state":
            project_identifier = entity_details.get("project_identifier")
            if project_identifier:
                return f"/projects/{project_identifier}/settings/states"

        elif entity_type == "comment":
            project_identifier = entity_details.get("project_identifier")
            workitem_identifier = entity_details.get("workitem_identifier")
            if project_identifier and workitem_identifier:
                return f"/projects/{project_identifier}/issues/{workitem_identifier}"

    except Exception as e:
        log.warning(f"Error constructing URL for {entity_type} {entity_id}: {e}")

    return None


async def populate_entity_info_from_artifact(
    artifact,
) -> tuple[Optional[str], Optional[str], Optional[str], Optional[str], Optional[str], Optional[str]]:
    """
    Unified function to populate entity info from artifact entity_id.

    Returns:
        Tuple of (entity_id, entity_url, entity_name, entity_type, issue_identifier, entity_identifier)
    """
    if not artifact.entity_id:
        return None, None, None, None, None, None

    entity_id = str(artifact.entity_id)
    entity_type = artifact.entity
    entity_name = None
    entity_url = None
    issue_identifier = None
    entity_identifier = None

    try:
        entity_details = None

        if artifact.entity == "workitem":
            entity_details = await get_workitem_details_for_artifact(entity_id)
            if entity_details:
                entity_name = entity_details.get("name")
                issue_identifier = entity_details.get("identifier")
                entity_identifier = issue_identifier

        elif artifact.entity == "project":
            entity_details = await get_project_details_for_artifact(entity_id)
            if entity_details:
                entity_name = entity_details.get("name")
                entity_identifier = entity_details.get("identifier")

        elif artifact.entity == "cycle":
            entity_details = await get_cycle_details_for_artifact(entity_id)
            if entity_details:
                entity_name = entity_details.get("name")

        elif artifact.entity == "module":
            entity_details = await get_module_details_for_artifact(entity_id)
            if entity_details:
                entity_name = entity_details.get("name")

        elif artifact.entity == "label":
            entity_details = await get_label_details_for_artifact(entity_id)
            if entity_details:
                entity_name = entity_details.get("name")

        elif artifact.entity == "state":
            entity_details = await get_state_details_for_artifact(entity_id)
            if entity_details:
                entity_name = entity_details.get("name")

        elif artifact.entity == "comment":
            entity_details = await get_comment_details_for_artifact(entity_id)
            if entity_details:
                entity_name = f"Comment on {entity_details.get("workitem_name", "work item")}"

        # Construct URL using unified function
        if entity_details:
            entity_url = construct_entity_url(artifact.entity, entity_id, entity_details)

    except Exception as e:
        log.warning(f"Error fetching entity details for {artifact.entity} {artifact.entity_id}: {e}")

    return entity_id, entity_url, entity_name, entity_type, issue_identifier, entity_identifier


def serialize_for_json(obj: Any) -> Any:
    """
    Convert objects to JSON-serializable format.

    Recursively converts UUID objects to strings in any data structure.
    This ensures that data can be properly serialized to JSON/JSONB.

    Args:
        obj: Any data structure that may contain UUID objects

    Returns:
        The same data structure with UUID objects converted to strings
    """
    if isinstance(obj, uuid.UUID):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: serialize_for_json(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [serialize_for_json(item) for item in obj]
    else:
        return obj


# Alias for backward compatibility
convert_uuids_to_strings = serialize_for_json


async def resolve_project_id_to_object(data: dict) -> dict:
    """
    Helper function to resolve project_id to full project object in artifact data.

    Handles both old format (project_id at top level) and new format (project.id).

    Args:
        data: Dictionary that may contain project_id or project.id

    Returns:
        Dictionary with project_id replaced by project object if resolution was successful
    """

    try:
        project_id = None

        # Check for old format: project_id at top level
        if "project_id" in data and data["project_id"]:
            project_id = str(data["project_id"])

        # Check for new format: project.id
        elif "project" in data and isinstance(data["project"], dict) and "id" in data["project"]:
            project_id = str(data["project"]["id"])

        if not project_id:
            return data

        project_details = await get_project_details_for_artifact(project_id)
        if project_details:
            # Create a copy to avoid modifying the original
            resolved_data = data.copy()
            # Replace with full project object
            resolved_data["project"] = {
                "id": str(project_details["id"]),
                "name": project_details["name"],
                "identifier": project_details["identifier"],
            }
            # Remove the old project_id if it exists
            resolved_data.pop("project_id", None)
            log.debug(f"Resolved project_id {project_id} to project object")
            return resolved_data
        else:
            log.warning(f"Could not resolve project_id {project_id}")
            return data
    except Exception as e:
        log.error(f"Error resolving project_id: {e}")
        return data


async def prepare_artifact_data(entity_type: str, artifact_data: dict, action: Optional[str] = None, entity_id: Optional[str] = None) -> dict:
    """Route to appropriate preparation function based on entity type."""

    # Enhance artifact_data with action and entity_id for preparation functions
    enhanced_artifact_data = artifact_data.copy() if isinstance(artifact_data, dict) else artifact_data
    if isinstance(enhanced_artifact_data, dict):
        if action:
            enhanced_artifact_data["action"] = action
        if entity_id:
            enhanced_artifact_data["entity_id"] = entity_id

    preparation_functions = {
        "workitem": prepare_workitem_artifact_data,
        "epic": prepare_epic_artifact_data,  # Epics have their own preparation function
        "project": prepare_project_artifact_data,
        "cycle": prepare_cycle_artifact_data,
        "module": prepare_module_artifact_data,
        "comment": prepare_comment_artifact_data,
        "state": prepare_state_artifact_data,
        "label": prepare_label_artifact_data,
    }

    preparation_function = preparation_functions.get(entity_type, prepare_unknown_artifact_data)
    prepared_data = await preparation_function(enhanced_artifact_data)

    # Resolve project_id to full project object if present
    resolved_data = await resolve_project_id_to_object(prepared_data)

    return resolved_data


async def prepare_edited_artifact_data(entity_type: str, artifact_data: dict) -> dict:
    """Route to appropriate edited artifact preparation function based on entity type."""
    edited_preparation_functions = {
        "workitem": prepare_edited_workitem_artifact_data,
        "epic": prepare_edited_workitem_artifact_data,
        # TODO: Add other entity types later
        # "project": prepare_edited_project_artifact_data,
        # "cycle": prepare_edited_cycle_artifact_data,
        # "module": prepare_edited_module_artifact_data,
        # "comment": prepare_edited_comment_artifact_data,
        # "state": prepare_edited_state_artifact_data,
        # "label": prepare_edited_label_artifact_data,
    }

    preparation_function = edited_preparation_functions.get(entity_type, prepare_edited_unknown_artifact_data)
    prepared_data = await preparation_function(artifact_data)

    return prepared_data


async def prepare_edited_workitem_artifact_data(artifact_data: dict) -> dict:
    # Start with basic fields
    clean_data: dict = {}
    properties: dict[str, Any] = {}

    # Essential top-level fields
    essential_fields = {"name", "description", "description_html", "artifact_sub_type", "project", "project_id"}

    # Extract and preserve entity_info first (this is crucial for executed artifacts)
    entity_info = None
    if isinstance(artifact_data, dict) and "entity_info" in artifact_data:
        entity_info = artifact_data.get("entity_info")
        log.info(f"Found entity_info in edited workitem artifact data: {entity_info}")

    # Collect all async tasks for parallel execution
    tasks: list[Any] = []
    task_keys: list[tuple[str, Any]] = []

    for key, value in artifact_data.items():
        # Skip null/empty values
        if value is None or (isinstance(value, list) and not value):
            continue

        if key in essential_fields:
            clean_data[key] = value
        elif key == "assignee_ids" and isinstance(value, list) and value:
            # Fetch all user names in parallel
            for user_id in value:
                tasks.append(get_user_name(user_id))
                task_keys.append(("assignee", user_id))
        elif key == "module_ids" and isinstance(value, list) and value:
            # Fetch all module names in parallel
            for module_id in value:
                tasks.append(get_module_name(module_id))
                task_keys.append(("module", module_id))
        elif key == "label_ids" and isinstance(value, list) and value:
            # Fetch all label names in parallel
            for label_id in value:
                tasks.append(get_label_name(label_id))
                task_keys.append(("label", label_id))
        elif key == "parent_id" and value:
            # Fetch parent workitem name using workitem details query
            tasks.append(get_workitem_details_for_artifact(value))
            task_keys.append(("parent", value))
        elif key == "state_id" and value:
            # Fetch full state details (id, name, group)
            tasks.append(get_state_details_by_id(value))
            task_keys.append(("state", value))
        elif key == "type_id" and value:
            # Fetch state details (type_id refers to state)
            tasks.append(get_state_details_by_id(value))
            task_keys.append(("type", value))
        elif key == "cycle_id" and value:
            # Fetch cycle name
            tasks.append(get_cycle_name(value))
            task_keys.append(("cycle", value))
        elif key == "priority" and isinstance(value, str):
            # Transform string priority to object
            properties["priority"] = {"name": value}
        elif key in ["start_date", "target_date"] and value:
            # Transform date to object
            properties[key] = {"name": str(value)}
        elif key not in {"entity_info"}:  # Skip entity_info
            properties[key] = value

    # Execute all queries in parallel
    if tasks:
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results and group by type
            assignees = []
            modules = []
            labels = []
            parent = None
            state_obj = None
            type_obj = None
            cycle = None

            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    log.warning(f"Query failed for {task_keys[i]}: {result}")
                    continue

                task_type, task_id = task_keys[i]

                if task_type == "assignee" and result:
                    assignees.append({"id": task_id, "name": result})
                elif task_type == "module" and result:
                    modules.append({"id": task_id, "name": result})
                elif task_type == "label" and result:
                    labels.append({"id": task_id, "name": result})
                elif task_type == "parent" and result and isinstance(result, dict):
                    parent = {"id": task_id, "name": result.get("name", "Unknown")}
                elif task_type == "state" and result and isinstance(result, dict):
                    state_obj = {"id": task_id, "name": result.get("name", "Unknown"), "group": result.get("group", "unstarted")}
                elif task_type == "type" and result and isinstance(result, dict):
                    type_obj = {"id": task_id, "name": result.get("name", "Unknown"), "group": result.get("group", "unstarted")}
                elif task_type == "cycle" and result:
                    cycle = {"id": task_id, "name": result}

            # Add transformed properties
            if assignees:
                properties["assignees"] = assignees
            if modules:
                properties["modules"] = modules
            if labels:
                properties["labels"] = labels
            if parent:
                properties["parent"] = parent
            if state_obj:
                properties["state"] = state_obj
            if type_obj:
                properties["type"] = type_obj
            if cycle:
                properties["cycle"] = cycle

        except Exception as e:
            log.error(f"Error executing parallel queries: {e}")

    # Add properties if any
    if properties:
        clean_data["properties"] = properties

    # Restore entity_info if it was present in the original data
    if entity_info:
        clean_data["entity_info"] = entity_info
        log.info(f"Restored entity_info to clean workitem data: {entity_info}")

    return clean_data


async def prepare_edited_unknown_artifact_data(artifact_data: dict) -> dict:
    """Fallback for unknown edited artifact entity types."""
    log.warning("No edited preparation function found for unknown entity type, returning data as-is")
    return artifact_data


async def prepare_artifact_data_with_entity_info(entity_type: str, artifact_data: dict) -> tuple[dict, dict]:
    """
    Route to appropriate preparation function and return both clean parameters and entity info separately.

    Returns:
        tuple: (clean_parameters, entity_info)
    """
    preparation_functions = {
        "workitem": prepare_workitem_artifact_data,
        "epic": prepare_epic_artifact_data,  # Epics have their own preparation function
        "project": prepare_project_artifact_data,
        "cycle": prepare_cycle_artifact_data,
        "module": prepare_module_artifact_data,
        "comment": prepare_comment_artifact_data,
        "state": prepare_state_artifact_data,
        "label": prepare_label_artifact_data,
    }

    preparation_function = preparation_functions.get(entity_type, prepare_unknown_artifact_data)
    prepared_data = await preparation_function(artifact_data)

    # Resolve project_id to full project object if present
    resolved_data = await resolve_project_id_to_object(prepared_data)

    # Extract entity_info if present
    entity_info = {}
    clean_parameters = resolved_data.copy() if isinstance(resolved_data, dict) else resolved_data

    if isinstance(resolved_data, dict) and "entity_info" in resolved_data:
        entity_info = resolved_data.get("entity_info", {})
        # Remove entity_info from parameters to avoid duplication
        clean_parameters.pop("entity_info", None)

    return clean_parameters, entity_info


def _flatten_main_entity_parameters(parameters: dict, main_key: str) -> dict:
    """Flatten planning parameters by promoting the main entity block to top level.

    Example:
        parameters = {"workitem": {"name": "X", "properties": {...}}, "project": {...}}
        -> {"name": "X", "properties": {...}, "project": {...}}
    """
    try:
        flattened: dict = {}

        # Promote main entity dictionary fields to top-level
        main_block = parameters.get(main_key)
        if isinstance(main_block, dict):
            for key, value in main_block.items():
                flattened[key] = value

        # Copy all other parameters except the main entity key
        for key, value in parameters.items():
            if key != main_key:
                flattened[key] = value

        return flattened
    except Exception:
        # If anything goes wrong, return original parameters to avoid breaking responses
        return parameters


async def prepare_state_artifact_data(state_data: dict):
    """Prepare state artifact data for enhanced UI display."""
    try:
        # For create operations, use the planning data
        if "planning_data" in state_data:
            planning_data = state_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            # Use unified normalizer instead of old flattening logic
            return normalize_parameters_structure(parameters, flatten_entities=False)

        # For update operations, fetch existing state details
        elif "entity_id" in state_data and state_data["entity_id"]:
            return await get_state_details_for_artifact(state_data["entity_id"])

        return state_data
    except Exception as e:
        log.error(f"Error preparing state artifact data: {e}")
        return state_data


async def prepare_label_artifact_data(label_data: dict):
    """Prepare label artifact data for enhanced UI display."""
    try:
        # For create operations, use the planning data
        if "planning_data" in label_data:
            planning_data = label_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            return normalize_parameters_structure(parameters, flatten_entities=False)

        # For update operations, fetch existing label details
        elif "entity_id" in label_data and label_data["entity_id"]:
            return await get_label_details_for_artifact(label_data["entity_id"])

        return label_data
    except Exception as e:
        log.error(f"Error preparing label artifact data: {e}")
        return label_data


async def prepare_page_artifact_data(page_data: dict):
    """Prepare page artifact data for enhanced UI display."""
    try:
        if "planning_data" in page_data:
            planning_data = page_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            return normalize_parameters_structure(parameters, flatten_entities=False)
        return page_data
    except Exception:
        return page_data


async def prepare_user_artifact_data(user_data: dict):
    """Prepare user artifact data for enhanced UI display."""
    return user_data


async def prepare_epic_artifact_data(epic_data: dict):
    """Prepare epic artifact data for enhanced UI display."""
    try:
        # Preserve entity_info if it exists (for executed artifacts)
        original_entity_info = epic_data.get("entity_info") if isinstance(epic_data, dict) else None

        # For create operations, use the planning data
        if "planning_data" in epic_data:
            planning_data = epic_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            # Use same normalization as workitems - epics just have fewer fields
            result = normalize_parameters_structure(parameters, flatten_entities=True)

            # Resolve parent field if present (convert from {"name": "uuid"} to {"id": "uuid", "name": "Parent Name"})
            if "properties" in result and "parent" in result["properties"]:
                parent_data = result["properties"]["parent"]
                if isinstance(parent_data, dict) and "id" not in parent_data and "name" in parent_data:
                    parent_id = parent_data["name"]
                    # Fetch parent name from database (epics are also workitems)
                    parent_details = await get_workitem_details_for_artifact(parent_id)
                    if parent_details:
                        result["properties"]["parent"] = {"id": str(parent_id), "name": parent_details.get("name", "Unknown")}

        # For update operations, fetch existing epic details and merge with any updates
        elif "entity_id" in epic_data and epic_data["entity_id"]:
            # Check if this is an update operation with LLM updates
            if "action" in epic_data and epic_data["action"] == "update" and "parameters" in epic_data:
                # This is an update with LLM changes - merge with existing data
                entity_id = str(epic_data["entity_id"])
                llm_updates = epic_data.get("parameters", {})

                log.info(f"Merging LLM updates with existing epic data for {entity_id}")
                result = await merge_llm_updates_with_existing_data("epic", entity_id, llm_updates)
            else:
                # Regular fetch - use the existing workitem details function since epics are workitems
                fetched_result = await get_workitem_details_for_artifact(epic_data["entity_id"])
                result = fetched_result if fetched_result is not None else epic_data

        else:
            result = epic_data

        # Restore entity_info if it was present in the original data
        if original_entity_info and isinstance(result, dict):
            result["entity_info"] = original_entity_info

        return result

    except Exception as e:
        log.error(f"Error preparing epic artifact data: {e}")
        return epic_data


async def prepare_workitem_artifact_data(workitem_data: dict):
    """Prepare workitem artifact data for enhanced UI display."""
    try:
        # Preserve entity_info if it exists (for executed artifacts)
        original_entity_info = workitem_data.get("entity_info") if isinstance(workitem_data, dict) else None

        # For create operations, use the planning data
        if "planning_data" in workitem_data:
            planning_data = workitem_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            # Use unified normalizer with entity flattening to merge project details
            result = normalize_parameters_structure(parameters, flatten_entities=True)

            # Resolve parent field if present (convert from {"name": "uuid"} to {"id": "uuid", "name": "Parent Name"})
            if "properties" in result and "parent" in result["properties"]:
                parent_data = result["properties"]["parent"]
                if isinstance(parent_data, dict) and "id" not in parent_data and "name" in parent_data:
                    parent_id = parent_data["name"]
                    # Fetch parent name from database
                    parent_details = await get_workitem_details_for_artifact(parent_id)
                    if parent_details:
                        result["properties"]["parent"] = {"id": str(parent_id), "name": parent_details.get("name", "Unknown")}

        # For update operations, fetch existing workitem details and merge with any updates
        elif "entity_id" in workitem_data and workitem_data["entity_id"]:
            # Check if this is an update operation with LLM updates
            if "action" in workitem_data and workitem_data["action"] == "update" and "parameters" in workitem_data:
                # This is an update with LLM changes - merge with existing data
                entity_id = str(workitem_data["entity_id"])
                llm_updates = workitem_data.get("parameters", {})

                log.info(f"Merging LLM updates with existing workitem data for {entity_id}")
                result = await merge_llm_updates_with_existing_data("workitem", entity_id, llm_updates)
            else:
                # Regular fetch of existing workitem details (no updates)
                fetched_result = await get_workitem_details_for_artifact(workitem_data["entity_id"])
                result = fetched_result if fetched_result is not None else workitem_data

        else:
            result = workitem_data

        # Restore entity_info if it was present in the original data
        if original_entity_info and isinstance(result, dict):
            result["entity_info"] = original_entity_info

        return result

    except Exception as e:
        log.error(f"Error preparing workitem artifact data: {e}")
        return workitem_data


async def prepare_project_artifact_data(project_data: dict):
    """Prepare project artifact data for enhanced UI display."""
    try:
        # Preserve entity_info if it exists (for executed artifacts)
        original_entity_info = project_data.get("entity_info") if isinstance(project_data, dict) else None

        # For create operations, use the planning data
        if "planning_data" in project_data:
            planning_data = project_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            # Use unified normalizer instead of old flattening logic
            result = normalize_parameters_structure(parameters, flatten_entities=False)

        # For update operations, fetch existing project details
        elif "entity_id" in project_data and project_data["entity_id"]:
            fetched_result = await get_project_details_for_artifact(project_data["entity_id"])
            result = fetched_result if fetched_result is not None else project_data

        else:
            result = project_data

        # Restore entity_info if it was present in the original data
        if original_entity_info and isinstance(result, dict):
            result["entity_info"] = original_entity_info

        return result

    except Exception as e:
        log.error(f"Error preparing project artifact data: {e}")
        return project_data


async def prepare_cycle_artifact_data(cycle_data: dict):
    """Prepare cycle artifact data for enhanced UI display."""
    try:
        # For create operations, use the planning data
        if "planning_data" in cycle_data:
            planning_data = cycle_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            return normalize_parameters_structure(parameters, flatten_entities=False)

        # For update operations, fetch existing cycle details
        elif "entity_id" in cycle_data and cycle_data["entity_id"]:
            return await get_cycle_details_for_artifact(cycle_data["entity_id"])

        return cycle_data

    except Exception as e:
        log.error(f"Error preparing cycle artifact data: {e}")
        return cycle_data


async def prepare_module_artifact_data(module_data: dict):
    """Prepare module artifact data for enhanced UI display."""
    try:
        # For create operations, use the planning data
        if "planning_data" in module_data:
            planning_data = module_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            return normalize_parameters_structure(parameters, flatten_entities=False)

        # For update operations, fetch existing module details
        elif "entity_id" in module_data and module_data["entity_id"]:
            return await get_module_details_for_artifact(module_data["entity_id"])

        return module_data

    except Exception as e:
        log.error(f"Error preparing module artifact data: {e}")
        return module_data


async def prepare_comment_artifact_data(comment_data: dict):
    """Prepare comment artifact data for enhanced UI display."""
    try:
        # For create operations, use the planning data
        if "planning_data" in comment_data:
            planning_data = comment_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            return normalize_parameters_structure(parameters, flatten_entities=False)

        # For update operations, fetch existing comment details
        elif "entity_id" in comment_data and comment_data["entity_id"]:
            return await get_comment_details_for_artifact(comment_data["entity_id"])

        return comment_data

    except Exception as e:
        log.error(f"Error preparing comment artifact data: {e}")
        return comment_data


async def prepare_unknown_artifact_data(artifact_data: dict):
    """Prepare unknown entity artifact data for enhanced UI display."""
    log.info(f"Artifact data received in unknown type function: {artifact_data}")
    try:
        # For unknown entities, return basic planning data
        if "planning_data" in artifact_data:
            planning_data = artifact_data["planning_data"]
            return {
                "action": planning_data.get("action", ""),
                "tool_name": planning_data.get("tool_name", ""),
                "parameters": planning_data.get("parameters", {}),
            }

        return artifact_data

    except Exception as e:
        log.error(f"Error preparing unknown artifact data: {e}")
        return artifact_data


def normalize_parameters_structure(parameters: dict, flatten_entities: bool = True) -> Dict[str, Any]:
    """
    Unified function to normalize parameter structure for consistent frontend format.

    This ensures ALL pipelines (streaming, action planning, artifact responses)
    produce the same consistent structure with description at top level.

    Args:
        parameters: Input parameters dictionary
        flatten_entities: Whether to flatten entity blocks and merge related fields

    Returns:
        Normalized parameters with consistent structure
    """

    normalized: Dict[str, Any] = {}
    properties: Dict[str, Any] = {}

    # Fields that should always stay at top level
    top_level_fields = {"name", "description", "project", "identifier"}

    # First pass: handle entity flattening if requested
    working_params = parameters.copy()
    if flatten_entities:
        # Look for entity blocks to flatten and merge with related ID fields
        entity_keys = ["project", "workitem", "module", "cycle", "state", "label", "comment", "page"]
        for entity_key in entity_keys:
            if entity_key in working_params and isinstance(working_params[entity_key], dict):
                entity_data = working_params.pop(entity_key)

                # Look for related ID field (e.g., project_id for project)
                id_field = f"{entity_key}_id"
                if id_field in working_params:
                    entity_id = working_params.pop(id_field)
                    # Add the ID to the entity data
                    entity_data["id"] = entity_id

                # Keep the full entity object at top level
                working_params[entity_key] = entity_data

            # Also check if ID field exists without the entity object
            elif f"{entity_key}_id" in working_params:
                entity_id = working_params.pop(f"{entity_key}_id")
                # Create entity object with just the ID
                working_params[entity_key] = {"id": entity_id}

    for key, value in working_params.items():
        # Handle HTML field mappings to their base equivalents (these are not in top_level_fields)
        if key == "description_html":
            # Map description_html to description at top level (for workitems, epics, etc.)
            if isinstance(value, dict) and "name" in value:
                normalized["description"] = value["name"]
            elif isinstance(value, str):
                normalized["description"] = value
            else:
                normalized["description"] = str(value) if value is not None else ""
        elif key in top_level_fields:
            # Handle nested description objects - extract string value
            if key == "description" and isinstance(value, dict):
                if "name" in value and isinstance(value["name"], str):
                    normalized[key] = value["name"]
                elif "description" in value and isinstance(value["description"], str):
                    normalized[key] = value["description"]
                elif "value" in value and isinstance(value["value"], str):
                    normalized[key] = value["value"]
                else:
                    # Can't extract string, put in properties
                    properties[key] = value
            else:
                normalized[key] = value
        elif key.endswith("_id") and key != "entity_id":
            # Skip standalone ID fields that should be merged with entities
            # These are handled in the entity flattening pass above
            continue
        elif key == "properties":
            # Merge existing properties and convert plain strings to structured objects
            if isinstance(value, dict):
                for prop_key, prop_value in value.items():
                    # Skip ID fields that should be merged with entities
                    if prop_key.endswith("_id") and flatten_entities:
                        continue
                    # Convert plain string values to structured objects with "name" field
                    # (parent field will be resolved later in prepare_*_artifact_data functions)
                    if isinstance(prop_value, str):
                        properties[prop_key] = {"name": prop_value}
                    else:
                        properties[prop_key] = prop_value
        else:
            # All other fields go to properties, convert strings to structured objects
            # (parent field will be resolved later in prepare_*_artifact_data functions)
            if isinstance(value, str):
                properties[key] = {"name": value}
            else:
                properties[key] = value

    # Add properties if any exist
    if properties:
        normalized["properties"] = properties

    return normalized


def restructure_parameters_for_frontend(parameters: dict) -> dict:
    """
    Legacy function - now uses the unified normalizer.

    Kept for backward compatibility.
    """
    return normalize_parameters_structure(parameters, flatten_entities=False)


async def prepare_artifact_response_data(db, artifact, is_latest=False) -> dict:
    """
    Centralized function to prepare artifact data for API response.

    Handles data preparation, entity info extraction, and parameter restructuring
    for consistent response format across all endpoints.
    """

    artifact_data_to_use, is_edited, actual_is_executed, actual_success = await get_latest_artifact_data_for_display(db, artifact)

    try:
        if is_edited and artifact.entity == "workitem":
            # Use special handling for edited workitem artifacts
            # TODO: Handle other entities
            enhanced_data = await prepare_edited_artifact_data(artifact.entity, artifact_data_to_use)
        else:
            # Use existing logic for unedited artifacts - pass action and entity_id for update operations
            enhanced_data = await prepare_artifact_data(
                entity_type=artifact.entity,
                artifact_data=artifact_data_to_use,
                action=artifact.action,
                entity_id=str(artifact.entity_id) if artifact.entity_id else None,
            )
    except Exception as e:
        log.warning(f"Error preparing artifact data for {artifact.id}: {e}")
        enhanced_data = artifact_data_to_use

    # Extract entity info from parameters if available
    entity_id = None
    entity_url = None
    entity_name = None
    entity_type = None
    issue_identifier = None
    entity_identifier = None

    # Create a copy of enhanced_data to avoid modifying the original
    clean_parameters = enhanced_data.copy() if isinstance(enhanced_data, dict) else enhanced_data

    # First, try to extract entity_info from the artifact data
    if isinstance(enhanced_data, dict) and "entity_info" in enhanced_data:
        entity_info = enhanced_data.get("entity_info", {})
        if isinstance(entity_info, dict):
            entity_id = entity_info.get("entity_id")
            entity_url = entity_info.get("entity_url")
            entity_name = entity_info.get("entity_name")
            entity_type = entity_info.get("entity_type")
            issue_identifier = entity_info.get("issue_identifier")
            entity_identifier = entity_info.get("entity_identifier")

        # Remove entity_info from parameters since we're extracting it to top level
        clean_parameters.pop("entity_info", None)

    # If no entity_info found but artifact is executed and has entity_id, populate entity info
    elif actual_is_executed and artifact.entity_id:
        entity_id, entity_url, entity_name, entity_type, issue_identifier, entity_identifier = await populate_entity_info_from_artifact(artifact)

    return {
        "artifact_id": str(artifact.id),
        "sequence": artifact.sequence,
        "artifact_type": artifact.entity,
        "action": artifact.action,
        "parameters": serialize_for_json(clean_parameters),
        "message_id": str(artifact.message_id) if artifact.message_id else None,
        "is_executed": actual_is_executed,  # Use actual source
        "success": actual_success,  # Use actual source
        "is_editable": (artifact.entity == "workitem" and is_latest and not actual_is_executed),  # Use actual is_executed
        "entity_id": entity_id,
        "entity_url": entity_url,
        "entity_name": entity_name,
        "entity_type": entity_type,
        "issue_identifier": issue_identifier,
        "entity_identifier": entity_identifier,
    }
