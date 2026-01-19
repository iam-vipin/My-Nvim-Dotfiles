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

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

import os


class SecretKeyAuthentication(BaseAuthentication):
    def authenticate(self, request):
        secret_key = request.headers.get("live-server-secret-key")

        if not secret_key:
            raise AuthenticationFailed("Missing secret key")

        if secret_key != os.environ.get("LIVE_SERVER_SECRET_KEY"):
            raise AuthenticationFailed("Invalid secret key")

        return (None, None)
