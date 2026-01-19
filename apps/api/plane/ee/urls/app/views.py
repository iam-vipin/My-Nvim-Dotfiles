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


from plane.ee.views import (
    IssueViewEEViewSet,
    WorkspaceViewEEViewSet,
    IssueViewsPublishEndpoint,
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/views/<uuid:pk>/access/",
        WorkspaceViewEEViewSet.as_view({"post": "access"}),
        name="workspace-views-access",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/views/<uuid:pk>/access/",
        IssueViewEEViewSet.as_view({"post": "access"}),
        name="project-views-access",
    ),
    # lock and unlock
    path(
        "workspaces/<str:slug>/views/<uuid:pk>/lock/",
        WorkspaceViewEEViewSet.as_view({"post": "lock", "delete": "unlock"}),
        name="workspace-views-lock-unlock",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/views/<uuid:pk>/lock/",
        IssueViewEEViewSet.as_view({"post": "lock", "delete": "unlock"}),
        name="project-views-lock-unlock",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/views/<uuid:pk>/publish/",
        IssueViewsPublishEndpoint.as_view(),
    ),
]
