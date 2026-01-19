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

# Strawberry imports
import strawberry
import strawberry_django

# Module Imports
from plane.db.models import EstimatePoint


@strawberry_django.type(EstimatePoint)
class EstimatePointType:
    id: strawberry.ID
    estimate: strawberry.ID
    key: int
    description: str
    value: str
    workspace: strawberry.ID
    project: strawberry.ID

    @strawberry.field
    def project(self) -> int:
        return self.project_id

    @strawberry.field
    def workspace(self) -> int:
        return self.workspace_id

    @strawberry.field
    def estimate(self) -> int:
        return self.estimate_id
