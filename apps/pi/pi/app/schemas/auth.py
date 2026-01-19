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

from pydantic import UUID4
from pydantic import BaseModel


class User(BaseModel):
    id: UUID4


class AuthResponse(BaseModel):
    is_authenticated: bool
    user: User | None = None
    plane_token: str | None = None
