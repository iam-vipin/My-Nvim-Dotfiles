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
import uuid
from typing import Any
from typing import Dict
from typing import Optional

# Third-party imports
from pydantic import BaseModel
from pydantic import Field


class AttachmentUploadRequest(BaseModel):
    """Request schema for initiating file upload"""

    filename: str = Field(..., description="Original filename of the attachment", max_length=500)
    content_type: str = Field(..., description="MIME type of the file (e.g., image/png, application/pdf)", max_length=100)
    file_size: int = Field(..., description="Size of the file in bytes", gt=0)
    workspace_id: Optional[uuid.UUID] = Field(None, description="Workspace ID for the attachment")
    chat_id: uuid.UUID = Field(..., description="Chat ID for the attachment")


class S3UploadData(BaseModel):
    """S3 pre-signed POST data"""

    url: str = Field(..., description="S3 upload URL")
    fields: Dict[str, Any] = Field(..., description="Form fields for S3 POST request")


class AttachmentResponse(BaseModel):
    """Minimal attachment information response"""

    id: str
    filename: str
    content_type: str
    file_size: int
    file_type: str
    status: str


class AttachmentUploadResponse(BaseModel):
    """Response schema for upload initiation"""

    upload_data: S3UploadData = Field(..., description="S3 pre-signed POST data for direct upload")
    attachment_id: str = Field(..., description="Unique identifier for the attachment")
    attachment: AttachmentResponse = Field(..., description="Attachment metadata")


class AttachmentCompleteRequest(BaseModel):
    """Request schema for completing upload"""

    attachment_id: uuid.UUID = Field(..., description="Attachment ID to complete")
    chat_id: uuid.UUID = Field(..., description="Chat ID for the attachment")


class AttachmentDetailResponse(BaseModel):
    """Minimal detailed attachment response"""

    id: str
    filename: str
    content_type: str
    file_size: int
    file_type: str
    status: str
    attachment_url: Optional[str] = Field(None, description="Attachment download URL")


class AttachmentDeleteRequest(BaseModel):
    """Request schema for deleting attachment"""

    attachment_id: uuid.UUID = Field(..., description="Attachment ID to delete")
    chat_id: uuid.UUID = Field(..., description="Chat ID for the attachment")


# Error responses
class AttachmentError(BaseModel):
    """Error response for attachment operations"""

    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
