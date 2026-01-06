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

"""Page artifact schema and field definitions."""

from typing import Dict
from typing import Optional

from pydantic import BaseModel

# Field list for pages
PAGE_FIELDS = [
    "name",
    "description",
    "description_html",
    "access",
    "is_locked",
    "is_global",
    "parent_id",
    "owned_by",
    "logo_props",
    "view_props",
]


class PageProperties(BaseModel):
    """Properties specific to page artifacts."""

    access: Optional[str] = None
    is_locked: Optional[bool] = None
    is_global: Optional[bool] = None
    parent_id: Optional[str] = None
    owned_by: Optional[Dict[str, str]] = None  # {"id": "...", "name": "User Name"}
    logo_props: Optional[Dict[str, str]] = None
    view_props: Optional[Dict[str, str]] = None


class PageArtifact(BaseModel):
    """Complete page artifact schema."""

    name: str
    description: Optional[str] = None  # Maps to description_stripped
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[PageProperties] = None
