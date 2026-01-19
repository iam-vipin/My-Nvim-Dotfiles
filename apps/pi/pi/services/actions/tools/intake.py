# SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
# SPDX-License-Identifier: LicenseRef-Plane-Commercial
#
# Licensed under the Plane Commercial License (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# https://plane.so/legals/eula
#
# DO NOT remove or modify this notice.
# NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.

"""
Intake API tools for Plane work item triage operations.
"""

from pi.services.actions.tool_generator import generate_tools_for_category
from pi.services.actions.tool_metadata import ToolMetadata
from pi.services.actions.tool_metadata import ToolParameter

# ============================================================================
# TOOL METADATA DEFINITIONS
# ============================================================================

INTAKE_TOOL_DEFINITIONS = {
    "create": ToolMetadata(
        name="intake_create",
        description="Submit work item to intake queue for triage. Creates a new intake item that can be reviewed and converted to a work item.",
        sdk_method="create_intake",
        parameters=[
            ToolParameter(name="name", type="str", required=True, description="Work item title (required)"),
            ToolParameter(name="project_id", type="Optional[str]", required=False, description="Project ID", auto_fill_from_context=True),
            ToolParameter(name="workspace_slug", type="Optional[str]", required=False, description="Workspace slug", auto_fill_from_context=True),
            ToolParameter(name="description_html", type="Optional[str]", required=False, description="Description in HTML format"),
            ToolParameter(name="priority", type="Optional[str]", required=False, description="Priority level (high, medium, low, urgent, none)"),
            ToolParameter(name="assignee", type="Optional[str]", required=False, description="Assignee user ID"),
            ToolParameter(name="reporter", type="Optional[str]", required=False, description="Reporter user ID"),
            ToolParameter(name="labels", type="Optional[list]", required=False, description="List of label IDs"),
        ],
        returns_entity_type="intake",
    ),
    "list": ToolMetadata(
        name="intake_list",
        description="List intake items awaiting triage for a project.",
        sdk_method="list_intake",
        parameters=[
            ToolParameter(name="project_id", type="Optional[str]", required=False, description="Project ID", auto_fill_from_context=True),
            ToolParameter(name="workspace_slug", type="Optional[str]", required=False, description="Workspace slug", auto_fill_from_context=True),
            ToolParameter(name="per_page", type="Optional[int]", required=False, description="Number of results per page (default: 20)"),
            ToolParameter(name="cursor", type="Optional[str]", required=False, description="Pagination cursor"),
        ],
    ),
    "retrieve": ToolMetadata(
        name="intake_retrieve",
        description="Get a single intake work item by ID.",
        sdk_method="retrieve_intake",
        parameters=[
            ToolParameter(name="intake_id", type="str", required=True, description="Intake item ID to retrieve"),
            ToolParameter(name="project_id", type="Optional[str]", required=False, description="Project ID", auto_fill_from_context=True),
            ToolParameter(name="workspace_slug", type="Optional[str]", required=False, description="Workspace slug", auto_fill_from_context=True),
        ],
    ),
    "update": ToolMetadata(
        name="intake_update",
        description="Update intake work item details before triage.",
        sdk_method="update_intake",
        parameters=[
            ToolParameter(name="intake_id", type="str", required=True, description="Intake item ID to update"),
            ToolParameter(name="project_id", type="Optional[str]", required=False, description="Project ID", auto_fill_from_context=True),
            ToolParameter(name="workspace_slug", type="Optional[str]", required=False, description="Workspace slug", auto_fill_from_context=True),
            ToolParameter(name="name", type="Optional[str]", required=False, description="Work item title"),
            ToolParameter(name="description_html", type="Optional[str]", required=False, description="Description in HTML format"),
            ToolParameter(name="priority", type="Optional[str]", required=False, description="Priority level (high, medium, low, urgent, none)"),
            ToolParameter(name="assignee", type="Optional[str]", required=False, description="Assignee user ID"),
            ToolParameter(name="reporter", type="Optional[str]", required=False, description="Reporter user ID"),
            ToolParameter(name="labels", type="Optional[list]", required=False, description="List of label IDs"),
        ],
        returns_entity_type="intake",
    ),
    "delete": ToolMetadata(
        name="intake_delete",
        description="Remove an intake work item from the triage queue.",
        sdk_method="delete_intake",
        parameters=[
            ToolParameter(name="intake_id", type="str", required=True, description="Intake item ID to delete"),
            ToolParameter(name="project_id", type="Optional[str]", required=False, description="Project ID", auto_fill_from_context=True),
            ToolParameter(name="workspace_slug", type="Optional[str]", required=False, description="Workspace slug", auto_fill_from_context=True),
        ],
        returns_entity_type="intake",
    ),
}


# ============================================================================
# TOOL FACTORY
# ============================================================================


def get_intake_tools(method_executor, context):
    """Return LangChain tools for the intake category using auto-generation from metadata."""
    return generate_tools_for_category("intake", method_executor, context, INTAKE_TOOL_DEFINITIONS)
