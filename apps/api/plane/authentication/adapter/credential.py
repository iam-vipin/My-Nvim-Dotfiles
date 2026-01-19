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

from plane.authentication.adapter.base import Adapter


class CredentialAdapter(Adapter):
    """Common interface for all credential providers"""

    def __init__(self, request, provider, callback=None):
        super().__init__(request=request, provider=provider, callback=callback)
        self.request = request
        self.provider = provider

    def authenticate(self):
        self.set_user_data()
        return self.complete_login_or_signup()
