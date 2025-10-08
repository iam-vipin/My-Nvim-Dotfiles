from pi import logger
from pi.app.api.v1.helpers.plane_sql_queries import get_comment_details_for_artifact  # noqa: F401
from pi.app.api.v1.helpers.plane_sql_queries import get_cycle_details_for_artifact  # noqa: F401
from pi.app.api.v1.helpers.plane_sql_queries import get_label_details_for_artifact  # noqa: F401
from pi.app.api.v1.helpers.plane_sql_queries import get_module_details_for_artifact  # noqa: F401
from pi.app.api.v1.helpers.plane_sql_queries import get_page_details_for_artifact  # noqa: F401
from pi.app.api.v1.helpers.plane_sql_queries import get_project_details_for_artifact  # noqa: F401
from pi.app.api.v1.helpers.plane_sql_queries import get_state_details_for_artifact  # noqa: F401
from pi.app.api.v1.helpers.plane_sql_queries import get_workitem_details_for_artifact  # noqa: F401

log = logger.getChild(__name__)


async def prepare_artifact_data(entity_type: str, artifact_data: dict) -> dict:
    """Route to appropriate preparation function based on entity type."""
    preparation_functions = {
        "workitem": prepare_workitem_artifact_data,
        "project": prepare_project_artifact_data,
        "cycle": prepare_cycle_artifact_data,
        "module": prepare_module_artifact_data,
        "comment": prepare_comment_artifact_data,
        "state": prepare_state_artifact_data,
        "label": prepare_label_artifact_data,
    }

    preparation_function = preparation_functions.get(entity_type, prepare_unknown_artifact_data)
    return await preparation_function(artifact_data)


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
            # Align with workitem format by flattening the main entity block
            return _flatten_main_entity_parameters(parameters, "state")

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
            return _flatten_main_entity_parameters(parameters, "label")

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
            return _flatten_main_entity_parameters(parameters, "page")
        return page_data
    except Exception:
        return page_data


async def prepare_user_artifact_data(user_data: dict):
    """Prepare user artifact data for enhanced UI display."""
    return user_data


async def prepare_workitem_artifact_data(workitem_data: dict):
    """Prepare workitem artifact data for enhanced UI display."""
    try:
        # For create operations, use the planning data
        if "planning_data" in workitem_data:
            planning_data = workitem_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            # Use shared helper to ensure consistent flattening across entities
            return _flatten_main_entity_parameters(parameters, "workitem")

        # For update operations, fetch existing workitem details
        elif "entity_id" in workitem_data and workitem_data["entity_id"]:
            # Use the existing workitem details function
            # This will be called during execution phase when entity_id is available
            return await get_workitem_details_for_artifact(workitem_data["entity_id"])

        return workitem_data

    except Exception as e:
        log.error(f"Error preparing workitem artifact data: {e}")
        return workitem_data


async def prepare_project_artifact_data(project_data: dict):
    """Prepare project artifact data for enhanced UI display."""
    try:
        # For create operations, use the planning data
        if "planning_data" in project_data:
            planning_data = project_data["planning_data"]
            parameters = planning_data.get("parameters", {})
            # Flatten the main entity block for consistency with workitem format
            return _flatten_main_entity_parameters(parameters, "project")

        # For update operations, fetch existing project details
        elif "entity_id" in project_data and project_data["entity_id"]:
            return await get_project_details_for_artifact(project_data["entity_id"])

        return project_data

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
            return _flatten_main_entity_parameters(parameters, "cycle")

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
            return _flatten_main_entity_parameters(parameters, "module")

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
            return _flatten_main_entity_parameters(parameters, "comment")

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
