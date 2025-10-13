from typing import Any
from typing import Dict
from typing import List
from typing import Optional

from pydantic import UUID4
from sqlalchemy import desc
from sqlalchemy import select
from sqlalchemy.orm import attributes
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.models import ActionArtifact

log = logger.getChild(__name__)


async def get_action_artifacts_by_ids(
    db: AsyncSession,
    artifact_ids: List[UUID4],
) -> List[ActionArtifact]:
    """
    Retrieves action artifacts by their IDs.
    """
    try:
        if not artifact_ids:
            return []

        stmt = (
            select(ActionArtifact)
            .where(ActionArtifact.id.in_(artifact_ids))  # type: ignore[union-attr,arg-type,attr-defined]
            .where(ActionArtifact.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .order_by(desc(ActionArtifact.created_at))  # type: ignore[union-attr,arg-type]
        )

        result = await db.execute(stmt)
        artifacts = list(result.scalars().all())

        return artifacts

    except Exception as e:
        log.error(f"Error retrieving action artifacts by IDs {artifact_ids}: {str(e)}")
        return []


async def get_action_artifacts_by_chat_id(
    db: AsyncSession,
    chat_id: UUID4,
    limit: Optional[int] = None,
) -> List[ActionArtifact]:
    """
    Retrieves action artifacts for a specific chat.
    """
    try:
        stmt = (
            select(ActionArtifact)
            .where(ActionArtifact.chat_id == chat_id)  # type: ignore[union-attr,arg-type]
            .where(ActionArtifact.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .order_by(desc(ActionArtifact.created_at))  # type: ignore[union-attr,arg-type]
        )

        if limit:
            stmt = stmt.limit(limit)

        result = await db.execute(stmt)
        artifacts = list(result.scalars().all())

        return artifacts

    except Exception as e:
        log.error(f"Error retrieving action artifacts for chat {chat_id}: {str(e)}")
        return []


async def get_action_artifacts_by_message_id(
    db: AsyncSession,
    message_id: UUID4,
) -> List[ActionArtifact]:
    """
    Retrieves action artifacts for a specific message.
    """
    try:
        stmt = (
            select(ActionArtifact)
            .where(ActionArtifact.message_id == message_id)  # type: ignore[union-attr,arg-type]
            .where(ActionArtifact.deleted_at.is_(None))  # type: ignore[union-attr,arg-type]
            .order_by(ActionArtifact.sequence)  # type: ignore[union-attr,arg-type]
        )

        result = await db.execute(stmt)
        artifacts = list(result.scalars().all())

        return artifacts

    except Exception as e:
        log.error(f"Error retrieving action artifacts for message {message_id}: {str(e)}")
        return []


async def create_action_artifact(
    db: AsyncSession,
    chat_id: UUID4,
    entity: str,
    action: str,
    data: Dict[str, Any],
    message_id: Optional[UUID4] = None,
    entity_id: Optional[UUID4] = None,
    sequence: int = 1,
    is_executed: bool = False,
    success: bool = False,
) -> Dict[str, Any]:
    """
    Creates a new action artifact record.

    Returns:
        A dictionary with operation status and the artifact object or error details.
    """
    try:
        # Create the new artifact record
        new_artifact = ActionArtifact(
            chat_id=chat_id,
            message_id=message_id,
            sequence=sequence,
            entity=entity,
            entity_id=entity_id,
            action=action,
            data=data,
            is_executed=is_executed,
            success=success,
        )

        # Add and commit
        db.add(new_artifact)
        await db.commit()
        await db.refresh(new_artifact)

        return {"message": "success", "artifact": new_artifact}

    except Exception as e:
        await db.rollback()
        log.error(f"Database create_action_artifact failed for chat {chat_id}: {str(e)}")
        return {"message": "error", "error": str(e)}


async def update_action_artifact_execution_status(
    db: AsyncSession,
    artifact_id: UUID4,
    is_executed: bool,
    success: bool,
    entity_id: Optional[UUID4] = None,
    entity_info: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Updates the execution status of an action artifact.

    Args:
        db: Database session
        artifact_id: ID of the artifact to update
        is_executed: New execution status
        entity_id: Optional entity ID to set (if entity was created)

    Returns:
        A dictionary with operation status and the artifact object or error details.
    """
    try:
        # Get the artifact
        stmt = select(ActionArtifact).where(ActionArtifact.id == artifact_id)  # type: ignore[arg-type]
        result = await db.execute(stmt)
        artifact = result.scalar_one_or_none()

        if not artifact:
            return {"message": "error", "error": f"Action artifact with ID {artifact_id} not found"}

        # Update execution status
        artifact.is_executed = is_executed
        artifact.success = success

        # Update entity_id if provided (when entity is created)
        if entity_id is not None:
            artifact.entity_id = entity_id

        # Persist entity_info (e.g., entity_url, entity_name, entity_type, entity_id, issue_identifier)
        if entity_info and isinstance(entity_info, dict):
            try:
                current_data: Dict[str, Any] = artifact.data or {}
                current_data["entity_info"] = entity_info
                artifact.data = current_data
                # Mark JSONB column as modified so SQLAlchemy persists changes
                attributes.flag_modified(artifact, "data")
            except Exception as _:
                # Don't fail if data shaping has issues; persistence of status is primary
                pass

        # Add and commit
        db.add(artifact)
        await db.commit()
        await db.refresh(artifact)

        return {"message": "success", "artifact": artifact}

    except Exception as e:
        await db.rollback()
        log.error(f"Database update_action_artifact_execution_status failed for artifact {artifact_id}: {str(e)}")
        return {"message": "error", "error": str(e)}


async def delete_action_artifact(
    db: AsyncSession,
    artifact_id: UUID4,
) -> Dict[str, Any]:
    """
    Soft deletes an action artifact.

    Returns:
        A dictionary with operation status and the artifact object or error details.
    """
    try:
        # Get the artifact
        stmt = select(ActionArtifact).where(ActionArtifact.id == artifact_id)  # type: ignore[arg-type]
        result = await db.execute(stmt)
        artifact = result.scalar_one_or_none()

        if not artifact:
            return {"message": "error", "error": f"Action artifact with ID {artifact_id} not found"}

        # Soft delete
        artifact.soft_delete()

        # Add and commit
        db.add(artifact)
        await db.commit()

        return {"message": "success", "artifact": artifact}

    except Exception as e:
        await db.rollback()
        log.error(f"Database delete_action_artifact failed for artifact {artifact_id}: {str(e)}")
        return {"message": "error", "error": str(e)}
