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
from dataclasses import dataclass, field
from typing import Optional

# Strawberry imports
import strawberry

# Module imports
from plane.graphql.types.workspace import WorkspaceType


@strawberry.type
class UserDeleteType:
    can_delete: bool
    workspaces: Optional[list[WorkspaceType]]


@strawberry.input
@dataclass
class UserDeleteInputType:
    reason: Optional[str] = field(default_factory=lambda: None)
