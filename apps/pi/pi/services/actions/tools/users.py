"""
Users API tools for Plane user management operations.
"""

from typing import Any
from typing import Dict

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing user actions


def get_user_tools(method_executor, context):
    """Return LangChain tools for the users category using method_executor and context."""

    @tool
    async def users_get_current() -> Dict[str, Any]:
        """Get current user information."""
        result = await method_executor.execute("users", "get_current")
        if result["success"]:
            return PlaneToolBase.format_success_payload("Successfully retrieved current user", result["data"])
        else:
            return PlaneToolBase.format_error_payload("Failed to get current user", result["error"])

    return [users_get_current]
