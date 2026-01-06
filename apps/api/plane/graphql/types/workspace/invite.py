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

# Third party imports
from typing import Optional

# Strawberry imports
import strawberry_django

# Module imports
from plane.db.models import WorkspaceMemberInvite
from plane.graphql.types.workspace import WorkspaceType


@strawberry_django.type(WorkspaceMemberInvite)
class WorkspaceInviteType:
    id: Optional[str]
    email: Optional[str]
    accepted: Optional[bool]
    token: Optional[str]
    message: Optional[str]
    responded_at: Optional[str]
    role: Optional[str]

    workspace: Optional[WorkspaceType]
