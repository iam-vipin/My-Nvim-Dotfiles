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
    ModuleViewSet,
    ModuleIssueViewSet,
    ModuleLinkViewSet,
    ModuleFavoriteViewSet,
    ModuleUserPropertiesEndpoint,
    ModuleArchiveUnarchiveEndpoint,
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/",
        ModuleViewSet.as_view({"get": "list", "post": "create"}),
        name="project-modules",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:pk>/",
        ModuleViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="project-modules",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/issues/<uuid:issue_id>/modules/",
        ModuleIssueViewSet.as_view({"post": "create_issue_modules"}),
        name="issue-module",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/issues/",
        ModuleIssueViewSet.as_view({"post": "create_module_issues", "get": "list"}),
        name="project-module-issues",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/issues/<uuid:issue_id>/",
        ModuleIssueViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="project-module-issues",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/module-links/",
        ModuleLinkViewSet.as_view({"get": "list", "post": "create"}),
        name="project-issue-module-links",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/module-links/<uuid:pk>/",
        ModuleLinkViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="project-issue-module-links",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/user-favorite-modules/",
        ModuleFavoriteViewSet.as_view({"get": "list", "post": "create"}),
        name="user-favorite-module",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/user-favorite-modules/<uuid:module_id>/",
        ModuleFavoriteViewSet.as_view({"delete": "destroy"}),
        name="user-favorite-module",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/user-properties/",
        ModuleUserPropertiesEndpoint.as_view(),
        name="cycle-user-filters",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/archive/",
        ModuleArchiveUnarchiveEndpoint.as_view(),
        name="module-archive-unarchive",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/archived-modules/",
        ModuleArchiveUnarchiveEndpoint.as_view(),
        name="module-archive-unarchive",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/archived-modules/<uuid:pk>/",
        ModuleArchiveUnarchiveEndpoint.as_view(),
        name="module-archive-unarchive",
    ),
]
