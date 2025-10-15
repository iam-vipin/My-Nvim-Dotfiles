from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from fastapi import status
from fastapi.responses import JSONResponse
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.v1.dependencies import verify_internal_secret_key
from pi.app.models.llm import LlmModel
from pi.core.db.plane_pi.lifecycle import get_async_session

# Create logger for this module
log = logger.getChild(__name__)

# Create router with dependencies applied to all endpoints
router = APIRouter(
    dependencies=[Depends(verify_internal_secret_key)],
    include_in_schema=False,
)


@router.post("/llm/activate/", include_in_schema=False)
async def activate_llm(llm_id: UUID, db: AsyncSession = Depends(get_async_session)):
    """
    Activate an LLM by setting is_active to True.
    Requires internal API key for authentication.
    """
    try:
        statement = select(LlmModel).where(LlmModel.id == llm_id)
        execution = await db.exec(statement)
        llm = execution.first()

        if not llm:
            log.error(f"LLM with ID {llm_id} not found")
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": "LLM not found"})

        if llm.is_active:
            log.info(f"LLM {llm.name} is already active")
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "LLM is already active"})

        llm.is_active = True
        db.add(llm)
        await db.commit()
        await db.refresh(llm)

        log.info(f"LLM {llm.name} activated successfully")
        return JSONResponse(
            content={
                "detail": f"{llm.name} activated successfully",
                "llm": {"id": str(llm.id), "name": llm.name, "is_active": llm.is_active, "model_key": llm.model_key, "provider": llm.provider},
            }
        )
    except Exception as e:
        log.error(f"Error activating LLM {llm_id}: {e!s}")
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Internal Server Error"})


@router.post("/llm/deactivate/", include_in_schema=False)
async def deactivate_llm(llm_id: UUID, db: AsyncSession = Depends(get_async_session)):
    """
    Deactivate an LLM by setting is_active to False.
    Requires internal API key for authentication.
    """
    try:
        statement = select(LlmModel).where(LlmModel.id == llm_id)
        execution = await db.exec(statement)
        llm = execution.first()

        if not llm:
            log.error(f"LLM with ID {llm_id} not found")
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": "LLM not found"})

        if not llm.is_active:
            log.info(f"LLM {llm.name} is already inactive")
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": "LLM is already inactive"})

        llm.is_active = False
        db.add(llm)
        await db.commit()
        await db.refresh(llm)

        log.info(f"LLM {llm.name} deactivated successfully")
        return JSONResponse(
            content={
                "detail": f"{llm.name} deactivated successfully",
                "llm": {"id": str(llm.id), "name": llm.name, "is_active": llm.is_active, "model_key": llm.model_key, "provider": llm.provider},
            }
        )
    except Exception as e:
        log.error(f"Error deactivating LLM {llm_id}: {e!s}")
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": "Internal Server Error"})
