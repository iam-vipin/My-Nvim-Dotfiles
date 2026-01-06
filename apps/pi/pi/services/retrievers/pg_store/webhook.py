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

from typing import Optional

from sqlalchemy import desc
from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models.github_webhook import GitHubWebhook

log = logger.getChild(__name__)


async def get_last_processed_commit(session: AsyncSession, repo_name: str, branch_name: str) -> Optional[str]:
    """
    Get the last successfully processed commit ID for a repository.
    """
    query = (
        select(GitHubWebhook)
        .where(GitHubWebhook.source == repo_name)  # type: ignore[var-annotated,arg-type]
        .where(GitHubWebhook.branch_name == branch_name)  # type: ignore[var-annotated,arg-type]
        .where(GitHubWebhook.processed)  # type: ignore[var-annotated,arg-type]
        .order_by(desc(GitHubWebhook.created_at))  # type: ignore[arg-type]
        .limit(1)
    )

    result = await session.execute(query)
    webhook = result.scalar_one_or_none()

    if webhook:
        log.info(f"Last processed commit for {repo_name}: {webhook.commit_id}")
        return webhook.commit_id

    log.info(f"No processed commits found for {repo_name}")
    return None


async def create_webhook_record(
    session: AsyncSession,
    commit_id: str,
    repo_name: str,
    branch_name: str,
    processed: bool = False,
    files_processed: Optional[int] = None,
    error_message: Optional[str] = None,
) -> GitHubWebhook:
    """
    Create a new webhook record in the database.
    """
    webhook = GitHubWebhook(
        commit_id=commit_id,
        source=repo_name,
        branch_name=branch_name,
        processed=processed,
        files_processed=files_processed,
        error_message=error_message,
    )

    session.add(webhook)
    await session.commit()
    await session.refresh(webhook)

    log.info(f"Created webhook record for {repo_name}: {commit_id} (processed: {processed})")
    return webhook


async def update_webhook_record(
    session: AsyncSession, webhook: GitHubWebhook, processed: bool, files_processed: Optional[int] = None, error_message: Optional[str] = None
) -> GitHubWebhook:
    """
    Update an existing webhook record.
    """
    webhook.processed = processed
    if files_processed is not None:
        webhook.files_processed = files_processed
    if error_message is not None:
        webhook.error_message = error_message

    session.add(webhook)
    await session.commit()
    await session.refresh(webhook)

    log.info(f"Updated webhook record for {webhook.source}: {webhook.commit_id} (processed: {processed})")
    return webhook


async def get_webhook_by_commit(session: AsyncSession, commit_id: str, repo_name: str, branch_name: str):
    """
    Get a webhook record by commit ID and repository name.
    """
    query = (
        select(GitHubWebhook)
        .where(GitHubWebhook.commit_id == commit_id)  # type: ignore[var-annotated,arg-type]
        .where(GitHubWebhook.source == repo_name)  # type: ignore[var-annotated,arg-type]
        .where(GitHubWebhook.branch_name == branch_name)  # type: ignore[var-annotated,arg-type]
    )

    result = await session.execute(query)
    return result.scalar_one_or_none()
