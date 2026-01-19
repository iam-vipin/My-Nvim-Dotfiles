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

# Plane imports
from plane.ee.models.workspace import WorkspaceCredential
from plane.db.models import Workspace, User
from plane.api.serializers.base import BaseSerializer


class WorkspaceCredentialAPISerializer(BaseSerializer):
    user_id = serializers.PrimaryKeyRelatedField(source="user", queryset=User.objects.all())

    workspace_id = serializers.PrimaryKeyRelatedField(source="workspace", queryset=Workspace.objects.all())

    class Meta:
        model = WorkspaceCredential
        fields = "__all__"
        read_only_fields = [
            "user",
            "workspace",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
