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
from typing import Optional
import logging

# Django imports
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.http import HttpRequest

# Third party imports
from rest_framework.request import Request


# Initialize logger
logger = logging.getLogger("plane.api")


def email_validator(email: str, request: Optional[Request | HttpRequest] = None) -> tuple[bool, bool]:
    """
    Validate the email address using Django's validate_email and ZeroBounce

    returns: Tuple[bool, bool]
        - First value is whether the email is valid
        - Second value is whether the email was verified by ZeroBounce
    """
    if not email:
        return False, False

    try:
        # Check if the email is valid
        validate_email(email)
        return True, True
    except ValidationError:
        # If the email is not valid, return false
        return False, False
