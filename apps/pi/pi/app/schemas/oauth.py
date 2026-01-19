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
Pydantic schemas for OAuth authentication endpoints
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel
from pydantic import Field


class OAuthInitiateRequest(BaseModel):
    """Request to initiate OAuth flow"""

    workspace_id: Optional[UUID] = Field(None, description="Target workspace ID (optional)")


class OAuthInitiateResponse(BaseModel):
    """Response containing authorization URL"""

    authorization_url: str = Field(description="URL to redirect user for authorization")
    state: str = Field(description="State parameter for security verification")


class OAuthCallbackRequest(BaseModel):
    """OAuth callback query parameters"""

    code: str = Field(description="Authorization code from Plane")
    state: str = Field(description="State parameter for verification")
    app_installation_id: Optional[str] = Field(None, description="App installation ID from Plane")


class OAuthCallbackResponse(BaseModel):
    """Response after successful OAuth completion"""

    success: bool = Field(description="Whether OAuth was successful")
    message: str = Field(description="Success or error message")
    workspace_slug: Optional[str] = Field(None, description="Connected workspace slug")
    workspace_name: Optional[str] = Field(None, description="Connected workspace name")


class OAuthStatusRequest(BaseModel):
    """Request to check OAuth status for workspace"""

    workspace_id: UUID = Field(description="Workspace ID to check")


class OAuthStatusResponse(BaseModel):
    """Response with OAuth authorization status"""

    is_authorized: bool = Field(description="Whether user has valid authorization for workspace")
    workspace_slug: Optional[str] = Field(None, description="Workspace slug if authorized")
    expires_at: Optional[str] = Field(None, description="Token expiry time (ISO format)")


class OAuthRevokeRequest(BaseModel):
    """Request to revoke OAuth authorization"""

    workspace_id: UUID = Field(description="Workspace ID to revoke authorization for")


class OAuthRevokeResponse(BaseModel):
    """Response after revoking authorization"""

    success: bool = Field(description="Whether revocation was successful")
    message: str = Field(description="Success or error message")
