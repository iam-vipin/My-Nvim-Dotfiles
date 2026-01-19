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

"""Module artifact schema and field definitions."""

from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel

# Field list for modules
MODULE_FIELDS = ["name", "description", "start_date", "target_date", "status", "project_id", "project", "lead", "members"]


class ModuleProperties(BaseModel):
    """Properties specific to module artifacts."""

    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    target_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-16"}
    status: Optional[str] = None
    project_id: Optional[str] = None
    lead: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Lead User"}
    members: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "Member"}]


class ModuleArtifact(BaseModel):
    """Complete module artifact schema."""

    name: str
    description: Optional[str] = None
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[ModuleProperties] = None
