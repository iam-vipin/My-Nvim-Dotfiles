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

# Python imports
import os

# Third party imports
from rest_framework.throttling import AnonRateThrottle


class SpaceRateThrottle(AnonRateThrottle):
    rate = os.environ.get("SPACE_RATE_LIMIT", "200/minute")
    scope = "space"


class AnchorBasedRateThrottle(AnonRateThrottle):
    rate = os.environ.get("SPACE_ANCHOR_RATE_LIMIT", "200/minute")

    def get_cache_key(self, request, view):
        # Get the anchor from the URL parameters
        anchor = view.kwargs.get("anchor", "")
        # Combine anchor and IP for the cache key
        return f"anchor_throttle_{anchor}"
