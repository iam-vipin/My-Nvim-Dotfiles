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
    ImportAssetEndpoint,
)

urlpatterns = [
    path(
        "workspaces/<str:slug>/import-assets/",
        ImportAssetEndpoint.as_view(http_method_names=["post"]),
        name="generic-asset",
    ),
    path(
        "workspaces/<str:slug>/import-assets/<uuid:asset_id>/",
        ImportAssetEndpoint.as_view(http_method_names=["get", "patch"]),
        name="generic-asset-detail",
    ),
]
