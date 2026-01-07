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

"""File attachment management endpoints for chat messages."""

import uuid

from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import Form
from fastapi import Path
from fastapi import Query
from fastapi import UploadFile
from fastapi.responses import JSONResponse
from pydantic import UUID4
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v2.dependencies import get_current_user
from pi.app.models.message_attachment import MessageAttachment
from pi.app.schemas.attachment import AttachmentDetailResponse
from pi.app.utils.attachments import allowed_attachment_types
from pi.app.utils.attachments import detect_file_type
from pi.app.utils.attachments import get_presigned_url_download
from pi.app.utils.attachments import get_presigned_url_preview
from pi.app.utils.attachments import get_s3_client
from pi.app.utils.attachments import sanitize_filename
from pi.app.utils.attachments import scan_file_for_malware
from pi.config import settings
from pi.core.db.plane_pi.lifecycle import get_async_session

router = APIRouter()
log = logger.getChild("v2.attachments")

# S3 Configuration
S3_BUCKET = settings.AWS_S3_BUCKET


@router.get("/")
async def list_attachments(
    chat_id: str = Query(..., description="Filter attachments by chat UUID"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user),
):
    """
    List attachments for a chat.

    This endpoint retrieves all uploaded attachments for a specific chat
    conversation. Only attachments owned by the authenticated user and
    in "uploaded" status are returned.

    Attachments are returned with pre-signed download URLs that are valid
    for a limited time (typically 1 hour).

    Args:
        chat_id: UUID of the chat to get attachments for (query parameter)
        db: Database session (injected)
        session: Session cookie for authentication (injected)

    Returns:
        JSON response with:
        - attachments: List of attachment objects containing:
            - id: Attachment UUID
            - filename: Original filename
            - content_type: MIME type
            - file_size: Size in bytes
            - file_type: Categorized type (image, document, etc.)
            - status: Upload status (always "uploaded" in results)
            - message_id: Associated message UUID (if any)
            - attachment_url: Pre-signed download URL
            - created_at: ISO timestamp of creation

    Status Codes:
        - 200: Attachments retrieved successfully
        - 401: Invalid or missing authentication
        - 500: Internal server error

    Example Request:
        GET /api/v2/attachments/?chat_id=xyz-789

    Example Response:
        {
            "attachments": [
                {
                    "id": "att-001",
                    "filename": "screenshot.png",
                    "content_type": "image/png",
                    "file_size": 524288,
                    "file_type": "image",
                    "status": "uploaded",
                    "message_id": "msg-123",
                    "attachment_url": "https://s3.amazonaws.com/...?X-Amz-Signature=...",
                    "created_at": "2025-11-28T10:30:00.000Z"
                }
            ]
        }

    Notes:
        - Only returns attachments in "uploaded" status
        - Soft-deleted attachments are excluded
        - User must own the attachments
        - Download URLs expire after 1 hour
        - Attachments are sorted by creation time
        - Deprecated V1 endpoint: GET /api/v1/attachments/chat/

    Use Cases:
        - Display all files shared in a chat
        - Show attachment history
        - Regenerate download links
        - Load attachments for chat context
    """
    try:
        user_id = current_user.id
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

    try:
        # Convert string ID to UUID
        chat_uuid = uuid.UUID(chat_id)

        # Get all attachments for this chat owned by this user
        stmt = select(MessageAttachment).where(
            MessageAttachment.chat_id == chat_uuid,
            MessageAttachment.user_id == user_id,
            MessageAttachment.status == "uploaded",
            MessageAttachment.deleted_at.is_(None),  # type: ignore[union-attr]
        )
        result = await db.execute(stmt)
        attachments = result.scalars().all()

        # Build response with attachment details and URLs
        attachment_list = []
        for attachment in attachments:
            # Generate download URL
            download_url = get_presigned_url_download(attachment)

            attachment_data = {
                "id": str(attachment.id),
                "filename": attachment.original_filename,
                "content_type": attachment.content_type,
                "file_size": attachment.file_size,
                "file_type": attachment.file_type,
                "status": attachment.status,
                "message_id": str(attachment.message_id) if attachment.message_id else None,
                "attachment_url": download_url,
                "created_at": attachment.created_at.isoformat() if attachment.created_at else None,
            }
            attachment_list.append(attachment_data)

        return JSONResponse(content={"attachments": attachment_list})

    except ValueError as e:
        log.error(f"Invalid UUID format: {e}")
        return JSONResponse(status_code=400, content={"detail": "Invalid chat ID format"})
    except Exception as e:
        import traceback

        error_details = traceback.format_exc()
        log.error(f"Error listing attachments: {e!s}\n{error_details}")
        # Temporary: Return detailed error for debugging (remove in production)
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error", "error": str(e), "traceback": error_details})


