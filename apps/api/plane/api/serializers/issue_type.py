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

# Third party imports
from rest_framework import serializers

# Module imports
from plane.ee.serializers import BaseSerializer
from plane.db.models import IssueType, ProjectIssueType


class IssueTypeAPISerializer(BaseSerializer):
    project_ids = serializers.ListField(child=serializers.UUIDField(), required=False, read_only=True)

    class Meta:
        model = IssueType
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "logo_props",
            "is_default",
            "level",
            "deleted_at",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]


class ProjectIssueTypeAPISerializer(BaseSerializer):
    class Meta:
        model = ProjectIssueType
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "project",
            "level",
            "is_default",
            "deleted_at",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
