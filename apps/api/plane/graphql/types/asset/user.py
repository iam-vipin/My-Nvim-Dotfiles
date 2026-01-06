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
from enum import Enum

# Strawberry imports
import strawberry

# module imports
from plane.graphql.types.asset.base import FileAssetEntityType


@strawberry.enum
class UserAssetEnumType(Enum):
    USER_AVATAR = FileAssetEntityType.USER_AVATAR.value
    USER_COVER = FileAssetEntityType.USER_COVER.value

    def __str__(self):
        return self.value
