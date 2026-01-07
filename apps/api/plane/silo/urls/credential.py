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
    WorkspaceCredentialAPIView,
    VerifyWorkspaceCredentialAPIView,
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
]
