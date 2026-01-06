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
States API tools for Plane workflow state management.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing state actions


def get_state_tools(method_executor, context):
    """Return LangChain tools for the states category using method_executor and context."""

    @tool
    async def states_create(
        name: str,
        color: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        description: Optional[str] = None,
        group: Optional[str] = None,
        sequence: Optional[int] = None,
        is_triage: Optional[bool] = None,
        default: Optional[bool] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new workflow state.

        Args:
            name: State name (required)
            color: State color in hex format (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
            description: State description
            group: State group (backlog, unstarted, started, completed, cancelled)
            sequence: Display sequence order
            is_triage: Whether this is a triage state
            default: Whether this is the default state
            external_source: External source identifier (e.g., "jira")
            external_id: External system ID
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "states",
            "create",
            name=name,
            color=color,
            project_id=project_id,
            workspace_slug=workspace_slug,
            description=description,
            group=group,
            sequence=sequence,
            is_triage=is_triage,
            default=default,
            external_source=external_source,
            external_id=external_id,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url(f"Successfully created state '{name}'", result["data"], "state", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to create state", result["error"])

    @tool
    async def states_list(
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List all workflow states in a project."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "states",
            "list",
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved states list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list states", result["error"])

    @tool
    async def states_retrieve(
        state_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Retrieve details of a specific workflow state.

        Args:
            state_id: State ID (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute(
            "states",
            "retrieve",
            state_id=state_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )

        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved state details", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve state", result["error"])

    @tool
    async def states_update(
        state_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        name: Optional[str] = None,
        color: Optional[str] = None,
        description: Optional[str] = None,
        sequence: Optional[int] = None,
        group: Optional[str] = None,
        is_triage: Optional[bool] = None,
        default: Optional[bool] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update an existing workflow state.

        Args:
            state_id: State ID (required)
            name: New state name
            color: New state color
            description: New state description
            sequence: Display sequence order
            group: State group (backlog, unstarted, started, completed, cancelled)
            is_triage: Whether this is a triage state
            default: Whether this is the default state
            external_source: External source identifier (e.g., "jira")
            external_id: External system ID
            project_id: Project ID (required - provide from conversation context or previous actions)
            workspace_slug: Workspace slug (provide if known, otherwise auto-detected)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Build update data with only non-None values
        update_data = {
            k: v
            for k, v in {
                "name": name,
                "color": color,
                "description": description,
                "sequence": sequence,
                "group": group,
                "is_triage": is_triage,
                "default": default,
                "external_source": external_source,
                "external_id": external_id,
            }.items()
            if v is not None
        }

        result = await method_executor.execute(
            "states",
            "update",
            state_id=state_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
            **update_data,
        )

        if result["success"]:
            return await PlaneToolBase.format_success_payload_with_url(f"Successfully updated state '{state_id}'", result["data"], "state", context)
        else:
            return PlaneToolBase.format_error_payload("Failed to update state", result["error"])

    return [states_create, states_list, states_retrieve, states_update]
