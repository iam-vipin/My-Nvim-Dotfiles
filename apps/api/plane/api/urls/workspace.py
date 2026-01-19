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

from django.urls import path

from plane.api.views import (
    WorkspaceFeatureAPIEndpoint,
    WorkspacePageDetailAPIEndpoint,
    WorkspacePageAPIEndpoint,
)

workspace_patterns = [
    path(
        "workspaces/<str:slug>/features/",
        WorkspaceFeatureAPIEndpoint.as_view(),
        name="workspace-features",
    ),
]

workspace_page_patterns = [
    path(
        "workspaces/<str:slug>/pages/",
        WorkspacePageAPIEndpoint.as_view(),
        name="workspace-pages",
    ),
    path(
        "workspaces/<str:slug>/pages/<uuid:pk>/",
        WorkspacePageDetailAPIEndpoint.as_view(),
        name="workspace-page-detail",
    ),
]


urlpatterns = [
    *workspace_patterns,
    *workspace_page_patterns,
]
