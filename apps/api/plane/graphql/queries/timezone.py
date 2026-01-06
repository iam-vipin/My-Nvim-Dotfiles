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
from strawberry.types import Info
from strawberry.permission import PermissionExtension

# Module Imports
from plane.graphql.utils.timezone.base import get_timezone_list
from plane.graphql.types.timezone import TimezoneListType
from plane.graphql.permissions.workspace import IsAuthenticated


@strawberry.type
class TimezoneListQuery:
    @strawberry.field(extensions=[PermissionExtension(permissions=[IsAuthenticated()])])
    async def timezone_list(self, info: Info) -> list[TimezoneListType]:
        timezones = get_timezone_list()

        return [
            TimezoneListType(
                value=timezone["value"],
                query=timezone["query"],
                label=timezone["label"],
            )
            for timezone in timezones
        ]
