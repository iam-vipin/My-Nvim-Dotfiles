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
from dataclasses import dataclass, field

# Third-party library imports
import strawberry


@strawberry.input
@dataclass
class CommentReactionInput:
    reaction: str = field()


@strawberry.type
class CommentReactionType:
    reaction: str
    user_ids: list[strawberry.ID]
