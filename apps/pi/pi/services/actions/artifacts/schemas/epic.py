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

"""Epic artifact schema and field definitions."""

from typing import Dict
from typing import List
from typing import Optional

from pydantic import BaseModel

# Field list for epics
EPIC_FIELDS = [
    "name",
    "description",
    "state",
    "priority",
    "assignee_ids",
    "assignees",
    "label_ids",
    "labels",
    "start_date",
    "target_date",
]


class EpicProperties(BaseModel):
    """Properties specific to epic artifacts."""

    state: Optional[Dict[str, str]] = None  # {"id": "...", "name": "Done", "group": "completed"}
    priority: Optional[Dict[str, str]] = None  # {"name": "high"}
    assignees: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "user"}]
    labels: Optional[List[Dict[str, str]]] = None  # [{"id": "...", "name": "bug"}]
    start_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-15"}
    target_date: Optional[Dict[str, str]] = None  # {"name": "2025-10-16"}

    # ID fields (for backward compatibility)
    assignee_ids: Optional[List[str]] = None
    label_ids: Optional[List[str]] = None


class EpicArtifact(BaseModel):
    """Complete epic artifact schema."""

    name: str
    description: Optional[str] = None
    project: Optional[Dict[str, str]] = None  # {"id": "...", "identifier": "..."}
    properties: Optional[EpicProperties] = None
