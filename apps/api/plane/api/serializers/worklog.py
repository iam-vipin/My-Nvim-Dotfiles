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
from plane.app.serializers.base import BaseSerializer
from plane.ee.models import IssueWorkLog

# Third party imports
from rest_framework import serializers


class IssueWorkLogAPISerializer(BaseSerializer):
    class Meta:
        model = IssueWorkLog
        fields = [
            "id",
            "created_at",
            "updated_at",
            "description",
            "duration",
            "created_by",
            "updated_by",
            "project_id",
            "workspace_id",
            "logged_by",
        ]
        read_only_fields = ["logged_by", "workspace", "project"]

    def validate(self, data):
        if data.get("duration", None) is not None and data.get("duration") < 0:
            raise serializers.ValidationError("Duration cannot be negative")
        return data


class ProjectWorklogSummarySerializer(serializers.Serializer):
    """Serializer for project worklog summary with aggregated duration per issue"""

    issue_id = serializers.UUIDField(help_text="ID of the work item")
    duration = serializers.IntegerField(help_text="Total duration logged for this work item in seconds")
