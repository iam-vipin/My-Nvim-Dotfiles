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
from datetime import datetime
from typing import Optional

# Third Party Imports
import strawberry


@strawberry.type
class WorkItemMentionType:
    id: str
    name: str
    sequence_id: int
    project_id: str
    type_id: Optional[str]
    project_identifier: str
    state_group: str
    state_name: str
    archived_at: Optional[datetime] = None
    is_epic: Optional[bool] = False
