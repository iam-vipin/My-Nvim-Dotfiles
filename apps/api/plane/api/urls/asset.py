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
    UserAssetEndpoint,
    UserServerAssetEndpoint,
    GenericAssetEndpoint,
)

urlpatterns = [
    path(
        "assets/user-assets/",
        UserAssetEndpoint.as_view(http_method_names=["post"]),
        name="user-assets",
    ),
    path(
        "assets/user-assets/<uuid:asset_id>/",
        UserAssetEndpoint.as_view(http_method_names=["patch", "delete"]),
        name="user-assets-detail",
    ),
    path(
        "assets/user-assets/server/",
        UserServerAssetEndpoint.as_view(http_method_names=["post"]),
        name="user-server-assets",
    ),
    path(
        "assets/user-assets/<uuid:asset_id>/server/",
        UserServerAssetEndpoint.as_view(http_method_names=["patch", "delete"]),
        name="user-server-assets-detail",
    ),
    path(
        "workspaces/<str:slug>/assets/",
        GenericAssetEndpoint.as_view(http_method_names=["post"]),
        name="generic-asset",
    ),
    path(
        "workspaces/<str:slug>/assets/<uuid:asset_id>/",
        GenericAssetEndpoint.as_view(http_method_names=["get", "patch"]),
        name="generic-asset-detail",
    ),
]
