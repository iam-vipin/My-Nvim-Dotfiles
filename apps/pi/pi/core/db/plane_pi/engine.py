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

# External imports
# from sqlalchemy.ext.asyncio import AsyncEngine
# from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import create_engine

# Module imports
from pi.config import settings

# Sync Engine with type annotation
sync_engine = create_engine(settings.database.connection_url(), pool_pre_ping=True, echo=False)

# Async Engine with type annotation
# async_engine: AsyncEngine = create_async_engine(settings.database.async_connection_url(), pool_pre_ping=True, echo=False, future=True)
