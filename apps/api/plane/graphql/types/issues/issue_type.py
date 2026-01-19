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

# Third-party library imports
import strawberry
import strawberry_django

# Strawberry imports
from strawberry.scalars import JSON

# Module Imports
from plane.db.models import IssueType


@strawberry_django.type(IssueType)
class IssueTypesType:
    id: strawberry.ID
    workspace: strawberry.ID
    name: str
    description: str
    logo_props: JSON
    is_default: bool
    level: int
    is_active: bool

    @strawberry.field
    def workspace(self) -> int:
        return self.workspace_id
