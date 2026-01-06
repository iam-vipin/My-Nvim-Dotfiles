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

# Third-party imports
import strawberry

# Strawberry imports
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module imports
from plane.graphql.helpers import get_work_item_mention_async
from plane.graphql.permissions.workspace import WorkspaceBasePermission
from plane.graphql.types.workitem import WorkItemMentionType


@strawberry.type
class WorkspaceWorkItemMentionQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[WorkspaceBasePermission()])])
    async def workspace_work_item_mention(self, info: Info, slug: str, workitem: str) -> WorkItemMentionType:
        user = info.context.user
        user_id = str(user.id)

        work_item = await get_work_item_mention_async(
            user_id=user_id,
            workspace_slug=slug,
            work_item_id=workitem,
        )

        if not work_item:
            return None

        return WorkItemMentionType(
            id=work_item.id,
            name=work_item.name,
            sequence_id=work_item.sequence_id,
            project_id=work_item.project_id,
            type_id=work_item.type_id if work_item.type else None,
            project_identifier=work_item.project.identifier,
            state_group=work_item.state.group if work_item.state else None,
            state_name=work_item.state.name if work_item.state else None,
            archived_at=work_item.archived_at,
            is_epic=work_item.type.is_epic if work_item.type else False,
        )
