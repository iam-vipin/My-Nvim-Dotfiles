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
from plane.ee.views import (
    WorkspaceCredentialAPIView,
    WorkspaceConnectionAPIView,
    WorkspaceEntityConnectionAPIView,
    VerifyWorkspaceCredentialAPIView,
    WorkspaceUserConnectionAPIView,
)

urlpatterns = [
    # workspace credential url patterns
    path(
        "workspace-credentials/<uuid:pk>/",
        WorkspaceCredentialAPIView.as_view(),
        name="workspace-credential",
    ),
    path(
        "workspace-credentials/",
        WorkspaceCredentialAPIView.as_view(),
        name="workspace-credential",
    ),
    path(
        "workspace-credentials/<uuid:pk>/token-verify/",
        VerifyWorkspaceCredentialAPIView.as_view(),
        name="workspace-credential-token-verify",
    ),
    path(
        "workspace-credentials/token-verify/",
        VerifyWorkspaceCredentialAPIView.as_view(),
        name="workspace-credential-token-verify",
    ),
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
    # workspace entity connection url patterns
    path(
        "workspace-entity-connections/<uuid:pk>/",
        WorkspaceEntityConnectionAPIView.as_view(),
        name="workspace-entity-connection-detail",
    ),
    path(
        "workspace-entity-connections/",
        WorkspaceEntityConnectionAPIView.as_view(),
        name="workspace-entity-connection-detail",
    ),
]
