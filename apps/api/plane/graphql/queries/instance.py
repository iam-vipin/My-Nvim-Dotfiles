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
from strawberry.exceptions import GraphQLError

# Module Imports
from plane.graphql.permissions.public import public_query
from plane.graphql.types.instance import InstanceType
from plane.license.models import Instance


@strawberry.type
class InstanceQuery:
    @strawberry.field
    @public_query()
    async def instance(self, info: Info) -> InstanceType:
        instance = await sync_to_async(Instance.objects.first)()

        if not instance:
            message = "Instance not found"
            error_extensions = {"code": "INSTANCE_NOT_FOUND", "statusCode": 404}
            raise GraphQLError(message, extensions=error_extensions)

        return instance
