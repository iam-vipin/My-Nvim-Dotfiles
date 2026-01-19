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

# Third-Party Imports
import strawberry

# Strawberry Imports
from strawberry.permission import PermissionExtension
from strawberry.types import Info

# Module Imports
from plane.graphql.helpers.catch_up import get_catch_ups_async
from plane.graphql.permissions.workspace import WorkspaceBasePermission
from plane.graphql.types.catch_up import CatchUpType


@strawberry.type
class CatchUpQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[WorkspaceBasePermission()])])
    async def catch_ups(self, info: Info, slug: str) -> list[CatchUpType]:
        user = info.context.user
        user_id = str(user.id)

        catch_ups = await get_catch_ups_async(slug, user_id)

        return catch_ups
