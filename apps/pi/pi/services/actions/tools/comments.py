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
Comments API tools for Plane issue comments operations.
"""

import uuid
from typing import Any
from typing import Dict
from typing import Optional

from langchain_core.tools import tool

from pi.config import settings

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing comment actions


def get_comment_tools(method_executor, context):
    """Return LangChain tools for the comments category using method_executor and context."""

    async def _build_issue_entity(issue_id: str, comment_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Build entity payload for comment actions.

        - entity_url points to the parent issue (workitem) URL
        - entity_type is "comment"
        - entity_id is the comment_id when available (update/delete always, create best-effort)
        - entity_name is left null for now (TODO)
        """
        try:
            workspace_slug = context.get("workspace_slug") if isinstance(context, dict) else None
            if not workspace_slug:
                return None
            from pi.agents.sql_agent.tools import construct_action_entity_url

            url_info = await construct_action_entity_url({"id": str(issue_id)}, "workitem", workspace_slug, settings.plane_api.FRONTEND_URL)
            if not url_info or not isinstance(url_info, dict):
                return None
            # Normalize expected keys for execute-action consumers
            issue_identifier = url_info.get("issue_identifier")
            entity: Dict[str, Any] = {
                "entity_url": url_info.get("entity_url"),
                "entity_name": None,
                "entity_type": "comment",
                "entity_id": str(comment_id) if comment_id else None,
            }
            if issue_identifier:
                entity["issue_identifier"] = issue_identifier
                entity["entity_identifier"] = issue_identifier
            return entity
        except Exception:
            return None

    @tool
    async def comments_create(
        issue_id: str,
        comment_html: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a comment on an issue.

        Args:
            issue_id: Issue ID (required)
            comment_html: Comment content in HTML format (required)
            project_id: Project ID (optional, auto-filled from context or resolved from issue_id)
            workspace_slug: Workspace slug (optional, auto-filled from context)
            external_source: External source identifier (e.g., "jira")
            external_id: External system ID
        """
        print(f"Context in comments_create: {context}")
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Note: issue_id and project_id validation/resolution is handled centrally
        # in action_execution_helpers.validate_and_resolve_ids() before tool execution

        result = await method_executor.execute(
            "comments",
            "create",
            issue_id=issue_id,
            comment_html=comment_html,
            external_source=external_source,
            external_id=external_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            created_comment_id = None
            try:
                data = result.get("data") if isinstance(result, dict) else None
                if isinstance(data, dict) and data.get("id"):
                    created_comment_id = str(data["id"])
            except Exception:
                created_comment_id = None
            entity = await _build_issue_entity(issue_id, comment_id=created_comment_id)
            return PlaneToolBase.format_success_payload("Successfully created comment", result["data"], entity=entity)
        else:
            return PlaneToolBase.format_error_payload("Failed to create comment", result["error"])

    @tool
    async def comments_list(issue_id: str, project_id: Optional[str] = None, workspace_slug: Optional[str] = None) -> Dict[str, Any]:
        """List comments for an issue."""
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        result = await method_executor.execute("comments", "list", issue_id=issue_id, project_id=project_id, workspace_slug=workspace_slug)
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved comments list", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to list comments", result["error"])

    @tool
    async def comments_retrieve(
        comment_id: str,
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get a single comment by ID.

        Args:
            comment_id: Comment ID (required)
            issue_id: Issue ID (required)
            project_id: Project ID (optional, auto-filled from context or resolved from issue_id)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Programmatically resolve project_id from issue_id if missing or invalid (non-UUID)
        should_resolve = False
        if issue_id and not project_id:
            should_resolve = True
        elif issue_id and project_id:
            try:
                uuid.UUID(str(project_id))
            except (ValueError, AttributeError):
                should_resolve = True

        if should_resolve:
            try:
                from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                issue_info = await get_issue_identifier_for_artifact(str(issue_id))
                if issue_info and issue_info.get("project_id"):
                    project_id = issue_info["project_id"]
            except Exception:
                pass

        result = await method_executor.execute(
            "comments",
            "retrieve",
            comment_id=comment_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved comment", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to retrieve comment", result["error"])

    @tool
    async def comments_update(
        comment_id: str,
        issue_id: str,
        comment_html: Optional[str] = None,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
        external_source: Optional[str] = None,
        external_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update comment details.

        Args:
            comment_id: Comment ID (required)
            issue_id: Issue ID (required)
            comment_html: Comment content in HTML format
            project_id: Project ID (optional, auto-filled from context or resolved from issue_id)
            workspace_slug: Workspace slug (optional, auto-filled from context)
            external_source: External source identifier (e.g., "jira")
            external_id: External system ID
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Programmatically resolve project_id from issue_id if missing or invalid (non-UUID)
        should_resolve = False
        if issue_id and not project_id:
            should_resolve = True
        elif issue_id and project_id:
            try:
                uuid.UUID(str(project_id))
            except (ValueError, AttributeError):
                should_resolve = True

        if should_resolve:
            try:
                from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                issue_info = await get_issue_identifier_for_artifact(str(issue_id))
                if issue_info and issue_info.get("project_id"):
                    project_id = issue_info["project_id"]
            except Exception:
                pass

        result = await method_executor.execute(
            "comments",
            "update",
            comment_id=comment_id,
            issue_id=issue_id,
            comment_html=comment_html,
            external_source=external_source,
            external_id=external_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            entity = await _build_issue_entity(issue_id, comment_id=comment_id)
            return PlaneToolBase.format_success_payload("Successfully updated comment", result["data"], entity=entity)
        else:
            return PlaneToolBase.format_error_payload("Failed to update comment", result["error"])

    @tool
    async def comments_delete(
        comment_id: str,
        issue_id: str,
        project_id: Optional[str] = None,
        workspace_slug: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Delete a comment.

        Args:
            comment_id: Comment ID (required)
            issue_id: Issue ID (required)
            project_id: Project ID (optional, auto-filled from context or resolved from issue_id)
            workspace_slug: Workspace slug (optional, auto-filled from context)
        """
        # Auto-fill from context if not provided
        if workspace_slug is None and "workspace_slug" in context:
            workspace_slug = context["workspace_slug"]
        if project_id is None and "project_id" in context:
            project_id = context["project_id"]

        # Programmatically resolve project_id from issue_id if missing or invalid (non-UUID)
        should_resolve = False
        if issue_id and not project_id:
            should_resolve = True
        elif issue_id and project_id:
            try:
                uuid.UUID(str(project_id))
            except (ValueError, AttributeError):
                should_resolve = True

        if should_resolve:
            try:
                from pi.app.api.v1.helpers.plane_sql_queries import get_issue_identifier_for_artifact

                issue_info = await get_issue_identifier_for_artifact(str(issue_id))
                if issue_info and issue_info.get("project_id"):
                    project_id = issue_info["project_id"]
            except Exception:
                pass

        result = await method_executor.execute(
            "comments",
            "delete",
            comment_id=comment_id,
            issue_id=issue_id,
            project_id=project_id,
            workspace_slug=workspace_slug,
        )
        if result["success"]:
            entity = await _build_issue_entity(issue_id, comment_id=comment_id)
            return PlaneToolBase.format_success_payload("Successfully deleted comment", result["data"], entity=entity)
        else:
            return PlaneToolBase.format_error_payload("Failed to delete comment", result["error"])

    return [comments_create, comments_list, comments_retrieve, comments_update, comments_delete]
