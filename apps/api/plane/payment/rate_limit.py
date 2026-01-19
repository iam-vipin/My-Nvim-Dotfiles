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


class WorkspaceRateThrottle(SimpleRateThrottle):
    scope = "workspace"
    rate = "10/minute"

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            slug = view.kwargs.get("slug")
            if slug:
                return self.cache_format % {"scope": self.scope, "ident": slug}
        return None
