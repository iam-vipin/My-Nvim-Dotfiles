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
Assets API tools for Plane asset management operations.
"""

from typing import Dict

from pi.services.actions.tool_generator import generate_tools_for_category
from pi.services.actions.tool_metadata import ToolMetadata
from pi.services.actions.tool_metadata import ToolParameter

# ============================================================================
# ASSETS TOOL DEFINITIONS
# ============================================================================

ASSET_TOOL_DEFINITIONS: Dict[str, ToolMetadata] = {
    "create": ToolMetadata(
        name="assets_create",
        description="Create a new generic asset",
        sdk_method="create_generic_asset_upload",
        parameters=[
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
    "create_user_upload": ToolMetadata(
        name="assets_create_user_upload",
        description="Upload user-specific assets",
        sdk_method="create_user_asset_upload",
        parameters=[
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
    "get_generic": ToolMetadata(
        name="assets_get_generic",
        description="Retrieve generic assets",
        sdk_method="get_generic_asset",
        parameters=[
            ToolParameter(name="asset_id", type="str", required=True, description="Asset ID (required)"),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
    "update_generic": ToolMetadata(
        name="assets_update_generic",
        description="Update generic assets",
        sdk_method="update_generic_asset",
        parameters=[
            ToolParameter(name="asset_id", type="str", required=True, description="Asset ID (required)"),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
    "update_user": ToolMetadata(
        name="assets_update_user",
        description="Update user assets",
        sdk_method="update_user_asset",
        parameters=[
            ToolParameter(name="asset_id", type="str", required=True, description="Asset ID (required)"),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
    "delete_user": ToolMetadata(
        name="assets_delete_user",
        description="Delete user assets",
        sdk_method="delete_user_asset",
        parameters=[
            ToolParameter(name="asset_id", type="str", required=True, description="Asset ID (required)"),
            ToolParameter(
                name="workspace_slug",
                type="Optional[str]",
                required=False,
                description="Workspace slug (auto-detected from context)",
                auto_fill_from_context=True,
            ),
            ToolParameter(
                name="project_id",
                type="Optional[str]",
                required=False,
                description="Project ID (auto-detected from context)",
                auto_fill_from_context=True,
            ),
        ],
    ),
}


# ============================================================================
# TOOL FACTORY
# ============================================================================


def get_asset_tools(method_executor, context):
    """Return LangChain tools for the assets category using auto-generation from metadata."""
    return generate_tools_for_category(
        category="assets",
        method_executor=method_executor,
        context=context,
        tool_definitions=ASSET_TOOL_DEFINITIONS,
    )
