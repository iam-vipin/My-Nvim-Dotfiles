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

# Django imports
from django.urls import path, include

# Third party imports
from rest_framework.routers import DefaultRouter

# Module imports
from plane.api.views import WorkspaceInvitationsViewset


# Create router with just the invitations prefix (no workspace slug)
router = DefaultRouter()
router.register(r"invitations", WorkspaceInvitationsViewset, basename="workspace-invitations")

# Wrap the router URLs with the workspace slug path
urlpatterns = [
    path("workspaces/<str:slug>/", include(router.urls)),
]
