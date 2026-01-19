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

from plane.ee.views.app import (
    MilestoneViewSet,
    MilestoneWorkItemsEndpoint,
    MilestoneWorkItemsSearchEndpoint,
    WorkItemMilestoneEndpoint,
)

urlpatterns = [
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/milestones/",
        MilestoneViewSet.as_view({"get": "list", "post": "create"}),
        name="project-milestones",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/milestones/<uuid:milestone_id>/work-items/",
        MilestoneWorkItemsEndpoint.as_view(),
        name="project-milestone-work-items",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/milestones/work-items/search/",
        MilestoneWorkItemsSearchEndpoint.as_view(),
        name="project-milestone-work-items-search",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/work-items/<uuid:work_item_id>/milestone/",
        WorkItemMilestoneEndpoint.as_view(),
        name="project-milestone-update-work-item-milestone",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/milestones/<uuid:pk>/",
        MilestoneViewSet.as_view(
            {
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="project-milestone",
    ),
]
