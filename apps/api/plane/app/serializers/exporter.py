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
from .base import BaseSerializer
from plane.db.models import ExporterHistory
from .user import UserLiteSerializer


class ExporterHistorySerializer(BaseSerializer):
    initiated_by_detail = UserLiteSerializer(source="initiated_by", read_only=True)

    class Meta:
        model = ExporterHistory
        fields = [
            "id",
            "created_at",
            "updated_at",
            "project",
            "provider",
            "status",
            "url",
            "initiated_by",
            "initiated_by_detail",
            "token",
            "created_by",
            "updated_by",
        ]
        read_only_fields = fields
