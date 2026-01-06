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
from plane.ee.views.app.workflow import (
    WorkflowEndpoint,
    WorkflowActivityEndpoint,
    WorkflowTransitionEndpoint,
    WorkflowTransitionApproverEndpoint,
)


urlpatterns = [
    path(
        "workspaces/<str:slug>/workflow-states/",
        WorkflowEndpoint.as_view(),
        name="project-workflows",
    ),
    path(
        "workspaces/<str:slug>/workflow-states/<uuid:state_id>/",
        WorkflowEndpoint.as_view(),
        name="project-workflows",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/workflow-reset/",
        WorkflowEndpoint.as_view(),
        name="project-workflows",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/workflow-transitions/",
        WorkflowTransitionEndpoint.as_view(),
        name="workflow-transitions",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/workflow-transitions/<uuid:pk>/",
        WorkflowTransitionEndpoint.as_view(),
        name="workflow-transitions",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/workflow-transitions/<uuid:workflow_transition_id>/approvers/",
        WorkflowTransitionApproverEndpoint.as_view(),
        name="workflow-transition-approver",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/workflow-activity/",
        WorkflowActivityEndpoint.as_view(),
        name="workflow-activity",
    ),
]
