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
    except ValidationError:
        # If the email is not valid, return false
        return False, False
