"""Simple transcription endpoint."""

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import UploadFile
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v1.dependencies import jwt_schema
from pi.app.api.v1.dependencies import validate_jwt_token
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.transcription.transcribe import process_transcription

log = logger.getChild(__name__)
mobile_router = APIRouter()


@mobile_router.post("/transcribe")
async def transcribe_file(
    workspace_id: UUID4,
    chat_id: UUID4,
    file: UploadFile,
    db: AsyncSession = Depends(get_async_session),
    token: HTTPAuthorizationCredentials = Depends(jwt_schema),
):
    """Transcribe audio file."""
    try:
        auth = await validate_jwt_token(token)
        if not auth.user:
            return JSONResponse(status_code=401, content={"detail": "Invalid User"})
        user_id = auth.user.id
    except Exception as e:
        log.error(f"Error validating JWT: {e!s}")
        return JSONResponse(status_code=401, content={"detail": "Invalid JWT"})

    try:
        success, message = await process_transcription(workspace_id, chat_id, file, user_id, db)
        if success:
            return JSONResponse(status_code=200, content={"detail": message})
        else:
            return JSONResponse(status_code=500, content={"detail": message})

    except HTTPException:
        raise
    except Exception as e:
        log.error(f"Transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
