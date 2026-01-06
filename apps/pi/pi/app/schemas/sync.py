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

from enum import Enum

from pydantic import UUID4
from pydantic import BaseModel
from pydantic import Field


class EventType(str, Enum):
    ISSUES = "ISSUES"
    PAGES = "PAGES"


class WebhookPayload(BaseModel):
    event_type: EventType = Field(..., description="Event type: 'ISSUES' or 'PAGES'")
    data: dict = Field(..., description="Payload data")


class IssueRequest(BaseModel):
    id: UUID4
    workspace_id: UUID4
    project_id: UUID4 | None = None
    name: str | None = Field(None, description="Issue title")
    description_stripped: str | None = None


class PageRequest(BaseModel):
    id: UUID4
    workspace_id: UUID4
    project_ids: list[UUID4] | None = None
    name: str | None = None
    description_html: str | None = None
    access: str | None = None


def parse_webhook_payload(payload: WebhookPayload) -> IssueRequest | PageRequest:
    if payload.event_type == EventType.ISSUES:
        return IssueRequest(**payload.data)
    if payload.event_type == EventType.PAGES:
        return PageRequest(**payload.data)
    raise ValueError(f"Invalid event_type: {payload.event_type}")
