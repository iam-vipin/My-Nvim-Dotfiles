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

# Python Standard Library Imports
import strawberry

# Strawberry Imports
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module Imports
from plane.graphql.helpers import get_project, get_work_item_stats_count_async, get_workspace_async
from plane.graphql.permissions.project import ProjectBasePermission
from plane.graphql.types.issues.base import IssueStatsType


@strawberry.type
class IssueStatsQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[ProjectBasePermission()])])
    async def issue_stats(self, info: Info, slug: str, project: str, issue: str) -> IssueStatsType:
        user = info.context.user
        user_id = str(user.id)

        workspace = await get_workspace_async(slug=slug)
        workspace_id = str(workspace.id)
        workspace_slug = workspace.slug

        project_details = await get_project(workspace_slug=workspace_slug, project_id=project)
        project_id = str(project_details.id)

        stats = await get_work_item_stats_count_async(
            user_id=user_id,
            workspace_id=workspace_id,
            workspace_slug=workspace_slug,
            project_id=project_id,
            work_item_id=issue,
        )

        return stats
