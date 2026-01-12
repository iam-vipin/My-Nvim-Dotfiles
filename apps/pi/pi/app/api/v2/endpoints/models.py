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

from fastapi import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from pydantic import UUID4
from sqlmodel.ext.asyncio.session import AsyncSession

from pi import logger
from pi.app.api.dependencies import get_current_user
from pi.app.schemas.chat import ModelsResponse
from pi.core.db.plane_pi.lifecycle import get_async_session
from pi.services.chat.utils import resolve_workspace_slug
from pi.services.retrievers.pg_store import get_active_models

log = logger.getChild("v2.models")
router = APIRouter()


@router.get("/", response_model=ModelsResponse)
async def get_models(
    workspace_id: Optional[UUID4] = None,
    workspace_slug: Optional[str] = None,
    db: AsyncSession = Depends(get_async_session),
    current_user=Depends(get_current_user),
):
    """
    Get list of available AI models for a workspace.

    This endpoint returns the list of LLM models that are active and available
    for the user in the specified workspace. Models can be filtered by workspace
    to show only models that are enabled for that workspace.

    Args:
        workspace_id: Optional workspace UUID to filter models
        workspace_slug: Optional workspace slug to filter models
        db: Database session
        session: Session cookie for authentication

    Returns:
        JSONResponse with:
        - models: List of available model objects with details

    Response Model:
        ModelsResponse containing list of model configurations
    """
    user_id = current_user.id

    if not workspace_slug:
        if workspace_id:
            resolved_workspace_slug = await resolve_workspace_slug(workspace_id, workspace_slug)
        else:
            log.warning("get-models: No workspace_id to resolve workspace_slug from")
            resolved_workspace_slug = None
    else:
        resolved_workspace_slug = workspace_slug

    # Convert user_id to string and provide default workspace_slug if None
    models_list = await get_active_models(db=db, user_id=str(user_id), workspace_slug=resolved_workspace_slug or "")

    # Check if models_list is a tuple (error case)
    if isinstance(models_list, tuple) and len(models_list) == 2:
        status_code, content = models_list
        return JSONResponse(status_code=status_code, content=content)

    # Success case
    model_dict = {"models": models_list}
    return JSONResponse(content=model_dict)
