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

from sqlmodel import Field

from .base import SoftDeleteModel
from .base import TimeAuditModel
from .base import UUIDModel


class Transcription(TimeAuditModel, SoftDeleteModel, UUIDModel, table=True):
    __tablename__ = "transcriptions"

    # Fields
    transcription_text: str = Field(nullable=False)
    transcription_id: str = Field(nullable=False)
    audio_duration: int = Field(nullable=False)  # Seconds
    speech_model: str = Field(nullable=False)
    processing_time: float = Field(nullable=False)
    user_id: uuid.UUID = Field(nullable=False)
    workspace_id: uuid.UUID = Field(nullable=False)
    chat_id: Optional[uuid.UUID] = Field(nullable=True)

    # Add pricing field
    transcription_cost_usd: Optional[float] = Field(nullable=True, description="Cost in USD")
