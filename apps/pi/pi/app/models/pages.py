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

import uuid
from typing import Optional

from sqlalchemy import Column
from sqlalchemy import String
from sqlmodel import Field

from pi.app.models.base import TimeAuditModel
from pi.app.models.base import UUIDModel


class PageAIBlock(UUIDModel, TimeAuditModel, table=True):
    __tablename__ = "page_ai_blocks"

    # Fields
    user_id: uuid.UUID = Field(nullable=False, index=True)
    block_type: str = Field(
        nullable=False,
        description="Type of AI block: 'summary', 'custom', 'action_items', etc.",
    )
    content: Optional[str] = Field(
        default=None,
        nullable=True,
        description="Custom prompt content, only used when block_type='custom'",
    )
    generated_content: Optional[str] = Field(
        default=None,
        nullable=True,
        description="AI-generated output/result",
    )
    entity_type: str = Field(
        sa_column=Column(String(50), nullable=False, index=True),
        description="Type of entity: 'page', 'wiki', etc.",
    )
    entity_id: uuid.UUID = Field(
        nullable=False,
        index=True,
        description="ID of the associated entity (page/wiki)",
    )
    project_id: Optional[uuid.UUID] = Field(
        default=None,
        nullable=True,
        index=True,
    )
    workspace_id: uuid.UUID = Field(
        nullable=False,
        index=True,
    )
