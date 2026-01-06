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

from plane.app.serializers import BaseSerializer
from plane.ee.models import Teamspace, TeamspaceMember


class TeamspaceSerializer(BaseSerializer):
    logo_props = serializers.JSONField(default=dict)

    def create(self, validated_data):
        validated_data["workspace_id"] = self.context["workspace_id"]
        lead = validated_data.get("lead")

        # add requester user as the first member
        teamspace = super().create(validated_data)
        TeamspaceMember.objects.create(
            team_space=teamspace,
            member=self.context["user"],
            workspace_id=teamspace.workspace_id,
        )

        # if lead is set and is not the requester, add them as a member too
        if lead and lead != self.context["user"]:
            TeamspaceMember.objects.get_or_create(
                team_space=teamspace,
                member=lead,
                workspace_id=teamspace.workspace_id,
            )

        return teamspace

    def update(self, instance, validated_data):
        lead = validated_data.get("lead")

        # if lead is being updated, ensure they are a member
        if lead and lead != instance.lead:
            TeamspaceMember.objects.get_or_create(
                team_space=instance,
                member=lead,
                workspace_id=instance.workspace_id,
            )

        return super().update(instance, validated_data)

    class Meta:
        model = Teamspace
        fields = "__all__"
        read_only_fields = ["workspace"]
