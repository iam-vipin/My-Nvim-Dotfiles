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
from typing import Optional

# Strawberry imports
import strawberry


@strawberry.enum
class CatchUpTypeEnum(Enum):
    WORK_ITEM = "WORK_ITEM"
    INTAKE = "INTAKE"
    EPIC = "EPIC"


@strawberry.enum
class CatchUpActivityTypeEnum(Enum):
    COMMENT = "COMMENT"
    ACTIVITY = "ACTIVITY"


@strawberry.type
class CatchUpActivityType:
    id: Optional[str]
    type: Optional[CatchUpActivityTypeEnum]
    created_at: Optional[str]


@strawberry.type
class CatchUpWorkItemType:
    id: Optional[str]
    name: Optional[str]
    project_identifier: Optional[str]
    sequence_id: Optional[str]
    intake_id: Optional[str]


@strawberry.type
class CatchUpType:
    id: Optional[str]
    project_id: Optional[str]
    type: CatchUpTypeEnum
    count: Optional[int]
    work_item: Optional[CatchUpWorkItemType]
    first_unread: Optional[CatchUpActivityType]
    last_unread: Optional[CatchUpActivityType]
