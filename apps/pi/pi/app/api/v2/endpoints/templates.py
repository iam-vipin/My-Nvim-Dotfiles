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

from typing import Optional

from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from pydantic import UUID4

from pi import logger
from pi.app.api.dependencies import get_current_user
from pi.app.schemas.chat import ChatSuggestionTemplate
from pi.services.chat.templates import tiles_factory

log = logger.getChild("v2.templates")
router = APIRouter()


@router.get("/", response_model=ChatSuggestionTemplate)
async def list_templates(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    """
    Get chat suggestion templates for the workspace.

    This endpoint returns pre-defined chat templates (tiles) that users can use
    as conversation starters. These templates provide quick-start suggestions for
    common queries and actions, improving user experience and discoverability.

    Templates are context-aware and can be filtered by workspace to show only
    relevant suggestions for that workspace's configuration and capabilities.

    Args:
        workspace_id: Optional UUID of workspace for context-specific templates
        workspace_slug: Optional slug of workspace for context-specific templates
        session: Session cookie for authentication

    Returns:
        ChatSuggestionTemplate containing:
        - templates: List of suggestion objects with:
            - title: Template title
            - description: Template description
            - prompt: Pre-filled prompt text
            - icon: Template icon/emoji
            - category: Template category

    Status Codes:
        - 200: Templates retrieved successfully
        - 401: Invalid or missing authentication
        - 500: Internal server error

    Example Response:
        {
            "templates": [
                {
                    "title": "Summarize Issues",
                    "description": "Get a summary of open issues",
                    "prompt": "Can you summarize all open issues in this project?",
                    "icon": "📝",
                    "category": "analysis"
                },
                {
                    "title": "Find Bugs",
                    "description": "Search for bug reports",
                    "prompt": "Show me all bugs reported in the last week",
                    "icon": "🐛",
                    "category": "search"
                }
            ]
        }

    Use Cases:
        - Display suggestion tiles in chat UI
        - Provide quick-start options for new users
        - Context-aware conversation starters
        - Improve feature discoverability
    """

    try:
        suggestions = tiles_factory()
        return ChatSuggestionTemplate(templates=suggestions)
    except Exception as e:
        log.error(f"An unexpected error occurred: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
