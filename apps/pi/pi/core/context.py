"""
Request-scoped context storage using contextvars.

This module provides async-safe context storage for user information that needs
to be accessible across the entire request lifecycle, including in event listeners
and streaming sessions.

Usage:
    # Set current user (typically in middleware or dependency)
    set_current_user(user)

    # Get current user (in event listeners, services, etc.)
    user = get_current_user_context()

    # Clear context (typically done automatically at end of request)
    clear_current_user()
"""

from contextvars import ContextVar
from typing import TYPE_CHECKING
from typing import Optional

if TYPE_CHECKING:
    from pi.app.schemas.auth import User

# Context variable for storing the current user across async boundaries
# This is thread-safe and async-safe
_current_user_ctx: ContextVar[Optional["User"]] = ContextVar("current_user", default=None)


def set_current_user(user: Optional["User"]) -> None:
    """
    Set the current user in the request context.

    This should be called by authentication dependencies after validating the user.
    The user will be available throughout the request lifecycle.

    Args:
        user: The authenticated User object, or None to clear
    """
    _current_user_ctx.set(user)


def get_current_user_context() -> Optional["User"]:
    """
    Get the current user from the request context.

    Returns:
        The current User object if set, None otherwise.
    """
    return _current_user_ctx.get()


def clear_current_user() -> None:
    """
    Clear the current user from the request context.

    This is typically called automatically at the end of a request,
    but can be called manually if needed.
    """
    _current_user_ctx.set(None)
