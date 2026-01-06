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

from plane.ee.models.workspace import WorkspaceConnection, WorkspaceCredential
from plane.db.models.workspace import Workspace

from plane.api.serializers.base import BaseSerializer
from rest_framework import serializers


class WorkspaceConnectionAPISerializer(BaseSerializer):
    # Handle workspace_id as input
    workspace_id = serializers.PrimaryKeyRelatedField(
        source="workspace",  # Maps to the `workspace` ForeignKey field
        queryset=Workspace.objects.all(),
    )
    # Handle credential_id as input
    credential_id = serializers.PrimaryKeyRelatedField(
        source="credential",  # Maps to the `credential` ForeignKey field
        queryset=WorkspaceCredential.objects.all(),
    )
    # Handle workspace_slug as output
    workspace_slug = serializers.CharField(
        source="workspace.slug",  # Maps to the `workspace.slug` attribute
        read_only=True,  # This field is only used for output, not input
    )

    class Meta:
        model = WorkspaceConnection
        fields = "__all__"  # Include all model fields
        read_only_fields = [
            "workspace",
            "credential",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
