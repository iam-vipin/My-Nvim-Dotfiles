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
from plane.silo.views import (
    WorkspaceEntityConnectionAPIView,
)

# workspace entity connection url patterns
urlpatterns = [
    path(
        "workspace-entity-connections/<uuid:pk>/",
        WorkspaceEntityConnectionAPIView.as_view(),
        name="workspace-entity-connection-detail",
    ),
    path(
        "workspace-entity-connections/",
        WorkspaceEntityConnectionAPIView.as_view(),
        name="workspace-entity-connection-detail",
    ),
]
