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

from rest_framework import serializers

from plane.api.serializers.base import BaseSerializer
from plane.ee.models import Milestone, MilestoneIssue


class MilestoneSerializer(BaseSerializer):
    class Meta:
        model = Milestone
        fields = [
            "id",
            "title",
            "target_date",
            "external_id",
            "external_source",
            "created_at",
            "updated_at",
        ]


class MilestoneWorkItemSerializer(BaseSerializer):
    class Meta:
        model = MilestoneIssue
        fields = ["id", "issue", "milestone"]


class MilestoneWorkItemBulkSerializer(serializers.Serializer):
    """Serializer for bulk adding/removing work items to/from a milestone."""

    issues = serializers.ListField(
        child=serializers.UUIDField(),
        required=True,
        min_length=1,
        help_text="List of issue IDs to add/remove",
    )
