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
    EpicPropertyEndpoint,
    EpicPropertyOptionEndpoint,
    EpicPropertyValueEndpoint,
    EpicPropertyActivityEndpoint,
)

urlpatterns = [
    # Epic properties
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epic-properties/",
        EpicPropertyEndpoint.as_view(),
        name="epic-properties",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epic-properties/<uuid:pk>/",
        EpicPropertyEndpoint.as_view(),
        name="epic-properties",
    ),
    # End of Epic properties
    # Epic property options
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epic-property-options/",
        EpicPropertyOptionEndpoint.as_view(),
        name="epic-property-options",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epic-properties/<uuid:epic_property_id>/options/",
        EpicPropertyOptionEndpoint.as_view(),
        name="epic-property-options",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epic-properties/<uuid:epic_property_id>/options/<uuid:pk>/",
        EpicPropertyOptionEndpoint.as_view(),
        name="epic-property-options",
    ),
    # Epic property values
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epics/<uuid:epic_id>/values/",
        EpicPropertyValueEndpoint.as_view(),
        name="epic-property-values",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epics/<uuid:epic_id>/values/<uuid:pk>/",
        EpicPropertyValueEndpoint.as_view(),
        name="epic-property-values",
    ),
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epics/<uuid:epic_id>/epic-properties/<uuid:property_id>/values/",
        EpicPropertyValueEndpoint.as_view(),
        name="epic-property-values",
    ),
    ## Epic property activity
    path(
        "workspaces/<str:slug>/projects/<uuid:project_id>/epics/<uuid:epic_id>/property-activity/",
        EpicPropertyActivityEndpoint.as_view(),
        name="epic-property-activity",
    ),
]
