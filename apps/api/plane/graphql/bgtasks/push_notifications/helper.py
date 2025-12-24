"""Push notification helpers for mobile devices."""

# Python Imports
from typing import Union

# Third Party Imports
import strawberry
from django.conf import settings

# Module Imports
from plane.db.models import Device


def is_mobile_push_notification_disabled() -> bool:
    """
    Check if mobile push notification is disabled.

    Returns:
        True if push notification is disabled, False otherwise.
    """

    if hasattr(settings, "IS_MOBILE_PUSH_NOTIFICATION_ENABLED"):
        return False if settings.IS_MOBILE_PUSH_NOTIFICATION_ENABLED else True
    return True


def fetch_device_tokens_by_user_id(user_id: Union[str, strawberry.ID]) -> list[str]:
    """
    Fetch device tokens for a user.

    Args:
        user_id: User UUID or strawberry ID.

    Returns:
        List of push tokens for the user's active devices.
    """

    device_tokens = []

    try:
        devices = Device.objects.filter(
            user_id=user_id,
            is_active=True,
            push_token__isnull=False,
            deleted_at__isnull=True,
        )
        for device in devices:
            device_tokens.append(device.push_token)
    except Exception as e:
        print(f"Error fetching device tokens: {e}")

    return device_tokens
