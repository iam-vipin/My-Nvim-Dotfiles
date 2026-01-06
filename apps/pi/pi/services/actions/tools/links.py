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
Links API tools for Plane issue link management.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing link actions


def get_link_tools(method_executor, context):
    """Return LangChain tools for the links category using method_executor and context."""

    @tool
    async def links_create(
        issue_id: str,
        url: str,
        title: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a link for an issue.

        Args:
            issue_id: UUID of the work item to create a link for (required)
            url: The URL of the link (required)
            title: Optional title/label for the link
            project_id: UUID of the project (optional, auto-filled from context)
            workspace_slug: Workspace slug identifier (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "links",
            "create",
            issue_id=issue_id,
            url=url,
            title=title,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully created link", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to create link", result["error"])

    @tool
    async def links_list(issue_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """List links for an issue."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("links", "list", issue_id=issue_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved links list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list links", result["error"])

    @tool
    async def links_retrieve(
        link_id: str,
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get a single link by ID.

        Args:
            link_id: UUID of the link to retrieve (required)
            issue_id: UUID of the work item the link belongs to (required)
            project_id: UUID of the project (optional, auto-filled from context)
            workspace_slug: Workspace slug identifier (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "links",
            "retrieve",
            link_id=link_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved link", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve link", result["error"])

    @tool
    async def links_update(
        link_id: str,
        issue_id: str,
        url: Optional[str] = None,
        title: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update link details.

        Args:
            link_id: UUID of the link to update (required)
            issue_id: UUID of the work item the link belongs to (required)
            url: New URL for the link (optional)
            title: New title/label for the link (optional)
            project_id: UUID of the project (optional, auto-filled from context)
            workspace_slug: Workspace slug identifier (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data
        update_data = {}
        if url is not None:
            update_data["url"] = url
        if title is not None:
            update_data["title"] = title

        result = await method_executor.execute(
            "links",
            "update",
            link_id=link_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully updated link", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to update link", result["error"])

    @tool
    async def links_delete(
        link_id: str,
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Delete a link.

        Args:
            link_id: UUID of the link to delete (required)
            issue_id: UUID of the work item the link belongs to (required)
            project_id: UUID of the project (optional, auto-filled from context)
            workspace_slug: Workspace slug identifier (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "links",
            "delete",
            link_id=link_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully deleted link", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to delete link", result["error"])

    return [links_create, links_list, links_retrieve, links_update, links_delete]
