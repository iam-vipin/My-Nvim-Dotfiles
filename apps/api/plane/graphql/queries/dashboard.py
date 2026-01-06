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

from typing import Optional

# Third-Party Imports
import strawberry
from asgiref.sync import sync_to_async

# Strawberry Imports
from strawberry.types import Info
from strawberry.permission import PermissionExtension


# Module Imports
from plane.db.models import Workspace, Profile, Device
from plane.graphql.types.dashboard import UserInformationType
from plane.graphql.permissions.workspace import IsAuthenticated
from plane.graphql.helpers import get_workspace_async


@sync_to_async
def get_latest_workspace_by_user_async(user_id: str):
    try:
        return Workspace.objects.filter(workspace_member__member_id=user_id, workspace_member__is_active=True).first()
    except Exception:
        return None


@strawberry.type
class userInformationQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[IsAuthenticated()])])
    async def userInformation(self, info: Info, device_id: Optional[str] = None) -> UserInformationType:
        user = info.context.user
        user_id = str(user.id)

        profile = await sync_to_async(Profile.objects.get)(user=user)

        # fetch workspace
        workspace = None
        workspace_id = profile.last_workspace_id if profile.last_workspace_id else None
        if workspace_id is not None:
            workspace = await get_workspace_async(id=workspace_id)

        if workspace is None:
            workspace = await get_latest_workspace_by_user_async(user_id=user_id)

        # fetch firebase notification token
        device_information = None
        if device_id is not None:
            try:
                device_information = await sync_to_async(Device.objects.get)(user=user, device_id=device_id)
            except Exception:
                device_information = None

        return UserInformationType(
            user=user,
            profile=profile,
            workspace=workspace,
            device_info=device_information,
        )
