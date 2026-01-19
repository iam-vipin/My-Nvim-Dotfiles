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
