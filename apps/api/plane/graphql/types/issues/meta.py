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

# python imports
from typing import Optional

# Third-party library imports
import strawberry


@strawberry.type
class IssueShortenedMetaInfo:
    project: strawberry.ID
    work_item: strawberry.ID
    is_epic: Optional[bool] = False
    is_intake: Optional[bool] = False
    intake_id: Optional[strawberry.ID] = None
