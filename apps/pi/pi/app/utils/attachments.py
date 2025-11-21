import asyncio
import base64
import re
import unicodedata
from pathlib import Path
from typing import Optional

import boto3
from botocore.client import Config

from pi import logger
from pi.app.models.message_attachment import MessageAttachment
from pi.config import settings

log = logger.getChild(__name__)

# S3 Configuration
S3_BUCKET = settings.AWS_S3_BUCKET
S3_REGION = settings.AWS_S3_REGION

allowed_attachment_types = ["image/jpeg", "image/png", "application/pdf", "image/gif", "image/webp"]


def get_s3_client():
    """Get configured S3 client."""
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=S3_REGION,
        config=Config(signature_version="s3v4"),
    )


def get_presigned_url_download(attachment: MessageAttachment, expires_in: Optional[int] = 600) -> Optional[str]:
    """
    Generate presigned download URL for an attachment.

    Args:
        attachment: MessageAttachment instance
        expires_in: URL expiration time in seconds (default: 600 = 10 minutes)

    Returns:
        Presigned download URL or None if failed
    """
    if not attachment.file_path or attachment.status != "uploaded":
        return None

    try:
        s3_client = get_s3_client()
        download_url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": attachment.file_path,
                "ResponseContentDisposition": f"attachment; filename*=UTF-8''{attachment.original_filename}",
            },
            ExpiresIn=expires_in,
        )
        return download_url
    except Exception as e:
        log.error(f"Failed to generate presigned URL for attachment {attachment.id}: {e}")
        return None


def get_presigned_url_preview(attachment: MessageAttachment, expires_in: int = 300) -> Optional[str]:
    """
    Generate presigned preview URL for an attachment (inline render).

    Args:
        attachment: MessageAttachment instance
        expires_in: URL expiration time in seconds (default: 300 = 5 minutes)

    Returns:
        Presigned preview URL or None if failed
    """
    if not attachment.file_path or attachment.status != "uploaded":
        return None

    try:
        s3_client = get_s3_client()
        preview_url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": S3_BUCKET,
                "Key": attachment.file_path,
                "ResponseContentDisposition": "inline",
            },
            ExpiresIn=expires_in,
        )
        return preview_url
    except Exception as e:
        log.error(f"Failed to generate presigned preview URL for attachment {attachment.id}: {e}")
        return None


async def get_attachment_base64_data(attachment: MessageAttachment) -> Optional[str]:
    """
    Fetch file data from S3 and return as base64 encoded string.

    Args:
        attachment: MessageAttachment instance

    Returns:
        Base64 encoded file data or None if failed
    """
    if not attachment.file_path or attachment.status != "uploaded":
        return None

    try:
        s3_client = get_s3_client()

        # Download file data from S3 using asyncio.to_thread for blocking I/O
        response = await asyncio.to_thread(s3_client.get_object, Bucket=S3_BUCKET, Key=attachment.file_path)
        file_data = await asyncio.to_thread(response["Body"].read)

        # Encode to base64
        base64_data = base64.b64encode(file_data).decode("utf-8")
        return base64_data

    except Exception as e:
        log.error(f"Error fetching file data from S3: {e}")
        return None


def sanitize_filename(filename: str, max_length: int = 150) -> str:
    """
    Sanitize a filename for safe use in S3 and Content-Disposition headers.
    - Removes/normalizes weird unicode characters
    - Replaces spaces with underscores
    - Removes unsafe symbols (keeps letters, numbers, dot, dash, underscore)
    - Truncates if too long
    """

    # Normalize unicode → removes invisible chars like U+202F
    filename = unicodedata.normalize("NFKD", filename)

    # Split extension
    name, ext = Path(filename).stem, Path(filename).suffix

    # Replace spaces and colons with safe chars
    name = name.replace(" ", "_").replace(":", "-")

    # Remove anything not safe
    name = re.sub(r"[^A-Za-z0-9._-]", "", name)

    # Truncate to max length (to avoid OS/S3 issues with very long names)
    if len(name) > max_length:
        name = name[:max_length]

    # Ensure not empty
    if not name:
        name = "file"

    return f"{name}{ext}"
