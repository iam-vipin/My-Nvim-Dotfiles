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

from rest_framework.throttling import SimpleRateThrottle


class AssetRateThrottle(SimpleRateThrottle):
    scope = "asset_id"

    def get_cache_key(self, request, view):
        asset_id = view.kwargs.get("asset_id")
        if not asset_id:
            return None
        return f"throttle_asset_{asset_id}"
