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

"""Mobile-specific API endpoints for v2.

This package contains mobile-optimized versions of API endpoints that use
JWT authentication instead of cookie-based authentication, making them suitable
for mobile applications (iOS, Android, React Native, etc.).

The mobile endpoints follow the same RESTful design principles as the web
endpoints but are tailored for mobile app use cases:
- JWT token authentication (Authorization: Bearer <token>)
- Optimized response formats for mobile bandwidth
- Mobile-specific error handling
- Support for mobile file upload patterns
- Streaming responses for chat
"""

from fastapi import APIRouter

from pi.app.api.v2.endpoints.mobile import attachments
from pi.app.api.v2.endpoints.mobile import chats
from pi.app.api.v2.endpoints.mobile import responses
from pi.app.api.v2.endpoints.mobile import transcriptions

# Create a mobile-specific router
mobile_router = APIRouter()

# Include all mobile endpoints with appropriate prefixes and tags
mobile_router.include_router(
    chats.router,
    prefix="/chats",
    tags=["mobile", "chats"],
)

mobile_router.include_router(
    responses.router,
    prefix="/responses",
    tags=["mobile", "responses"],
)

mobile_router.include_router(
    transcriptions.router,
    prefix="/transcriptions",
    tags=["mobile", "transcriptions"],
)

mobile_router.include_router(
    attachments.router,
    prefix="/attachments",
    tags=["mobile", "attachments"],
)

__all__ = [
    "mobile_router",
    "chats",
    "responses",
    "transcriptions",
    "attachments",
]
