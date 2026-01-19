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
from django.urls import path

# Module imports
from plane.silo.views import (
    WorkspaceConnectionAPIView,
    WorkspaceUserConnectionAPIView,
)

urlpatterns = [
    # workspace connections url patterns
    path(
        "workspace-connections/<uuid:pk>/",
        WorkspaceConnectionAPIView.as_view(),
        name="workspace-connection-detail",
    ),
    path(
        "workspace-connections/",
        WorkspaceConnectionAPIView.as_view(),
        name="workspace-connection-detail",
    ),
    # List all user-specific connections for a workspace
    path(
        "workspace-user-connections/",
        WorkspaceUserConnectionAPIView.as_view(),
        name="workspace-user-connections",
    ),
]
