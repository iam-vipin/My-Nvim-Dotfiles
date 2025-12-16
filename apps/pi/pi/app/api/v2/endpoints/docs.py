"""
Documentation webhook endpoints for processing GitHub documentation updates.

This module handles webhook events from GitHub to keep documentation
indexed in the vector store up to date.
"""

import hashlib
import hmac
import logging
from typing import Dict
from typing import List
from typing import Union

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from fastapi import status
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi import settings
from pi.app.api.v2.helpers.github_api import get_net_file_changes
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.core.vectordb import VectorStore
from pi.services.retrievers.pg_store import create_webhook_record
from pi.services.retrievers.pg_store import get_last_processed_commit
from pi.services.retrievers.pg_store import get_webhook_by_commit
from pi.services.retrievers.pg_store import update_webhook_record
from pi.vectorizer.docs.initial_feed import get_all_file_paths
from pi.vectorizer.docs.initial_feed import process_file

router = APIRouter()
log = logger.getChild(__name__)
log.setLevel(logging.INFO)


def verify_signature(payload_body: bytes, secret_token: str, signature_header: str) -> bool:
    """
    Verify the webhook signature using HMAC-SHA256.

    Args:
        payload_body: Raw request body bytes
        secret_token: Secret token for HMAC verification
        signature_header: The X-Hub-Signature-256 header value

    Returns:
        bool: True if signature is valid, False otherwise
    """
    if not signature_header:
        return False
    hash_object = hmac.new(secret_token.encode("utf-8"), msg=payload_body, digestmod=hashlib.sha256)
    expected_signature = "sha256=" + hash_object.hexdigest()
    return hmac.compare_digest(expected_signature, signature_header)


