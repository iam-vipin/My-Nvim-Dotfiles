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
from dataclasses import dataclass, field
from typing import Optional

# Strawberry imports
import strawberry
from strawberry.scalars import JSON


@strawberry.input
@dataclass
class EpicAttachmentCreateInputType:
    name: str = field()
    type: str = field()
    size: int = field()


@strawberry.input
@dataclass
class EpicAttachmentUpdateInputType:
    attributes: Optional[JSON] = field(default=None)


@strawberry.type
class EpicAttachmentPresignedUrlResponseType:
    upload_data: JSON
    attachment_id: str
    asset_url: Optional[str]
