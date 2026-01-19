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

# strawberry imports
from enum import Enum

import strawberry
import strawberry_django

# Module Imports
from plane.db.models import Device


@strawberry.enum
class DeviceInformationEnumType(Enum):
    ANDROID = "ANDROID"
    IOS = "IOS"

    def __str__(self):
        return self.value


@strawberry_django.type(Device)
class DeviceInformationType:
    user: str
    device_id: str
    device_type: DeviceInformationEnumType
    push_token: str
    is_active: bool

    @strawberry.field
    def user(self) -> int:
        return self.user_id
