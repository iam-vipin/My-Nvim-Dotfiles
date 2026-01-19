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
from plane.db.models import ProjectUserProperty


@strawberry_django.type(ProjectUserProperty)
class IssueUserPropertyType:
    display_filters: JSON
    display_properties: JSON
    filters: JSON
    id: strawberry.ID
    project: strawberry.ID
    user: strawberry.ID
    workspace: strawberry.ID

    @strawberry.field
    def workspace(self) -> int:
        return self.workspace_id

    @strawberry.field
    def user(self) -> int:
        return self.user_id

    @strawberry.field
    def project(self) -> int:
        return self.project_id
