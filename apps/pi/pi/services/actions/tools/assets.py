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

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing asset actions


def get_asset_tools(method_executor, context):
    """Return LangChain tools for the assets category using method_executor and context."""

    @tool
    async def assets_create(project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Create a new generic asset.

        Args:
            project_id: Parameter description (optional)
            workspace_slug: Parameter description (optional)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "create", project_id=project_id, workspace_slug=workspace_slug, **kwargs)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully created asset", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create asset", result["error"])

    @tool
    async def assets_create_user_upload(project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Upload user-specific assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "create_user_upload", project_id=project_id, workspace_slug=workspace_slug, **kwargs)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully created user asset upload", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create user asset upload", result["error"])

    @tool
    async def assets_get_generic(
        asset_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve generic assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "get_generic", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved generic asset", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to get generic asset", result["error"])

    @tool
    async def assets_update_generic(
        asset_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:
        """Update generic assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "assets", "update_generic", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug, **kwargs
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully updated generic asset", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to update generic asset", result["error"])

    @tool
    async def assets_update_user(asset_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Update user assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "assets", "update_user", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug, **kwargs
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully updated user asset", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to update user asset", result["error"])

    @tool
    async def assets_delete_user(
        asset_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Delete user assets."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("assets", "delete_user", asset_id=asset_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully deleted user asset", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to delete user asset", result["error"])

    return [assets_create, assets_create_user_upload, assets_get_generic, assets_update_generic, assets_update_user, assets_delete_user]
