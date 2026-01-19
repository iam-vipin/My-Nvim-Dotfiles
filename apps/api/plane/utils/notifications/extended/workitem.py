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

# Python imports
from typing import List
from uuid import UUID

# Module imports
from plane.utils.notifications.workitem import WorkItemNotificationHandler
from plane.db.models import ProjectMember
from plane.ee.models import TeamspaceMember, TeamspaceProject
from plane.payment.flags.flag_decorator import check_workspace_feature_flag
from plane.payment.flags.flag import FeatureFlag
from plane.db.models import Workspace


class ExtendedWorkItemNotificationHandler(WorkItemNotificationHandler):
    # Override the get_active_members method to include teamspace members
    def get_active_members(self) -> List[UUID]:
        project_members = ProjectMember.objects.filter(project_id=self.context.project_id, is_active=True).values_list(
            "member_id", flat=True
        )

        teamspace_members = []

        # Get the workspace slug
        workspace = Workspace.objects.get(id=self.context.workspace_id)

        # Check if teamspace is enabled
        if check_workspace_feature_flag(
            feature_key=FeatureFlag.TEAMSPACES, user_id=self.context.actor_id, slug=workspace.slug
        ):
            teamspace_ids = TeamspaceProject.objects.filter(project_id=self.context.project_id).values_list(
                "team_space_id", flat=True
            )
            teamspace_members = TeamspaceMember.objects.filter(
                team_space_id__in=teamspace_ids, member_id=self.context.actor_id
            ).values_list("member_id", flat=True)

        # Combine the project members and teamspace members and remove duplicates
        return list(set(list(project_members) + list(teamspace_members)))
