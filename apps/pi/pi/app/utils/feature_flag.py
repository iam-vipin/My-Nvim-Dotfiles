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

import logging

import httpx

from pi import settings

logger = logging.getLogger(__name__)
FLAGS = settings.feature_flags


async def is_feature_enabled(feature_flag: str, workspace_slug: str, user_id: str) -> bool:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.FEATURE_FLAG_SERVER_BASE_URL}/api/feature-flags/",
                headers={
                    "x-api-key": settings.FEATURE_FLAG_SERVER_AUTH_TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "workspace_slug": workspace_slug,
                    "user_id": user_id,
                    "flag_key": feature_flag,
                },
                timeout=10,
            )

            if response.status_code == 200:
                resp = response.json()

                if "values" in resp:
                    return resp["values"].get(feature_flag, False)

                return resp.get("value", False)

            logger.error(f"Failed to fetch feature flag. Status code: {response.status_code}")
            return False

    except httpx.RequestError as e:
        logger.error(f"Error checking feature flag: {e}")
        return False
