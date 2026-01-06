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


from plane.app.views import (
    CycleViewSet,
    CycleIssueViewSet,
    CycleDateCheckEndpoint,
    CycleFavoriteViewSet,
    CycleProgressEndpoint,
    CycleAnalyticsEndpoint,
    TransferCycleIssueEndpoint,
    CycleUserPropertiesEndpoint,
    CycleArchiveUnarchiveEndpoint,
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/",
        CycleViewSet.as_view({"get": "list", "post": "create"}),
        name="project-cycle",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:pk>/",
        CycleViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="project-cycle",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:cycle_id>/cycle-issues/",
        CycleIssueViewSet.as_view({"get": "list", "post": "create"}),
        name="project-issue-cycle",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:cycle_id>/cycle-issues/<uuid:issue_id>/",
        CycleIssueViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="project-issue-cycle",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/date-check/",
        CycleDateCheckEndpoint.as_view(),
        name="project-cycle-date",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/user-favorite-cycles/",
        CycleFavoriteViewSet.as_view({"get": "list", "post": "create"}),
        name="user-favorite-cycle",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/user-favorite-cycles/<uuid:cycle_id>/",
        CycleFavoriteViewSet.as_view({"delete": "destroy"}),
        name="user-favorite-cycle",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:cycle_id>/transfer-issues/",
        TransferCycleIssueEndpoint.as_view(),
        name="transfer-issues",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:cycle_id>/user-properties/",
        CycleUserPropertiesEndpoint.as_view(),
        name="cycle-user-filters",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:cycle_id>/archive/",
        CycleArchiveUnarchiveEndpoint.as_view(),
        name="cycle-archive-unarchive",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/archived-cycles/",
        CycleArchiveUnarchiveEndpoint.as_view(),
        name="cycle-archive-unarchive",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/archived-cycles/<uuid:pk>/",
        CycleArchiveUnarchiveEndpoint.as_view(),
        name="cycle-archive-unarchive",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:cycle_id>/progress/",
        CycleProgressEndpoint.as_view(),
        name="project-cycle",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/cycles/<uuid:cycle_id>/analytics/",
        CycleAnalyticsEndpoint.as_view(),
        name="project-cycle",
    ),
]
