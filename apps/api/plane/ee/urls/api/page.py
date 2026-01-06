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

from plane.ee.views.api.page import (
    ProjectPageAPIEndpoint,
    WikiBulkOperationAPIView,
    ProjectPageBulkOperationAPIView,
    TeamspacePageBulkOperationAPIView,
    ProjectPageDetailAPIEndpoint,
    WorkspacePageDetailAPIEndpoint,
    PublishedPageDetailAPIEndpoint,
    WorkspacePageAPIEndpoint,
)

urlpatterns = [
    # Workspace Page API Endpoints
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/pages/",
        ProjectPageAPIEndpoint.as_view(http_method_names=["post"]),
        name="project-page-create",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/pages/<uuid:pk>/",
        ProjectPageDetailAPIEndpoint.as_view(http_method_names=["get"]),
        name="project-page-detail",
    ),
    # Project Page API Endpoints
    path(
        "workspaces/<str:slug>/pages/",
        WorkspacePageAPIEndpoint.as_view(http_method_names=["post"]),
        name="workspace-page-create",
    ),
    path(
        "workspaces/<str:slug>/pages/bulk-operation/",
        WikiBulkOperationAPIView.as_view(),
        name="api-global-pages-bulk-operation",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/pages/bulk-operation/",
        ProjectPageBulkOperationAPIView.as_view(),
        name="api-project-pages-bulk-operation",
    ),
    path(
        "workspaces/<str:slug>/teamspaces/<uuid:team_space_id>/pages/bulk-operation/",
        TeamspacePageBulkOperationAPIView.as_view(),
        name="api-teamspace-pages-bulk-operation",
    ),
    path(
        "workspaces/<str:slug>/pages/<uuid:pk>/",
        WorkspacePageDetailAPIEndpoint.as_view(http_method_names=["get"]),
        name="workspace-page-detail",
    ),
    # space page api endpoints
    path(
        "public/anchor/<str:anchor>/pages/",
        PublishedPageDetailAPIEndpoint.as_view(http_method_names=["get"]),
        name="published-page-detail",
    ),
]
