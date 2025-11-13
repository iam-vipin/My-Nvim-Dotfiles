from sqlalchemy import update
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models.workspace_vectorization import WorkspaceVectorization

log = logger.getChild(__name__)


async def set_live_sync_for_workspaces(
    db: AsyncSession,
    workspace_ids: list[str],
    live_sync_enabled: bool,
) -> int:
    """
    Set live_sync_enabled flag for multiple workspaces in a single query.

    Args:
        db: Database session
        workspace_ids: List of workspace IDs to update
        live_sync_enabled: Value to set for live_sync_enabled field

    Returns:
        Number of records updated
    """
    if not workspace_ids:
        return 0

    try:
        stmt = (
            update(WorkspaceVectorization)  # type: ignore[call-overload]
            .where(WorkspaceVectorization.workspace_id.in_(workspace_ids))  # type: ignore[attr-defined]
            .values(live_sync_enabled=live_sync_enabled)
        )

        result = await db.execute(stmt)
        await db.commit()

        updated_count = result.rowcount or 0  # type: ignore[attr-defined]
        log.info(
            "Updated live_sync_enabled=%s for %d workspace vectorization records across %d workspaces",
            live_sync_enabled,
            updated_count,
            len(workspace_ids),
        )

        return updated_count

    except Exception as exc:
        await db.rollback()
        log.error("Failed to update live_sync_enabled for workspaces %s: %s", workspace_ids, exc)
        raise
