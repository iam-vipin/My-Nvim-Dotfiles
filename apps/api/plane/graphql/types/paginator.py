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
from typing import TypeVar, Optional, Generic

# Django imports
from django.db.models import Model

# Strawberry imports
import strawberry

# Defining a generic type variable
T = TypeVar("T", bound=Model)


@strawberry.type
class PaginatorInfo:
    prev_cursor: Optional[str]
    cursor: str
    next_cursor: Optional[str]
    prev_page_results: bool
    next_page_results: bool
    count: int
    total_count: int


@strawberry.type
class PaginatorResponse(PaginatorInfo, Generic[T]):
    results: list[T]