@router.post(
    "/webhooks",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Process documentation webhook",
    response_description="Webhook processing initiated",
)
async def process_documentation_webhook(
    request: Request,
    db: AsyncSession = Depends(get_async_session),
):
    """
    Process GitHub webhook events for documentation updates.

    This endpoint handles webhook events from GitHub to synchronize documentation
    changes with the vector store. It processes added, modified, and removed files,
    maintaining an up-to-date documentation index.

    **Authentication:**
    - Verified using GitHub webhook signature (X-Hub-Signature-256 header)

    **Webhook Payload:**
    ```json
    {
        "current_commit_id": "abc123def456",
        "repo_name": "makeplane/plane",
        "branch_name": "main"
    }
    ```

    **Processing Logic:**
    1. Verifies webhook signature for security
    2. Checks if commit already processed (idempotency)
    3. Compares with last processed commit to find changes
    4. Processes file changes:
       - **Added/Modified**: Indexes content in vector store
       - **Removed**: Deletes from vector store
    5. Records processing status in database

    Args:
        request: FastAPI request object containing webhook payload
        db: Database session

    Returns:
        dict: Processing status
            - status: "already_processed" | "Webhook processed" | "Webhook processing failed"

    Raises:
        HTTPException:
            - 400: Missing required fields (current_commit_id, repo_name)
            - 401: Missing or invalid webhook signature
            - 500: Webhook secret not configured or processing error

    Status Codes:
        - 202: Webhook accepted and processed
        - 400: Bad request (missing required fields)
        - 401: Unauthorized (invalid signature)
        - 500: Internal server error

    Example Response (Already Processed):
    ```json
    {
        "status": "already_processed"
    }
    ```

    Example Response (Success):
    ```json
    {
        "status": "Webhook processed"
    }
    ```

    Example Response (Failure):
    ```json
    {
        "status": "Webhook processing failed"
    }
    ```

    Notes:
        - Webhook URL must be configured in GitHub repository settings
        - Signature verification prevents unauthorized webhook calls
        - First webhook for a repository processes all files (initial feed)
        - Subsequent webhooks process only changed files (differential update)
        - Failed files are logged but don't stop processing
    """
    # Verify webhook secret is configured
    if not settings.vector_db.DOCS_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured",
        )

    # Verify webhook signature
    signature = request.headers.get("X-Hub-Signature-256")
    payload_body = await request.body()

    if not signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No signature received",
        )

    if not verify_signature(payload_body, settings.vector_db.DOCS_WEBHOOK_SECRET, signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature",
        )

    # Parse and validate payload
    payload = await request.json()
    current_commit_id = payload.get("current_commit_id")
    repo_name = payload.get("repo_name")
    branch_name = payload.get("branch_name")

    if not current_commit_id or not repo_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing current_commit_id or repo_name in payload",
        )

    log.info(f"Processing webhook for repository: {repo_name}, commit: {current_commit_id}")

    # Check if commit already processed (idempotency)
    existing_webhook = await get_webhook_by_commit(db, current_commit_id, repo_name, branch_name)
    if existing_webhook and existing_webhook.processed:
        log.info(f"Commit {current_commit_id} for {repo_name} already processed successfully")
        return {"status": "already_processed"}

    # Create or reuse webhook record
    webhook_record = existing_webhook or await create_webhook_record(db, current_commit_id, repo_name, branch_name)

    try:
        # Get last processed commit to determine what changed
        last_processed_commit = await get_last_processed_commit(db, repo_name, branch_name)

        file_changes: Dict[str, Union[List[str], str]]

        if not last_processed_commit:
            # Initial feed: process all files
            log.info(f"No previous processed commits found for {repo_name}. " f"Starting initial feeding - processing all files as 'added'.")
            all_files = get_all_file_paths(repo_name)

            if isinstance(all_files, str):
                # Error occurred
                await update_webhook_record(db, webhook_record, processed=False, error_message=all_files)
                return {"status": "Webhook processing failed"}

            file_changes = {"added": all_files, "modified": [], "removed": []}
        else:
            # Differential update: get net changes since last processed commit
            base_commit = last_processed_commit
            file_changes = get_net_file_changes(repo_name, base_commit, current_commit_id)

        # Normalize file lists
        added_files = file_changes.get("added", [])
        modified_files = file_changes.get("modified", [])
        removed_files = file_changes.get("removed", [])

        if not isinstance(added_files, list):
            added_files = []
        if not isinstance(modified_files, list):
            modified_files = []
        if not isinstance(removed_files, list):
            removed_files = []

        total_files_to_process = len(added_files) + len(modified_files) + len(removed_files)

        # Handle case where no files to process but there might be an error
        if total_files_to_process == 0:
            if file_changes.get("error"):
                error_msg = file_changes["error"]
                error_message = str(error_msg) if not isinstance(error_msg, str) else error_msg
                await update_webhook_record(db, webhook_record, processed=False, error_message=error_message)
                return {"status": "Webhook processing failed"}

        log.info(f"Files to process - Added: {len(added_files)}, " f"Modified: {len(modified_files)}, Removed: {len(removed_files)}")

        # Process files with vector store
        async with VectorStore() as vector_db:
            success_count = 0
            failed_files = []
            docs_to_index = []

            # Process added and modified files
            for file_path in added_files + modified_files:
                try:
                    doc = process_file(repo_name, file_path)
                    if doc["content"].strip():
                        docs_to_index.append(doc)
                except Exception as e:
                    log.error(f"Error processing file {file_path}: {e}")
                    failed_files.append(file_path)

            # Bulk index documents
            if docs_to_index:
                try:
                    success, failures = await vector_db.async_feed(
                        index_name=settings.vector_db.DOCS_INDEX,
                        docs=docs_to_index,
                    )
                    success_count += success
                    failed_files.extend([f.get("id", "unknown") for f in failures])
                    log.info(f"Successfully indexed {success} documents")
                except Exception as e:
                    log.error(f"Error during bulk indexing: {e}")
                    failed_files.extend([d["id"] for d in docs_to_index])

            # Process removed files (only for differential updates)
            if last_processed_commit:
                for file_path in removed_files:
                    try:
                        # Generate unique document ID from file path
                        unique_id = file_path.replace("/", "_").replace("-", "_").replace(".mdx", "").replace(".txt", "")
                        resp = await vector_db.async_delete_document(
                            index_name=settings.vector_db.DOCS_INDEX,
                            document_id=unique_id,
                        )
                        if resp.get("result") == "deleted":
                            success_count += 1
                    except Exception as e:
                        log.error(f"Error deleting file {file_path}: {e}")
                        failed_files.append(file_path)

        # Update webhook record with results
        processed_bool = len(failed_files) == 0
        await update_webhook_record(
            db,
            webhook_record,
            processed=processed_bool,
            files_processed=success_count,
            error_message=None if processed_bool else f"Failed files: {", ".join(failed_files)}",
        )

        return {"status": "Webhook processed"}

    except Exception as e:
        error_message = str(e)
        await update_webhook_record(db, webhook_record, processed=False, error_message=error_message)
        log.error(f"Error processing webhook for {repo_name}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing webhook: {error_message}",
        )