@router.post("/", status_code=201)
async def create_attachment(
    file: UploadFile = File(...),
    workspace_id: str = Form(...),
    chat_id: str = Form(...),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user),
):
    """Receive file, scan for security, then upload to S3 if safe"""
    try:
        user_id = current_user.id
        # Read file into memory
        file_data = await file.read()
        file_size = len(file_data)

        # Validate file size
        max_size = settings.FILE_SIZE_LIMIT
        if file_size > max_size:
            return JSONResponse(status_code=413, content={"detail": "File size exceeds limit"})

        # Detect MIME type from file content (more secure than trusting client)
        content_type = detect_file_type(file_data)
        if content_type == "unknown":
            # Fallback to content_type header if detection fails
            content_type = file.content_type or "application/octet-stream"

        # Validate file type
        if content_type not in allowed_attachment_types:
            return JSONResponse(status_code=415, content={"detail": "Unsupported file type"})

        # 🔒 SECURITY SCAN BEFORE UPLOADING TO S3
        log.info(f"Scanning file before S3 upload: {file.filename}")
        is_safe, error_message = await scan_file_for_malware(file_data, content_type, file.filename or "attachment")

        if not is_safe:
            log.warning(f"File rejected during pre-upload scan: {error_message}")
            return JSONResponse(status_code=400, content={"detail": f"File rejected: {error_message}"})

        log.info(f"File passed security scan: {file.filename}")

        sanitized_filename = sanitize_filename(file.filename or "attachment")

        # Create attachment record
        attachment = MessageAttachment(
            original_filename=sanitized_filename,
            content_type=content_type,
            file_size=file_size,
            file_type=MessageAttachment.get_file_type_from_mime(content_type),
            status="pending",
            file_path="",
            workspace_id=workspace_id,
            chat_id=chat_id,
            message_id=None,
            user_id=user_id,
        )

        db.add(attachment)
        await db.commit()
        await db.refresh(attachment)

        # Generate S3 file path
        file_path = attachment.generate_file_path(uuid.UUID(workspace_id), uuid.UUID(chat_id))
        attachment.file_path = file_path

        # Upload DIRECTLY to S3 (since we already have the clean file data)
        s3_client = get_s3_client()
        s3_client.put_object(Bucket=S3_BUCKET, Key=file_path, Body=file_data, ContentType=content_type)

        # Mark as uploaded immediately
        attachment.status = "uploaded"
        await db.commit()

        log.info(f"File scanned and uploaded successfully: {file_path}")

        # Prepare response
        download_url = get_presigned_url_download(attachment)

        return JSONResponse(
            content=AttachmentDetailResponse(
                id=str(attachment.id),
                filename=attachment.original_filename,
                content_type=attachment.content_type,
                file_size=attachment.file_size,
                file_type=attachment.file_type,
                status=attachment.status,
                attachment_url=download_url,
            ).model_dump()
        )

    except Exception as e:
        log.error(f"Error in secure file upload: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@router.patch("/{attachment_id}")
async def update_attachment(
    attachment_id: UUID4 = Path(..., description="UUID of the attachment"),
    chat_id: UUID4 = Query(..., description="UUID of the chat"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user),
):
    """
    Complete attachment upload after S3 upload finishes.

    This is the final step (Step 3) in the attachment upload flow. After the file
    has been uploaded directly to S3 using the pre-signed URL, this endpoint:
    1. Verifies the file exists in S3
    2. Updates the attachment status to "uploaded"
    3. Generates download URLs

    The verification step ensures the attachment record accurately reflects
    the actual file availability in S3 storage.

    Args:
        attachment_id: UUID of the attachment (path parameter)
        chat_id: UUID of the chat (query parameter for verification)
        db: Database session (injected)
        session: Session cookie for authentication (injected)

    Returns:
        JSON response with:
        - id: Attachment UUID
        - filename: Original filename
        - content_type: MIME type
        - file_size: Size in bytes
        - file_type: Categorized type (image, document, etc.)
        - status: "uploaded"
        - attachment_url: Pre-signed download URL

    Status Codes:
        - 200: Upload completed successfully
        - 400: File not found in S3 (upload may have failed)
        - 401: Invalid or missing authentication
        - 404: Attachment not found
        - 409: Attachment already processed
        - 500: Internal server error

    Example Request:
        PATCH /api/v2/attachments/att-001?chat_id=xyz-789

    Example Response:
        {
            "id": "att-001",
            "filename": "screenshot.png",
            "content_type": "image/png",
            "file_size": 524288,
            "file_type": "image",
            "status": "uploaded",
            "attachment_url": "https://s3.amazonaws.com/...?X-Amz-Signature=..."
        }

    Notes:
        - S3 verification is performed before marking as uploaded
        - If S3 file is missing, returns 400 error
        - Status must be "pending" to complete
        - Download URL is valid for 1 hour
        - User must own the attachment
        - Deprecated V1 endpoint: PATCH /api/v1/attachments/complete-upload/
    """
    try:
        user_id = current_user.id
        # Get attachment
        stmt = select(MessageAttachment).where(
            MessageAttachment.id == attachment_id,
            MessageAttachment.chat_id == chat_id,
            MessageAttachment.user_id == user_id,
        )
        result = await db.execute(stmt)
        attachment = result.scalar_one_or_none()

        if not attachment:
            return JSONResponse(status_code=404, content={"detail": "Attachment not found"})

        if attachment.status != "pending":
            return JSONResponse(
                status_code=409,
                content={"detail": f"Attachment already {attachment.status}"},
            )

        # Verify file exists in S3 before marking as uploaded
        try:
            s3_client = get_s3_client()
            s3_client.head_object(Bucket=S3_BUCKET, Key=attachment.file_path)
            log.info(f"Verified S3 file exists: {attachment.file_path}")
        except Exception as s3_error:
            log.error(f"S3 file verification failed for {attachment.file_path}: {s3_error}")
            return JSONResponse(
                status_code=400,
                content={
                    "detail": "File not found in S3. Please upload the file first.",
                    "s3_path": attachment.file_path,
                },
            )

        # Update attachment status only after S3 verification
        attachment.status = "uploaded"
        download_url = get_presigned_url_download(attachment)

        await db.commit()
        await db.refresh(attachment)

        # Prepare response
        return JSONResponse(
            content=AttachmentDetailResponse(
                id=str(attachment.id),
                filename=attachment.original_filename,
                content_type=attachment.content_type,
                file_size=attachment.file_size,
                file_type=attachment.file_type,
                status=attachment.status,
                attachment_url=download_url,
            ).model_dump()
        )

    except Exception as e:
        log.error(f"Error completing attachment upload: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@router.get("/{attachment_id}")
async def get_attachment(
    attachment_id: UUID4 = Path(..., description="UUID of the attachment"),
    chat_id: UUID4 = Query(..., description="UUID of the chat"),
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user),
):
    """
    Get attachment metadata and pre-signed URLs.

    This endpoint retrieves attachment information and generates temporary
    pre-signed URLs for downloading and previewing the file. URLs are valid
    for a limited time (typically 1 hour for downloads, 5 minutes for previews).

    The endpoint verifies:
    - Attachment exists and belongs to the user
    - File is in "uploaded" status
    - File exists in S3 storage

    Args:
        attachment_id: UUID of the attachment (path parameter)
        chat_id: UUID of the chat (query parameter for verification)
        db: Database session (injected)
        session: Session cookie for authentication (injected)

    Returns:
        JSON response with:
        - download_url: Pre-signed URL for downloading file
        - preview_url: Pre-signed URL for inline preview
        - filename: Original filename
        - content_type: MIME type
        - file_size: Size in bytes

    Status Codes:
        - 200: URLs generated successfully
        - 400: Invalid UUID format
        - 401: Invalid or missing authentication
        - 404: Attachment or file not found
        - 500: Internal server error

    Example Request:
        GET /api/v2/attachments/att-001?chat_id=xyz-789

    Example Response:
        {
            "download_url": "https://s3.amazonaws.com/.../download?X-Amz-Signature=...",
            "preview_url": "https://s3.amazonaws.com/.../preview?X-Amz-Signature=...",
            "filename": "screenshot.png",
            "content_type": "image/png",
            "file_size": 524288
        }

    Notes:
        - Download URL sets Content-Disposition: attachment
        - Preview URL allows inline display in browser
        - URLs expire after use or timeout
        - User must own the attachment
        - File must be in "uploaded" status
        - Deprecated V1 endpoint: GET /api/v1/attachments/get-url/

    Use Cases:
        - Display file in chat UI
        - Download file to user's device
        - Preview images/PDFs inline
        - Generate shareable links
    """
    try:
        user_id = current_user.id
        # Get attachment owned by this user
        stmt = select(MessageAttachment).where(
            MessageAttachment.id == attachment_id,
            MessageAttachment.chat_id == chat_id,
            MessageAttachment.user_id == user_id,
            MessageAttachment.status == "uploaded",
        )
        result = await db.execute(stmt)
        attachment = result.scalar_one_or_none()

        if not attachment:
            return JSONResponse(
                status_code=404,
                content={"detail": "Attachment not found or not uploaded"},
            )

        # Verify file exists in S3
        try:
            s3_client = get_s3_client()
            s3_client.head_object(Bucket=S3_BUCKET, Key=attachment.file_path)
        except Exception as s3_error:
            log.error(f"S3 file verification failed for {attachment.file_path}: {s3_error}")
            return JSONResponse(status_code=404, content={"detail": "File not found in S3"})

        # Use utility functions for URL generation
        download_url = get_presigned_url_download(attachment)
        preview_url = get_presigned_url_preview(attachment)

        return JSONResponse(
            content={
                "download_url": download_url,
                "preview_url": preview_url,
                "filename": attachment.original_filename,
                "content_type": attachment.content_type,
                "file_size": attachment.file_size,
            }
        )

    except Exception as e:
        log.error(f"Error generating attachment URLs: {e!s}")
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


# @router.delete("/{attachment_id}")
# async def delete_attachment(
#     attachment_id: UUID4 = Path(..., description="UUID of the attachment to delete"),
#     chat_id: UUID4 = Query(..., description="UUID of the chat"),
#     db: AsyncSession = Depends(get_async_session),
#     session: str = Depends(cookie_schema),
# ):
#     """
#     Delete an attachment (soft delete).

#     This endpoint performs a soft delete on an attachment, marking it as deleted
#     without removing the actual file from S3. The attachment will no longer appear
#     in chat attachment lists but the file remains for potential recovery.

#     Args:
#         attachment_id: UUID of the attachment to delete (path parameter)
#         chat_id: UUID of the chat (query parameter for verification)
#         db: Database session (injected)
#         session: Session cookie for authentication (injected)

#     Returns:
#         JSON response with:
#         - detail: Success message

#     Status Codes:
#         - 200: Attachment deleted successfully
#         - 401: Invalid or missing authentication
#         - 404: Attachment not found
#         - 500: Internal server error

#     Example Request:
#         DELETE /api/v2/attachments/att-001?chat_id=xyz-789

#     Example Response:
#         {
#             "detail": "Attachment deleted successfully"
#         }

#     Notes:
#         - This is a soft delete (file remains in S3)
#         - Deleted attachments don't appear in list endpoints
#         - User must own the attachment
#         - Deleted attachments can potentially be recovered
#         - For hard delete, manual S3 cleanup is required
#         - Deprecated V1 endpoint: DELETE /api/v1/attachments/delete-attachment/ (was commented out)
#     """
#     try:
#         auth = await is_valid_session(session)
#         if not auth.user:
#             return JSONResponse(status_code=401, content={"detail": "Invalid User"})
#         user_id = auth.user.id
#     except Exception as e:
#         log.error(f"Error validating session: {e!s}")
#         return JSONResponse(status_code=401, content={"detail": "Invalid Session"})

#     try:
#         # Get attachment
#         stmt = select(MessageAttachment).where(
#             MessageAttachment.id == attachment_id,
#             MessageAttachment.chat_id == chat_id,
#             MessageAttachment.user_id == user_id,
#         )
#         result = await db.execute(stmt)
#         attachment = result.scalar_one_or_none()

#         if not attachment:
#             return JSONResponse(status_code=404, content={"detail": "Attachment not found"})

#         # Soft delete
#         attachment.soft_delete()
#         await db.commit()

#         return JSONResponse(content={"detail": "Attachment deleted successfully"})

#     except Exception as e:
#         log.error(f"Error deleting attachment: {e!s}")
#         return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
