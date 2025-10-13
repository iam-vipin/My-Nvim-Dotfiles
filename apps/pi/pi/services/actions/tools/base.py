"""
Base classes and shared utilities for Plane API tools.
"""

import time
from typing import Any
from typing import Dict
from typing import Optional

from pi import logger

# Lazy imports to avoid circular dependency
# from pi.agents.sql_agent.tools import construct_action_entity_url
# from pi.agents.sql_agent.tools import extract_entity_from_api_response
from pi.config import settings

log = logger.getChild(__name__)


class PlaneToolBase:
    """Base class for Plane API tools with common functionality."""

    @staticmethod
    def get_context_value(context: Dict[str, Any], key: str, default=None):
        """Safely get value from context."""
        return context.get(key, default) if context else default

    @staticmethod
    def auto_fill_context(context: Dict[str, Any], **kwargs):
        """Auto-fill common parameters from context."""
        if kwargs.get("workspace_slug") is None and context:
            kwargs["workspace_slug"] = context.get("workspace_slug")
        if kwargs.get("project_id") is None and context:
            kwargs["project_id"] = context.get("project_id")
        if kwargs.get("user_id") is None and context:
            kwargs["user_id"] = context.get("user_id")
        return kwargs

    @staticmethod
    def format_success_response(message: str, data: Any) -> str:
        """Format successful operation response."""
        return f"✅ {message}\n\nResult: {data}"

    @staticmethod
    async def format_success_response_with_url(message: str, data: Any, entity_type: str, context: Dict[str, Any]) -> str:
        """
        Format successful operation response with entity URL information.

        Args:
            message: Success message
            data: API response data
            entity_type: Type of entity (module, cycle, workitem, project, page)
            context: Context containing workspace_slug and other info

        Returns:
            Formatted response string with URL information
        """

        # Lazy import to avoid circular dependency
        from pi.agents.sql_agent.tools import extract_entity_from_api_response

        # Extract entity data from response
        entity_data = extract_entity_from_api_response(data, entity_type)

        if entity_data:
            # Get workspace slug and frontend URL from context
            workspace_slug = context.get("workspace_slug")
            frontend_url = settings.plane_api.FRONTEND_URL

            # Add workspace_id to context for project ID resolution
            if context.get("workspace_id"):
                entity_data["workspace"] = str(context["workspace_id"])

            # Only proceed if workspace_slug is available
            if workspace_slug:
                # Construct entity URL
                try:
                    # Lazy import to avoid circular dependency
                    from pi.agents.sql_agent.tools import construct_action_entity_url

                    # Since this method is now async, we can directly await the async function
                    url_info = await construct_action_entity_url(entity_data, entity_type, workspace_slug, frontend_url)

                    if url_info:
                        # Include URL information in the response
                        url_section = f"\n\nEntity URL: {url_info["entity_url"]}"
                        url_section += f"\nEntity Name: {url_info["entity_name"]}"
                        url_section += f"\nEntity Type: {url_info["entity_type"]}"
                        url_section += f"\nEntity ID: {url_info["entity_id"]}"

                        # Add human-friendly identifier when available
                        try:
                            identifier_value = None
                            # Work-item unique key
                            if isinstance(url_info, dict) and url_info.get("entity_type") == "workitem" and url_info.get("issue_identifier"):
                                identifier_value = url_info.get("issue_identifier")
                            # Project identifier from entity_data
                            elif entity_type == "project" and isinstance(entity_data, dict) and entity_data.get("identifier"):
                                identifier_value = entity_data.get("identifier")
                            if identifier_value:
                                url_section += f"\nEntity Identifier: {identifier_value}"
                        except Exception:
                            pass

                        return f"✅ {message}\n\nResult: {data}{url_section}"

                except Exception as e:
                    # Log error but continue with basic response
                    log.error(f"Error constructing entity URL: {e}")
            else:
                log.warning(f"No workspace_slug found in context: {context}")
        else:
            log.warning(f"Failed to extract entity data for entity_type: {entity_type}")

        # Fallback to basic response if URL construction fails
        return PlaneToolBase.format_success_response(message, data)

    @staticmethod
    def format_error_response(message: str, error: Any) -> str:
        """Format error response."""
        return f"❌ {message}\n\nError: {error}"

    @staticmethod
    def generate_project_identifier(name: str) -> str:
        """Generate a project identifier from name."""
        # Take first 3-4 characters, remove spaces, convert to uppercase
        base_identifier = "".join(name.split())[:4].upper()
        if len(base_identifier) < 3:
            # If name is too short, pad with 'X' to meet minimum length
            base_identifier = base_identifier.ljust(3, "X")
        return base_identifier

    @staticmethod
    def generate_fallback_identifier(base_identifier: str) -> str:
        """Generate fallback identifier with timestamp."""
        timestamp = str(int(time.time()))[-3:]  # Last 3 digits of timestamp
        return f"{base_identifier}{timestamp}"


def get_workspace_slug_from_context(context: Dict[str, Any]) -> Optional[str]:
    """Extract workspace_slug from context."""
    return context.get("workspace_slug") if context else None


def get_project_id_from_context(context: Dict[str, Any]) -> Optional[str]:
    """Extract project_id from context."""
    return context.get("project_id") if context else None


def get_user_id_from_context(context: Dict[str, Any]) -> Optional[str]:
    """Extract user_id from context."""
    return context.get("user_id") if context else None


def auto_fill_parameters(context: Dict[str, Any], **kwargs) -> Dict[str, Any]:
    """Auto-fill common parameters from context if not provided."""
    result = kwargs.copy()

    if result.get("workspace_slug") is None:
        result["workspace_slug"] = get_workspace_slug_from_context(context)
    if result.get("project_id") is None:
        result["project_id"] = get_project_id_from_context(context)
    if result.get("user_id") is None:
        result["user_id"] = get_user_id_from_context(context)

    return result
