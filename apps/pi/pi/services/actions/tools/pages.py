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
Pages API tools for Plane documentation and page management operations.
"""

from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing pages actions


def get_page_tools(method_executor, context):
    """Return LangChain tools for the pages category using method_executor and context."""

    # Check if we're in a project-specific context
    is_project_chat = context.get("is_project_chat", False)

    @tool
    async def pages_create_project_page(
        name: str,
        project_id: Optional[str] = None,
        description_html: Optional[str] = None,
        access: Optional[int] = None,
        color: Optional[str] = None,
        logo_props: Optional[dict] = None,
    ) -> Dict[str, Any]:
        """Create a new page in a project.

        Args:
            name: Page title (required)
            project_id: Project ID (required - provide from conversation context or previous actions)
            description_html: Page content in HTML format. If the user asks for "details about X", generate relevant content. Use empty string if no content is needed. (optional, defaults to empty string)
            access: Access level - 0 for public, 1 for private (optional, if not specified the API will use its default)
            color: Page color in hex format like #3B82F6 (optional)
            logo_props: Logo properties dict with keys like name, color, type (optional)

        Returns:
            Success message with page details and URL information
        """  # noqa E501
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # Auto-fill project_id from context if not provided
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # CRITICAL: Provide default empty string if description_html is None
        # The Plane API requires this field even if empty
        if not description_html:
            description_html = name

        result = await method_executor.execute(
            "pages",
            "create_project_page",
            name=name,
            project_id=project_id,
            workspace_slug=workspace_slug,
            description_html=description_html,
            access=access,
            color=color,
            logo_props=logo_props,
        )

        if result.get("success"):
            data = result.get("data", {})
            # CRITICAL: Inject project into response data for URL construction
            # The API response doesn't include project field, so we need to add it
            # Using "project" not "project_id" because extract_entity_from_api_response looks for "project"
            if project_id:
                data["project"] = project_id
            return await PlaneToolBase.format_success_payload_with_url(f"Project page '{name}' created successfully", data, "page", context)
        else:
            error_msg = result.get("error", "Unknown error occurred")
            return PlaneToolBase.format_error_payload("Failed to create project page", error_msg)

    @tool
    async def pages_create_workspace_page(
        name: str,
        description_html: Optional[str] = None,
        access: Optional[int] = None,
        color: Optional[str] = None,
        logo_props: Optional[dict] = None,
    ) -> Dict[str, Any]:
        """Create a new page in the workspace.

        Args:
            name: Page title (required)
            description_html: Page content in HTML format. If the user asks for "details about X", generate relevant content. Use empty string if no content is needed. (optional, defaults to empty string)
            access: Access level - 0 for public, 1 for private (optional, if not specified the API will use its default)
            color: Page color in hex format like #10B981 (optional)
            logo_props: Logo properties dict with keys like name, color, type (optional)

        Returns:
            Success message with page details and URL information
        """  # noqa E501
        # Auto-fill workspace_slug from context (hidden from LLM)
        workspace_slug = context.get("workspace_slug")

        # CRITICAL: Provide default empty string if description_html is None
        # The Plane API requires this field even if empty
        if not description_html:
            description_html = name

        result = await method_executor.execute(
            "pages",
            "create_workspace_page",
            name=name,
            workspace_slug=workspace_slug,
            description_html=description_html,
            access=access,
            color=color,
            logo_props=logo_props,
        )

        if result.get("success"):
            data = result.get("data", {})
            return await PlaneToolBase.format_success_payload_with_url(f"Workspace page '{name}' created successfully", data, "page", context)
        else:
            error_msg = result.get("error", "Unknown error occurred")
            return PlaneToolBase.format_error_payload("Failed to create workspace page", error_msg)

    # In workspace/global context, expose a single tool that forces clarification for scope
    @tool
    async def pages_create_page(
        name: str,
        project_id: str,
        description_html: Optional[str] = None,
        access: Optional[int] = None,
        color: Optional[str] = None,
        logo_props: Optional[dict] = None,
    ) -> Dict[str, Any]:
        """Create a new page either in a project or at the workspace level.

        Args:
            name: Page title (required)
            project_id: Project UUID where the page should be created. If user hasn't specified a project, leave this empty or use 'NEEDS_CLARIFICATION' to trigger project selection. (required)
            description_html: Page content in HTML format. If the user asks for "details about X", generate relevant content. Use empty string if no content is needed. (optional, defaults to empty string)
            access: Access level - 0 for public, 1 for private (optional)
            color: Page color in hex format (optional)
            logo_props: Logo properties dict with keys like name, color, type (optional)
        """  # noqa E501
        workspace_slug = context.get("workspace_slug")

        # CRITICAL: Provide default empty string if description_html is None
        # The Plane API requires this field even if empty
        if not description_html:
            description_html = name

        if project_id == "__workspace_scope__":
            # Create at workspace level
            result = await method_executor.execute(
                "pages",
                "create_workspace_page",
                name=name,
                workspace_slug=workspace_slug,
                description_html=description_html,
                access=access,
                color=color,
                logo_props=logo_props,
            )
            scope_label = "Workspace"
        else:
            # Create in a specific project
            result = await method_executor.execute(
                "pages",
                "create_project_page",
                name=name,
                project_id=project_id,
                workspace_slug=workspace_slug,
                description_html=description_html,
                access=access,
                color=color,
                logo_props=logo_props,
            )
            scope_label = "Project"

        if result.get("success"):
            data = result.get("data", {})
            # CRITICAL: Inject project into response data for URL construction
            # The API response doesn't include project field, so we need to add it
            # Using "project" not "project_id" because extract_entity_from_api_response looks for "project"
            # for the URL builder to construct the correct project page URL
            if scope_label == "Project" and project_id != "__workspace_scope__":
                data["project"] = project_id
            return await PlaneToolBase.format_success_payload_with_url(f"{scope_label} page '{name}' created successfully", data, "page", context)
        else:
            error_msg = result.get("error", "Unknown error occurred")
            return PlaneToolBase.format_error_payload(f"Failed to create {scope_label.lower()} page", error_msg)

    # Return tools based on context:
    # - In project chat: only project pages (workspace pages are not accessible in project UI)
    # - In workspace/global chat: consolidated tool that requires scope selection via clarification

    if is_project_chat:
        return [pages_create_project_page]
    else:
        return [pages_create_page]
