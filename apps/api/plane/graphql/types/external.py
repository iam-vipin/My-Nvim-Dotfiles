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

# Strawberry imports
import strawberry


@strawberry.type
class ProjectCovers:
    urls: list[str]


@strawberry.type
class UnsplashPaginatorInfo:
    prev_cursor: Optional[int]
    cursor: str
    next_cursor: Optional[int]
    prev_page_results: bool
    next_page_results: bool
    count: int
    total_count: int


@strawberry.type
# unsplash images info
class UnsplashImagesInfo:
    raw: str
    full: str
    regular: str
    small: str
    thumb: str
    small_s3: str


@strawberry.type
# unsplash images
class UnsplashImages:
    total: Optional[int]
    total_pages: Optional[int]
    urls: list[UnsplashImagesInfo]
