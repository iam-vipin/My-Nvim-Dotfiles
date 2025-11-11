from fastapi import APIRouter
from fastapi import status
from fastapi.responses import JSONResponse

from pi import logger

log = logger.getChild(__name__)

router = APIRouter()


@router.get("/health/", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Indicates whether the service is alive and running.

    Returns:
        200 OK: Service is alive
    """
    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": "alive"})
