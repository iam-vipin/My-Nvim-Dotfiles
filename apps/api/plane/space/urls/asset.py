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
from plane.space.views import (
    EntityAssetEndpoint,
    AssetRestoreEndpoint,
    EntityBulkAssetEndpoint,
)

urlpatterns = [
    path(
        "assets/v2/anchor/<str:anchor>/",
        EntityAssetEndpoint.as_view(),
        name="entity-asset",
    ),
    path(
        "assets/v2/anchor/<str:anchor>/<uuid:pk>/",
        EntityAssetEndpoint.as_view(),
        name="entity-asset",
    ),
    path(
        "assets/v2/anchor/<str:anchor>/restore/<uuid:pk>/",
        AssetRestoreEndpoint.as_view(),
        name="asset-restore",
    ),
    path(
        "assets/v2/anchor/<str:anchor>/<uuid:entity_id>/bulk/",
        EntityBulkAssetEndpoint.as_view(),
        name="entity-bulk-asset",
    ),
]
