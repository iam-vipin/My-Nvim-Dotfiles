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
    IntakeIssueListCreateAPIEndpoint,
    IntakeIssueDetailAPIEndpoint,
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/intake-issues/",
        IntakeIssueListCreateAPIEndpoint.as_view(http_method_names=["get", "post"]),
        name="intake-issue",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/intake-issues/<uuid:issue_id>/",
        IntakeIssueDetailAPIEndpoint.as_view(http_method_names=["get", "patch", "delete"]),
        name="intake-issue",
    ),
]
