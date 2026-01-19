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

# Third-party imports
from sqlmodel import Field

# Module imports
from pi.app.models.base import TimeAuditModel
from pi.app.models.base import UUIDModel


class Feedback(UUIDModel, TimeAuditModel, table=True):
    __tablename__ = "feedbacks"

    # Fields
    entity_type: Optional[str] = Field(
        default=None,
        nullable=True,
        description="Type of entity: 'page', 'wiki', etc.",
    )
    entity_id: Optional[uuid.UUID] = Field(
        default=None,
        nullable=True,
        description="ID of the associated entity (page/wiki)",
    )
    usage_type: Optional[str] = Field(
        nullable=True,
        default=None,
        description="Type of AI feature: 'ai_block', 'summarize', 'elaborate', 'translate', 'key_points', etc.",
    )
    usage_id: Optional[uuid.UUID] = Field(
        default=None,
        nullable=True,
        index=True,
        description="ID of the specific feature instance (e.g., ai_block_id, page_id for one-off features)",
    )
    feedback: Optional[str] = Field(default=None, nullable=True)
    feedback_message: Optional[str] = Field(default=None, nullable=True)
    user_id: uuid.UUID = Field(
        nullable=False,
    )
    workspace_id: uuid.UUID = Field(
        nullable=False,
    )
