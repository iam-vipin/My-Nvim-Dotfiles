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

from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlmodel import Field

from pi.app.models.base import BaseModel


class MessageMention(BaseModel, table=True):
    """
    Tracks mentions of entities (issues, cycles, modules, etc.) in messages.

    This model stores references to Plane entities that are mentioned in chat messages,
    allowing for tracking what entities are being discussed.
    """

    __tablename__ = "message_mentions"

    # Fields
    mention_type: str = Field(
        nullable=False,
        description="Type of entity mentioned (issues, cycles, modules, etc.)",
    )
    mention_id: uuid.UUID = Field(
        nullable=False,
        description="ID of the associated entity ",
    )
    workspace_id: uuid.UUID = Field(
        nullable=False,
    )

    # Foreign keys
    message_id: uuid.UUID = Field(
        sa_column=Column(UUID(as_uuid=True), ForeignKey("messages.id", name="fk_message_mentions_message_id"), nullable=False)
    )
