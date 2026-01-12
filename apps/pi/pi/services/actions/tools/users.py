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
Users API tools for Plane user management operations.

MIGRATED TO AUTO-GENERATED TOOLS
Tool metadata defined in this file (USER_TOOL_DEFINITIONS) for modularity.
Old manual definitions kept below for comparison/rollback safety.
"""

from typing import Dict

from pi.services.actions.tool_generator import generate_tools_for_category
from pi.services.actions.tool_metadata import ToolMetadata

# Tool metadata for users category
USER_TOOL_DEFINITIONS: Dict[str, ToolMetadata] = {
    "get_current_user": ToolMetadata(
        name="users_get_current",
        description="Get current user information",
        sdk_method="get_current_user",
        parameters=[],
    ),
}


def get_user_tools(method_executor, context):
    """Return LangChain tools for the users category using auto-generation from metadata."""

    user_tools = generate_tools_for_category(
        category="users",
        method_executor=method_executor,
        context=context,
        tool_definitions=USER_TOOL_DEFINITIONS,
    )

    return user_tools


# ============================================================================
# OLD MANUAL TOOL DEFINITIONS (COMMENTED OUT - KEPT FOR COMPARISON)
# To rollback: uncomment below and comment out the auto-generation code above
# ============================================================================

# from langchain_core.tools import tool
# from .base import PlaneToolBase
#
# def get_user_tools(method_executor, context):
#     """Return LangChain tools for the users category using method_executor and context."""
#
#     @tool
#     async def users_get_current() -> Dict[str, Any]:
#         """Get current user information."""
#         result = await method_executor.execute("users", "get_current")
#         if result["success"]:
#             return PlaneToolBase.format_success_payload("Successfully retrieved current user", result["data"])
#         else:
#             return PlaneToolBase.format_error_payload("Failed to get current user", result["error"])
#
#     return [users_get_current]
