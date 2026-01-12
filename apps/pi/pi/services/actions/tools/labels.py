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
Labels API tools for Plane labeling operations.

MIGRATED TO AUTO-GENERATED TOOLS
Tool metadata defined in this file (LABEL_TOOL_DEFINITIONS) for modularity.
Old manual definitions kept below for comparison/rollback safety.
"""

from typing import Dict

from pi.services.actions.tool_generator import generate_tools_for_category

# Import tool metadata models
from pi.services.actions.tool_metadata import ToolMetadata
from pi.services.actions.tool_metadata import ToolParameter

# Tool metadata for labels category - single source of truth
LABEL_TOOL_DEFINITIONS: Dict[str, ToolMetadata] = {
    "create": ToolMetadata(
        name="labels_create",
        description="Create a new label",
        sdk_method="create_label",
        returns_entity_type="label",
        parameters=[
            ToolParameter(name="name", type="str", required=True, description="Label name (required)"),
            ToolParameter(name="color", type="str", required=True, description="Label color in hex format (required)"),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (required - provide from conversation context or previous actions)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (provide if known, otherwise auto-detected)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
            ToolParameter(name="description", type="Optional[str]", required=False, description="Label description", property_transform="name"),
            ToolParameter(
                name="parent", type="Optional[str]", required=False, description="Parent label ID for nested labels", property_transform="id"
            ),
            ToolParameter(
                name="sort_order", type="Optional[float]", required=False, description="Sort order for display (float)", property_transform="name"
            ),
            ToolParameter(
                name="external_source",
                type="Optional[str]",
                required=False,
                description='External source identifier (e.g., "jira")',
                property_transform="name",
            ),
            ToolParameter(name="external_id", type="Optional[str]", required=False, description="External system ID", property_transform="name"),
        ],
    ),
    "list": ToolMetadata(
        name="labels_list",
        description="List all labels in a project",
        sdk_method="list_labels",
        parameters=[
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (required - provide from conversation context or previous actions)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (provide if known, otherwise auto-detected)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
        ],
    ),
    "retrieve": ToolMetadata(
        name="labels_retrieve",
        description="Retrieve details of a specific label",
        sdk_method="retrieve_label",
        parameters=[
            ToolParameter(name="label_id", type="str", required=True, description="Label ID (required)"),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (required - provide from conversation context or previous actions)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (provide if known, otherwise auto-detected)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
        ],
    ),
    "update": ToolMetadata(
        name="labels_update",
        description="Update an existing label",
        sdk_method="update_label",
        returns_entity_type="label",
        parameters=[
            ToolParameter(name="label_id", type="str", required=True, description="Label ID (required)"),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (required - provide from conversation context or previous actions)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (provide if known, otherwise auto-detected)",
                auto_fill_from_context=True,
                property_transform="skip",
            ),
            ToolParameter(name="name", type="Optional[str]", required=False, description="New label name", property_transform="name"),
            ToolParameter(name="color", type="Optional[str]", required=False, description="New label color", property_transform="name"),
            ToolParameter(name="description", type="Optional[str]", required=False, description="New label description", property_transform="name"),
            ToolParameter(
                name="parent", type="Optional[str]", required=False, description="Parent label ID for nested labels", property_transform="id"
            ),
            ToolParameter(
                name="sort_order", type="Optional[float]", required=False, description="Sort order for display (float)", property_transform="name"
            ),
            ToolParameter(
                name="external_source",
                type="Optional[str]",
                required=False,
                description='External source identifier (e.g., "jira")',
                property_transform="name",
            ),
            ToolParameter(name="external_id", type="Optional[str]", required=False, description="External system ID", property_transform="name"),
        ],
    ),
}

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py


def get_label_tools(method_executor, context):
    """Return LangChain tools for the labels category using auto-generation from metadata."""

    # Generate all label tools from local metadata
    label_tools = generate_tools_for_category(
        category="labels",
        method_executor=method_executor,
        context=context,
        tool_definitions=LABEL_TOOL_DEFINITIONS,
    )

    return label_tools


# ============================================================================
# OLD MANUAL TOOL DEFINITIONS (COMMENTED OUT - KEPT FOR COMPARISON)
# To rollback: uncomment below and comment out the auto-generation code above
# ============================================================================

# from typing import Optional
# from langchain_core.tools import tool
# from .base import PlaneToolBase
#
# def get_label_tools(method_executor, context):
#     """Return LangChain tools for the labels category using method_executor and context."""
#
#     @tool
#     async def labels_create(
#         name: str,
#         color: str,
#         project_id: Optional[str] = None,
#         workspace_slug: Optional[str] = None,
#         description: Optional[str] = None,
#         parent: Optional[str] = None,
#         sort_order: Optional[float] = None,
#         external_source: Optional[str] = None,
#         external_id: Optional[str] = None,
#     ) -> Dict[str, Any]:
#         """Create a new label.
#
#         Args:
#             name: Label name (required)
#             color: Label color in hex format (required)
#             project_id: Project ID (required - provide from conversation context or previous actions)
#             workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
#             description: Label description
#             parent: Parent label ID for nested labels
#             sort_order: Sort order for display (float)
#             external_source: External source identifier (e.g., "jira")
#             external_id: External system ID
#         """
#         # Auto-fill from context if not provided
#         if workspace_slug is None and "workspace_slug" in context:
#             workspace_slug = context["workspace_slug"]
#         if project_id is None and "project_id" in context:
#             project_id = context["project_id"]
#
#         result = await method_executor.execute(
#             "labels",
#             "create",
#             name=name,
#             color=color,
#             project_id=project_id,
#             workspace_slug=workspace_slug,
#             description=description,
#             parent=parent,
#             sort_order=sort_order,
#             external_source=external_source,
#             external_id=external_id,
#         )
#
#         if result["success"]:
#             return await PlaneToolBase.format_success_payload_with_url(f"Successfully created label '{name}'", result["data"], "label", context)
#         else:
#             return PlaneToolBase.format_error_payload("Failed to create label", result["error"])
#
#     @tool
#     async def labels_list(
#         project_id: Optional[str] = None,
#         workspace_slug: Optional[str] = None,
#     ) -> Dict[str, Any]:
#         """List all labels in a project."""
#         # Auto-fill from context if not provided
#         if workspace_slug is None and "workspace_slug" in context:
#             workspace_slug = context["workspace_slug"]
#         if project_id is None and "project_id" in context:
#             project_id = context["project_id"]
#
#         result = await method_executor.execute(
#             "labels",
#             "list",
#             project_id=project_id,
#             workspace_slug=workspace_slug,
#         )
#
#         if result["success"]:
#             return PlaneToolBase.format_success_payload("Successfully retrieved labels list", result["data"])
#         else:
#             return PlaneToolBase.format_error_payload("Failed to list labels", result["error"])
#
#     @tool
#     async def labels_retrieve(
#         label_id: str,
#         project_id: Optional[str] = None,
#         workspace_slug: Optional[str] = None,
#     ) -> Dict[str, Any]:
#         """Retrieve details of a specific label.
#
#         Args:
#             label_id: Label ID (required)
#             project_id: Project ID (required - provide from conversation context or previous actions)
#             workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
#         """
#         # Auto-fill from context if not provided
#         if workspace_slug is None and "workspace_slug" in context:
#             workspace_slug = context["workspace_slug"]
#         if project_id is None and "project_id" in context:
#             project_id = context["project_id"]
#
#         result = await method_executor.execute(
#             "labels",
#             "retrieve",
#             label_id=label_id,
#             project_id=project_id,
#             workspace_slug=workspace_slug,
#         )
#
#         if result["success"]:
#             return PlaneToolBase.format_success_payload("Successfully retrieved label details", result["data"])
#         else:
#             return PlaneToolBase.format_error_payload("Failed to retrieve label", result["error"])
#
#     @tool
#     async def labels_update(
#         label_id: str,
#         project_id: Optional[str] = None,
#         workspace_slug: Optional[str] = None,
#         name: Optional[str] = None,
#         color: Optional[str] = None,
#         description: Optional[str] = None,
#         parent: Optional[str] = None,
#         sort_order: Optional[float] = None,
#         external_source: Optional[str] = None,
#         external_id: Optional[str] = None,
#     ) -> Dict[str, Any]:
#         """Update an existing label.
#
#         Args:
#             label_id: Label ID (required)
#             name: New label name
#             color: New label color
#             description: New label description
#             parent: Parent label ID for nested labels
#             sort_order: Sort order for display (float)
#             external_source: External source identifier (e.g., "jira")
#             external_id: External system ID
#             project_id: Project ID (required - provide from conversation context or previous actions)
#             workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
#         """
#         # Auto-fill from context if not provided
#         if workspace_slug is None and "workspace_slug" in context:
#             workspace_slug = context["workspace_slug"]
#         if project_id is None and "project_id" in context:
#             project_id = context["project_id"]
#
#         # Build update data with only non-None values
#         update_data = {
#             k: v
#             for k, v in {
#                 "name": name,
#                 "color": color,
#                 "description": description,
#                 "parent": parent,
#                 "sort_order": sort_order,
#                 "external_source": external_source,
#                 "external_id": external_id,
#             }.items()
#             if v is not None
#         }
#
#         result = await method_executor.execute(
#             "labels",
#             "update",
#             label_id=label_id,
#             project_id=project_id,
#             workspace_slug=workspace_slug,
#             **update_data,
#         )
#
#         if result["success"]:
#             return await PlaneToolBase.format_success_payload_with_url(f"Successfully updated label '{label_id}'", result["data"], "label", context)
#         else:
#             return PlaneToolBase.format_error_payload("Failed to update label", result["error"])
#
#     return [labels_create, labels_list, labels_retrieve, labels_update]
