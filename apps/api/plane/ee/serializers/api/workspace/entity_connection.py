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

from plane.ee.models.workspace import WorkspaceConnection, WorkspaceEntityConnection
from plane.db.models import Workspace, Project, Issue

from plane.api.serializers.base import BaseSerializer
from rest_framework import serializers


class WorkspaceEntityConnectionAPISerializer(BaseSerializer):
    workspace_id = serializers.PrimaryKeyRelatedField(
        source="workspace",  # Maps to the `workspace` ForeignKey field
        queryset=Workspace.objects.all(),
    )
    workspace_connection_id = serializers.PrimaryKeyRelatedField(
        source="workspace_connection",  # Maps to the `workspace_entity_connection` ForeignKey field
        queryset=WorkspaceConnection.objects.all(),
    )
    project_id = serializers.PrimaryKeyRelatedField(
        source="project",  # Maps to the `project` ForeignKey field
        queryset=Project.objects.all(),
        required=False,
        allow_null=True,
    )
    issue_id = serializers.PrimaryKeyRelatedField(
        source="issue",  # Maps to the `issue` ForeignKey field
        queryset=Issue.objects.all(),
        required=False,
        allow_null=True,
    )
    workspace_slug = serializers.CharField(source="workspace.slug", read_only=True)

    class Meta:
        model = WorkspaceEntityConnection
        fields = "__all__"
        read_only_fields = [
            "workspace",
            "workspace_connection",
            "project",
            "issue",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
