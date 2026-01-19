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


from plane.space.views import (
    IntakeIssuePublicViewSet,
    WorkspaceProjectDeployBoardEndpoint,
)


urlpatterns = [
    path(
        "anchor/<str:anchor>/intakes/<uuid:intake_id>/intake-issues/",
        IntakeIssuePublicViewSet.as_view({"get": "list", "post": "create"}),
        name="intake-issue",
    ),
    path(
        "anchor/<str:anchor>/intakes/<uuid:intake_id>/inbox-issues/",
        IntakeIssuePublicViewSet.as_view({"get": "list", "post": "create"}),
        name="inbox-issue",
    ),
    path(
        "anchor/<str:anchor>/intakes/<uuid:intake_id>/intake-issues/<uuid:pk>/",
        IntakeIssuePublicViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="intake-issue",
    ),
    path(
        "workspaces/<str:slug>/project-boards/",
        WorkspaceProjectDeployBoardEndpoint.as_view(),
        name="workspace-project-boards",
    ),
]
