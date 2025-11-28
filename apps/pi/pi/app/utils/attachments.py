import asyncio
import base64
import io
import re
import unicodedata
from pathlib import Path
from typing import Optional
from typing import Tuple

import boto3
from botocore.client import Config
from PIL import Image
from pypdf import PdfReader

from pi import logger
from pi.app.models.message_attachment import MessageAttachment
from pi.config import settings

log = logger.getChild(__name__)

# S3 Configuration
S3_BUCKET = settings.AWS_S3_BUCKET
S3_REGION = settings.AWS_S3_REGION

allowed_attachment_types = ["image/jpeg", "image/png", "application/pdf", "image/gif", "image/webp"]

# Heuristic size thresholds (in bytes)
MIN_FILE_SIZE_BYTES = 32  # reject obviously empty/corrupt payloads
MIN_PDF_SIZE_BYTES = 256  # PDFs below this are almost always bogus junk


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


def detect_file_type(file_data: bytes) -> str:
    """
    Detect file type based on file signatures (magic bytes).

    Args:
        file_data: Raw file bytes

    Returns:
        Detected MIME type
    """
    if not file_data:
        return "unknown"

    # Check file signatures
    if file_data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    elif file_data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    elif file_data.startswith(b"GIF87a") or file_data.startswith(b"GIF89a"):
        return "image/gif"
    elif file_data.startswith(b"RIFF") and b"WEBP" in file_data[:12]:
        return "image/webp"
    elif file_data.startswith(b"%PDF-"):
        return "application/pdf"
    else:
        return "unknown"


async def validate_file_content(file_data: bytes, content_type: str, filename: str) -> Tuple[bool, str]:
    """
    Validate file content for malicious content.

    Args:
        file_data: Raw file bytes
        content_type: Declared MIME type
        filename: Original filename

    Returns:
        Tuple of (is_safe, error_message)
    """
    try:
        # 1. Verify actual file type matches declared content type
        detected_type = detect_file_type(file_data)
        if detected_type != "unknown" and detected_type != content_type:
            return False, f"File type mismatch: declared {content_type}, detected {detected_type}"

        # 2. Check for suspicious file signatures
        # Known malicious file signatures to block
        malicious_signatures = [
            b"\x4d\x5a",  # PE executable
            b"\x7f\x45\x4c\x46",  # ELF executable
            b"\xca\xfe\xba\xbe",  # Java class file
            b"\xfe\xed\xfa",  # Mach-O executable
        ]

        for sig in malicious_signatures:
            if file_data.startswith(sig):
                return False, "File contains executable code"

        # 3. For images, validate they're actually images
        if content_type.startswith("image/"):
            try:
                Image.open(io.BytesIO(file_data)).verify()
            except Exception:
                return False, "Invalid image file"

        # 4. For PDFs, check for embedded JavaScript or suspicious objects
        if content_type == "application/pdf":
            try:
                pdf_content = file_data.decode("latin-1", errors="ignore")
                suspicious_patterns = [
                    "/JavaScript",
                    "/JS",
                    "/OpenAction",
                    "/Launch",
                    "/EmbeddedFile",
                    "eval(",
                    "unescape(",
                ]

                for pattern in suspicious_patterns:
                    if pattern in pdf_content:
                        return False, f"PDF contains potentially malicious content: {pattern}"
            except Exception:
                # If we can't decode, it might be a binary PDF which is safer
                pass

            # Check if PDF is password-protected
            is_protected, error_msg = is_pdf_password_protected(file_data)
            if is_protected:
                return False, f"Password-protected PDFs are not allowed: {error_msg}"

        # 5. Check file size vs content (basic heuristic)
        file_size = len(file_data)
        if file_size < MIN_FILE_SIZE_BYTES:
            return False, "File is empty or corrupted"

        if content_type == "application/pdf" and file_size < MIN_PDF_SIZE_BYTES:
            return False, "PDF appears to be incomplete"

        return True, ""

    except Exception as e:
        return False, f"Content validation error: {str(e)}"


async def scan_file_for_malware(file_data: bytes, content_type: str, filename: str) -> Tuple[bool, str]:
    """
    Comprehensive malware scanning for uploaded files.

    Args:
        file_data: Raw file bytes
        content_type: Declared MIME type
        filename: Original filename

    Returns:
        Tuple of (is_safe, error_message)
    """
    # Basic content validation
    is_safe, error_msg = await validate_file_content(file_data, content_type, filename)
    if not is_safe:
        return False, error_msg

    # Additional security checks
    try:
        # Check for embedded scripts in images
        if content_type.startswith("image/"):
            # Look for script tags or executable content in image data
            suspicious_strings = [
                b"<script",
                b"javascript:",
                b"vbscript:",
                b"data:text/html",
                b"<iframe",
                b"<object",
                b"<embed",
            ]

            for suspicious in suspicious_strings:
                if suspicious in file_data.lower():
                    return False, f"Image contains suspicious content: {suspicious.decode()}"

        # Check for zip bombs or compressed content
        if file_data.startswith(b"PK"):  # ZIP file signature
            return False, "Compressed files are not allowed"

        # Check for extremely large files that might be zip bombs (respect configured limit)
        if len(file_data) > settings.FILE_SIZE_LIMIT:
            return False, f"File exceeds configured limit ({settings.FILE_SIZE_LIMIT} bytes)"

        return True, ""

    except Exception as e:
        return False, f"Malware scanning error: {str(e)}"


def is_pdf_password_protected(file_data: bytes) -> Tuple[bool, str]:
    """
    Check if a PDF file is password-protected.

    Args:
        file_data: Raw PDF file bytes

    Returns:
        Tuple of (is_password_protected, error_message)
    """
    try:
        # Create a BytesIO object from the file data
        pdf_stream = io.BytesIO(file_data)

        # Try to read the PDF
        reader = PdfReader(pdf_stream)

        # Check if the PDF is encrypted/password-protected
        if reader.is_encrypted:
            return True, "PDF is password-protected"

        return False, ""

    except Exception as e:
        # If we can't read the PDF, it might be corrupted or not a valid PDF
        # We'll allow it through and let other validation catch it
        log.warning(f"Could not check PDF encryption status: {str(e)}")
        return False, ""


def get_file_hash(file_data: bytes) -> str:
    """
    Generate SHA-256 hash of file content for tracking and deduplication.

    Args:
        file_data: Raw file bytes

    Returns:
        SHA-256 hash as hex string
    """
    import hashlib

    return hashlib.sha256(file_data).hexdigest()
