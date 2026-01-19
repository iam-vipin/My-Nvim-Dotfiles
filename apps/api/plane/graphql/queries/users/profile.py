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

# Python Standard Library Imports
from asgiref.sync import sync_to_async

# Strawberry Imports
from strawberry.types import Info
from strawberry.permission import PermissionExtension

# Module Imports
from plane.db.models import Profile
from plane.graphql.types.user import ProfileType
from plane.graphql.permissions.workspace import IsAuthenticated


@strawberry.type
class ProfileQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[IsAuthenticated()])])
    async def profile(self, info: Info) -> ProfileType:
        user = info.context.user

        profile = await sync_to_async(Profile.objects.get)(user=user)
        return profile
