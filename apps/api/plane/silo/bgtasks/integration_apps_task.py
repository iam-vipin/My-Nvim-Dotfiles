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

from plane.silo.services.generate_application import create_applications
from celery import shared_task
from logging import getLogger

logger = getLogger("plane.silo.bgtasks")


@shared_task
def create_integration_applications(user_id: str):
    """
    Create all applications for the integrations
    """
    logger.info(f"Creating applications for instance after instance admin creation {user_id}")
    create_applications(user_id)
    logger.info(f"Applications created for instance {user_id}")
    return
