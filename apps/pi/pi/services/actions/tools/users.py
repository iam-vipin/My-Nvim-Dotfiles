"""
Users API tools for Plane user management operations.
"""

from langchain_core.tools import tool

from .base import PlaneToolBase

# Factory wired via CATEGORY_TO_PROVIDER in tools/__init__.py
# Returns LangChain tools implementing user actions


def get_user_tools(method_executor, context):
    """Return LangChain tools for the users category using method_executor and context."""

    @tool
    async def users_get_current() -> str:
        """Get current user information."""
        result = await method_executor.execute("users", "get_current")
        if result["success"]:
            return PlaneToolBase.format_success_response("Successfully retrieved current user", result["data"])
        else:
            return PlaneToolBase.format_error_response("Failed to get current user", result["error"])

    # Get entity search tools relevant only to users
    from .entity_search import get_entity_search_tools

    entity_search_tools = get_entity_search_tools(method_executor, context)
    user_entity_search_tools = [t for t in entity_search_tools if getattr(t, "name", "").find("user") != -1]

    return [users_get_current] + user_entity_search_tools
