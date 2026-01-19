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

# python imports
from typing import Optional

# Third-party imports
from sqlmodel import Field

from pi.app.models.base import BaseModel


class GitHubWebhook(BaseModel, table=True):
    __tablename__ = "github_webhooks"

    commit_id: str = Field(nullable=False, max_length=255)
    source: str = Field(nullable=False, max_length=255)  # repo_name
    branch_name: str = Field(nullable=False, max_length=255)
    processed: bool = Field(nullable=False, default=False)
    files_processed: Optional[int] = Field(nullable=True, default=0)
    error_message: Optional[str] = Field(nullable=True)
