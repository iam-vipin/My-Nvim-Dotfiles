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

# Python imports
import logging
import traceback

# Django imports
from django.conf import settings


def log_exception(e, warning=False):
    # Log the error
    logger = logging.getLogger("plane.exception")

    if warning:
        logger.warning(str(e))
    else:
        logger.exception(e)

    if settings.DEBUG:
        logger.debug(traceback.format_exc())
    return
