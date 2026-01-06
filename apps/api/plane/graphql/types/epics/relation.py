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
from typing import Optional

# Third-party library imports
import strawberry

# Local imports
from ..issues.relation import WorkItemRelationWorkItemType


@strawberry.type
class EpicRelationType:
    blocking: list[WorkItemRelationWorkItemType]
    blocked_by: list[WorkItemRelationWorkItemType]
    duplicate: list[WorkItemRelationWorkItemType]
    relates_to: list[WorkItemRelationWorkItemType]
    start_after: list[WorkItemRelationWorkItemType]
    start_before: list[WorkItemRelationWorkItemType]
    finish_after: list[WorkItemRelationWorkItemType]
    finish_before: list[WorkItemRelationWorkItemType]
    implements: Optional[list[WorkItemRelationWorkItemType]] = None
    implemented_by: Optional[list[WorkItemRelationWorkItemType]] = None
