"""Action artifacts endpoint."""

import uuid
from typing import Any
from typing import List

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from pydantic import UUID4

from pi import logger
from pi.app.api.v1.dependencies import cookie_schema
from pi.app.api.v1.dependencies import is_valid_session
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.actions.artifacts.utils import prepare_artifact_data
from pi.services.retrievers.pg_store.action_artifact import get_action_artifacts_by_chat_id
from pi.services.retrievers.pg_store.action_artifact import get_action_artifacts_by_ids

log = logger.getChild(__name__)
router = APIRouter()


def serialize_for_json(obj: Any) -> Any:
    """Convert objects to JSON-serializable format."""
    if isinstance(obj, uuid.UUID):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: serialize_for_json(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    else:
        return obj


@router.get("/")
async def get_action_artifacts(artifact_ids: List[UUID4], session: str = Depends(cookie_schema), db=Depends(get_async_session)):
    """
    Retrieve action artifacts by their IDs.
    """
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"success": False, "detail": "Invalid User"})
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"success": False, "detail": "Invalid Session"})

    try:
        # Get the action artifacts
        artifacts = await get_action_artifacts_by_ids(db, artifact_ids)

        # Return enhanced artifact data
        artifacts_data = []
        for artifact in artifacts:
            # Prepare enhanced data for UI display
            try:
                from pi.services.actions.artifacts.utils import prepare_artifact_data

                enhanced_data = await prepare_artifact_data(artifact.entity, artifact.data)
            except Exception as e:
                log.warning(f"Error preparing artifact data for {artifact.id}: {e}")
                enhanced_data = artifact.data

            artifact_dict = {
                "artifact_id": str(artifact.id),  # Renamed from 'id' to match stream format
                "sequence": artifact.sequence,
                "artifact_type": artifact.entity,  # Renamed from 'entity' to match stream format
                "entity_id": str(artifact.entity_id) if artifact.entity_id else None,
                "action": artifact.action,
                "parameters": serialize_for_json(enhanced_data),  # Renamed from 'data' to match stream format
                "success": artifact.success,  # Individual artifact success from database
                "is_executed": artifact.is_executed,
                "created_at": artifact.created_at.isoformat() if artifact.created_at else None,
                "updated_at": artifact.updated_at.isoformat() if artifact.updated_at else None,
            }
            artifacts_data.append(artifact_dict)

        return JSONResponse(status_code=200, content={"success": True, "artifacts": artifacts_data})

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Get action artifacts failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/{chat_id}/")
async def get_chat_artifacts(chat_id: UUID4, session: str = Depends(cookie_schema), db=Depends(get_async_session)):
    """
    Retrieve all action artifacts for a specific chat.
    """
    try:
        auth = await is_valid_session(session)
        if not auth.user:
            return JSONResponse(status_code=401, content={"success": False, "detail": "Invalid User"})
    except Exception as e:
        log.error(f"Error validating session: {e!s}")
        return JSONResponse(status_code=401, content={"success": False, "detail": "Invalid Session"})

    try:
        # Get the action artifacts for the chat
        artifacts = await get_action_artifacts_by_chat_id(db, chat_id)
        # Return enhanced artifact data
        artifacts_data = []
        for artifact in artifacts:
            # Prepare enhanced data for UI display
            try:
                enhanced_data = await prepare_artifact_data(artifact.entity, artifact.data)
            except Exception as e:
                log.warning(f"Error preparing artifact data for {artifact.id}: {e}")
                enhanced_data = artifact.data

            # Extract entity_url and identifier if available from persisted entity_info
            entity_url = None
            issue_identifier = None
            try:
                if isinstance(artifact.data, dict):
                    entity_info = artifact.data.get("entity_info")
                    if isinstance(entity_info, dict):
                        entity_url = entity_info.get("entity_url")
                        issue_identifier = entity_info.get("issue_identifier")
            except Exception:
                entity_url = None
                issue_identifier = None

            # Extract project_identifier from planning_data/tool_args or entity_info if persisted
            project_identifier = None
            try:
                if isinstance(artifact.data, dict):
                    # Some flows may persist project info under planning_data.parameters.project.identifier
                    planning_data = artifact.data.get("planning_data") or {}
                    params = planning_data.get("parameters") or {}
                    project_block = params.get("project")
                    if isinstance(project_block, dict):
                        project_identifier = project_block.get("identifier")
                    # Fallback 1: check entity_info for a project identifier
                    if not project_identifier:
                        entity_info = artifact.data.get("entity_info") or {}
                        if isinstance(entity_info, dict):
                            # For work-items, we already expose issue_identifier; for projects, support a generic identifier
                            if entity_info.get("project_identifier"):
                                project_identifier = entity_info.get("project_identifier")
                            elif entity_info.get("entity_type") == "project" and entity_info.get("entity_identifier"):
                                project_identifier = entity_info.get("entity_identifier")
                    # Fallback: if entity_info has identifier-like info in URL (but we avoid parsing here)
            except Exception:
                project_identifier = None

            artifact_dict = {
                "artifact_id": str(artifact.id),  # Renamed from 'id' to match stream format
                "sequence": artifact.sequence,
                "artifact_type": artifact.entity,  # Renamed from 'entity' to match stream format
                "entity_id": str(artifact.entity_id) if artifact.entity_id else None,
                "action": artifact.action,
                "parameters": serialize_for_json(enhanced_data),  # Renamed from 'data' to match stream format
                "success": artifact.success,  # Individual artifact success from database
                "is_executed": artifact.is_executed,
                "entity_url": entity_url,
                "project_identifier": project_identifier,
                "issue_identifier": issue_identifier,
                "created_at": artifact.created_at.isoformat() if artifact.created_at else None,
                "updated_at": artifact.updated_at.isoformat() if artifact.updated_at else None,
            }
            artifacts_data.append(artifact_dict)

        return JSONResponse(status_code=200, content={"success": True, "artifacts": artifacts_data})

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Get chat artifacts failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
