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

# strawberry imports
import strawberry

# module imports
from plane.graphql.types.user import UserType, ProfileType
from plane.graphql.types.workspace import WorkspaceType
from plane.graphql.types.device import DeviceInformationType


@strawberry.type
class UserInformationType:
    user: UserType
    profile: ProfileType
    workspace: Optional[WorkspaceType]
    device_info: Optional[DeviceInformationType]
