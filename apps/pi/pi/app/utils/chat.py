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
Chat utility functions for validation and common operations.
"""

from typing import Any

from pi.app.schemas.chat import ChatInitializationRequest
from pi.app.schemas.chat import ChatRequest


def validate_chat_request(data: ChatRequest) -> dict[str, Any] | None:
    """
    Validate chat request data and return error details if invalid.

    Args:
        data: ChatRequest object to validate

    Returns:
        dict with error details if validation fails, None if valid
    """
    # Validate workspace context requirements
    if data.workspace_in_context and not (data.workspace_id or data.project_id):
        return {"status_code": 400, "detail": "Either project_id or workspace_id must be provided"}

    # For new chats in the main endpoint, chat_id must be provided
    if data.is_new and not data.chat_id:
        return {"status_code": 400, "detail": "chat_id is required for new chats. Call /initialize-chat/ first."}

    return None


def validate_chat_initialization(data: ChatInitializationRequest) -> dict[str, Any] | None:
    """
    Validate chat initialization request.

    Args:
        data: ChatInitializationRequest object to validate

    Returns:
        dict with error details if validation fails, None if valid
    """
    # Validate workspace context requirements
    if data.workspace_in_context and not (data.workspace_id or data.project_id):
        return {"status_code": 400, "detail": "Either project_id or workspace_id must be provided"}

    return None
