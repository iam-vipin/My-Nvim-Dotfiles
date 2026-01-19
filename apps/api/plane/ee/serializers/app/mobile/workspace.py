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

# Module imports
from plane.ee.serializers import BaseSerializer
from plane.db.models import Workspace


class MobileWorkspaceLiteSerializer(BaseSerializer):
    class Meta:
        model = Workspace
        fields = ["name", "slug", "id", "logo_url"]
        read_only_fields = fields
