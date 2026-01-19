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
from plane.ee.views import (
    ViewsPublicEndpoint,
    IssueViewsPublicEndpoint,
    ViewsMetaDataEndpoint,
)

urlpatterns = [
    path(
        "anchor/<str:anchor>/views/meta/",
        ViewsMetaDataEndpoint.as_view(),
        name="views-public-meta",
    ),
    path("anchor/<str:anchor>/views/", ViewsPublicEndpoint.as_view(), name="views-public"),
    path(
        "anchor/<str:anchor>/view-issues/",
        IssueViewsPublicEndpoint.as_view(),
        name="view-issues-public",
    ),
]
