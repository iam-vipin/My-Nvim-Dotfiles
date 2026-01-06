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
from plane.ee.views.app.issue_property import DraftIssuePropertyValueEndpoint

urlpatterns = [
    # Issue property values
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/draft-issues/<uuid:draft_issue_id>/values/",
        DraftIssuePropertyValueEndpoint.as_view(),
        name="draft-issue-property-values",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/draft-issues/<uuid:draft_issue_id>/values/<uuid:pk>/",
        DraftIssuePropertyValueEndpoint.as_view(),
        name="draft-issue-property-values",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/draft-issues/<uuid:draft_issue_id>/issue-properties/<uuid:property_id>/values/",
        DraftIssuePropertyValueEndpoint.as_view(),
        name="draft-issue-property-values",
    ),
]
