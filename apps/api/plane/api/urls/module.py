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
    ModuleListCreateAPIEndpoint,
    ModuleDetailAPIEndpoint,
    ModuleIssueListCreateAPIEndpoint,
    ModuleIssueDetailAPIEndpoint,
    ModuleArchiveUnarchiveAPIEndpoint,
)

urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/",
        ModuleListCreateAPIEndpoint.as_view(http_method_names=["get", "post"]),
        name="modules",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:pk>/",
        ModuleDetailAPIEndpoint.as_view(http_method_names=["get", "patch", "delete"]),
        name="modules-detail",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/module-issues/",
        ModuleIssueListCreateAPIEndpoint.as_view(http_method_names=["get", "post"]),
        name="module-issues",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:module_id>/module-issues/<uuid:issue_id>/",
        ModuleIssueDetailAPIEndpoint.as_view(http_method_names=["delete"]),
        name="module-issues-detail",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/modules/<uuid:pk>/archive/",
        ModuleArchiveUnarchiveAPIEndpoint.as_view(http_method_names=["post"]),
        name="module-archive",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/archived-modules/",
        ModuleArchiveUnarchiveAPIEndpoint.as_view(http_method_names=["get"]),
        name="module-archive-list",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/archived-modules/<uuid:pk>/unarchive/",
        ModuleArchiveUnarchiveAPIEndpoint.as_view(http_method_names=["delete"]),
        name="module-unarchive",
    ),
]
