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

from typing import List

from pydantic import UUID4
from pydantic import BaseModel
from pydantic import Field


class DupeSearchRequest(BaseModel):
    title: str
    description_stripped: str | None = None
    issue_id: UUID4 | None = None
    user_id: UUID4 | None = None
    project_id: UUID4 | None = None
    workspace_id: UUID4
    workspace_slug: str | None = None


class NotDuplicateRequest(BaseModel):
    issue_id: UUID4
    not_duplicates_with: list[UUID4]


class DuplicateIdentificationResponse(BaseModel):
    """Structured output for LLM duplicate identification"""

    duplicates: List[int] = Field(
        description="List of serial numbers (1, 2, 3, etc.) of candidate issues that are duplicates of the query issue. Only include numbers of issues that are clearly duplicates.",  # noqa: E501
        default_factory=list,
    )
