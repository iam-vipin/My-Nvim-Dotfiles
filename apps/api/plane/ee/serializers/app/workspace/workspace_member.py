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

from plane.app.serializers.base import BaseSerializer
from plane.ee.models import WorkspaceMemberActivity
from rest_framework import serializers


class WorkspaceMemberActivitySerializer(BaseSerializer):
    workspace_member = serializers.UUIDField(read_only=True, source="workspace_member.member_id", allow_null=True)

    class Meta:
        model = WorkspaceMemberActivity
        fields = "__all__"
        read_only_fields = ["workspace", "actor", "deleted_at"]
